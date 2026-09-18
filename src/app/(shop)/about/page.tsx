import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
    title: "About Us",
    description: `Learn about ${SITE_NAME} — Bangladesh's trusted online toy store.`,
    alternates: { canonical: "/about" },
};

const AboutPage = () => {
    return (
        <div className="mx-auto max-w-3xl px-4 py-10">
            <h1 className="text-2xl font-bold">About {SITE_NAME}</h1>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-neutral-600">
                <p>
                    {SITE_NAME} is Bangladesh&apos;s trusted online destination
                    for quality toys. We bring safe, fun, and affordable toys to
                    families across the country, with fast delivery and
                    cash-on-delivery payment for your peace of mind.
                </p>
                <p>
                    Our mission is simple: make it easy for parents to find toys
                    their kids will love, without the hassle of visiting
                    multiple stores. Every product we sell is carefully selected
                    for quality and safety.
                </p>
            </div>
        </div>
    );
};

export default AboutPage;
