import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

const robots = (): MetadataRoute.Robots => {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: [
                    "/admin",
                    "/login",
                    "/cart",
                    "/checkout",
                    "/order-success",
                ],
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
};

export default robots;
