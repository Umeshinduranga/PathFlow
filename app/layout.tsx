import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "PathFlow - AI-Powered Learning Path Generator",
    description:
        "Transform your skills into your dream career with personalized, AI-generated learning roadmaps tailored just for you.",
    keywords: ["learning path", "career", "AI", "education", "skills"],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Ubuntu+Mono:wght@400;700&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body>{children}</body>
        </html>
    );
}
