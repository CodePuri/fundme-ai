type RateLimitRecord = {
  count: number;
  resetAt: number;
};

const rateLimitMap = new Map<string, RateLimitRecord>();

// Clean up expired entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      if (now > record.resetAt) {
        rateLimitMap.delete(key);
      }
    }
  }, 300_000).unref?.();
}

export type RateLimitConfig = {
  maxRequests: number;
  windowMs: number;
};

export type RequestLike = {
  headers: Headers | { get(header: string): string | null };
};

export function checkRateLimit(
  req: RequestLike,
  action: string,
  config: RateLimitConfig = { maxRequests: 10, windowMs: 60_000 }
): { allowed: boolean; remaining: number; resetInMs: number } {
  // Extract client identifier (X-Forwarded-For, CF-Connecting-IP, or fallback)
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : (req.headers.get("cf-connecting-ip") || "127.0.0.1");
  const key = `${action}:${ip}`;
  const now = Date.now();

  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, remaining: config.maxRequests - 1, resetInMs: config.windowMs };
  }

  if (record.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetInMs: record.resetAt - now };
  }

  record.count += 1;
  return { allowed: true, remaining: config.maxRequests - record.count, resetInMs: record.resetAt - now };
}

export function createRateLimitResponse(resetInMs: number): Response {
  const retrySeconds = Math.ceil(resetInMs / 1000);
  return new Response(
    JSON.stringify({ ok: false, error: "Too many requests. Please slow down." }),
    {
      status: 429,
      headers: {
        "Retry-After": String(retrySeconds),
        "Content-Type": "application/json",
      },
    }
  );
}
