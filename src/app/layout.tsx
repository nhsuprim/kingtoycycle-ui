import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from "../lib/constants";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MetaPixel from "@/components/shared/MetaPixel";
import {
    GoogleTagManagerNoscript,
    GoogleTagManagerScript,
} from "@/components/shared/GoogleTagManager";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: `${SITE_NAME} — Quality Toys Delivered Fast in Bangladesh`,
        template: `%s | ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    openGraph: {
        type: "website",
        locale: "en_BD",
        siteName: SITE_NAME,
        title: SITE_NAME,
        description: SITE_DESCRIPTION,
    },
    twitter: {
        card: "summary_large_image",
        title: SITE_NAME,
        description: SITE_DESCRIPTION,
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" className={inter.variable}>
            <body className="font-sans antialiased" cz-shortcut-listen="true">
                <GoogleTagManagerNoscript />
                <GoogleTagManagerScript />
                <MetaPixel />
                {children}
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar
                />
            </body>
        </html>
    );
}
