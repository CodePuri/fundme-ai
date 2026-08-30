import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const isProd = process.env.VERCEL_ENV === "production" || process.env.NEXT_PUBLIC_APP_URL === "https://tryfundme.in";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/assessment", "/explore", "/search", "/startup-programs", "/share/"],
      disallow: [
        "/api/",
        "/app/",
        "/profile/",
        "/settings/",
        "/login",
        "/sign-in/",
        "/sign-up/",
        "/account-save",
        "/assessment/analyzing",
        "/assessment/result",
        "/assessment/questions",
        "/assessment/mentor",
      ],
    },
    sitemap: "https://tryfundme.in/sitemap.xml",
    host: "https://tryfundme.in",
  };
}
