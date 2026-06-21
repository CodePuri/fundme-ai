import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/app/", "/profile/", "/settings/"],
    },
    sitemap: "https://tryfundme.in/sitemap.xml",
  };
}
