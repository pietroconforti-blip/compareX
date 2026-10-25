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
    default: "CompareX — Compare better. Choose better.",
    template: "%s | CompareX",
  },
  description:
    "Find the right combination of housing, mobile plans, transport and more for student life in Austria and Italy — all in one place.",
  keywords: [
    "student housing",
    "mobile plans",
    "Vienna",
    "Austria",
    "Italy",
    "compare offers",
    "student life",
  ],
  authors: [{ name: "CompareX" }],
  openGraph: {
    title: "CompareX — Compare better. Choose better.",
    description:
      "Find the right combination of housing, mobile plans, transport and more for student life.",
    type: "website",
    locale: "en_US",
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
