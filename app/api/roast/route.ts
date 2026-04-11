import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json() as {
    name?: string;
    companyName?: string;
    notes?: string;
    websiteUrl?: string;
    linkedInUrl?: string;
    xUrl?: string;
    files?: string[];
  };

  const {
    name,
    companyName,
    notes,
    websiteUrl,
    linkedInUrl,
    xUrl,
    files = [],
  } = body;

  const systemPrompt = `You are a brutally savage partner at a top-tier VC fund who has reviewed over 10,000 pitch decks. You have zero tolerance for vague startup language, buzzwords, wishful thinking, or generic market sizing. Your job is to roast this founder's pitch with surgical precision and absolutely no mercy. Be devastatingly specific about their weaknesses. Be funny. Be brutal. Do not offer encouragement. Do not soften any blows. Do not end on a positive note. Do not say anything like "but here's how you could improve." This is a roast, not a coaching session.`;

  const userPrompt = `Here is everything I know about this founder and their startup:

Name: ${name || "Not provided"}
Company: ${companyName || "Not provided"}
Website: ${websiteUrl || "Not provided"}
LinkedIn: ${linkedInUrl || "Not provided"}
X (Twitter): ${xUrl || "Not provided"}
Uploaded materials: ${files.length > 0 ? files.join(", ") : "None uploaded"}

Their pitch in their own words:
${notes || "They didn't even bother writing a pitch."}

Roast them end to end. Cover their founder story, their pitch, their business model, their market positioning, and anything else you can find to destroy. End with a one-line killer verdict.`;

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.9,
        max_tokens: 1200,
      }),
    });

    if (!groqRes.ok) {
      return NextResponse.json({ error: "GROQ request failed" }, { status: 500 });
    }

    const data = await groqRes.json() as {
      choices: Array<{ message: { content: string } }>;
    };

    const roast = data.choices[0]?.message?.content ?? "We couldn't complete the roast right now. Consider that a brief mercy — it won't last.";

    return NextResponse.json({ roast });
  } catch {
    return NextResponse.json(
      { roast: "We couldn't complete the roast right now. Consider that a brief mercy — it won't last." },
      { status: 200 }
    );
  }
}
