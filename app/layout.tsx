import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CompareX — Student Housing, Mobile, Transport & More | Austria & Italy",
    template: "%s | CompareX",
  },
  description:
    "Compare student housing, mobile plans, transport, gyms and streaming in Vienna, Milan and beyond. AI-powered search and package builder for international students in Austria and Italy.",
  keywords: [
    "student housing Vienna",
    "student housing Milan",
    "student mobile plans Austria",
    "student mobile plans Italy",
    "Vienna public transport student",
    "student gym Vienna",
    "compare student offers",
    "student life Austria",
    "student life Italy",
    "package builder students",
    "AI student search",
    "CompareX",
  ],
  authors: [{ name: "CompareX" }],
  creator: "CompareX",
  publisher: "CompareX",
  openGraph: {
    title: "CompareX — Compare better. Choose better.",
    description:
      "Find the best student housing, mobile, transport, gym and streaming deals in Austria and Italy. Build your perfect monthly package.",
    type: "website",
    locale: "en_US",
    siteName: "CompareX",
  },
  twitter: {
    card: "summary_large_image",
    title: "CompareX — Student offers in Austria & Italy",
    description:
      "AI-powered comparison of housing, mobile, transport and more for students.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
