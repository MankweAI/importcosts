import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

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
    default: "ImportCosts - Import Duty, VAT & Landed Cost Calculator for South Africa",
    template: "%s | ImportCosts",
  },
  description:
    "Calculate import duties, VAT, and landed costs for products imported into South Africa. Instant estimates with document checklists and compliance guidance.",
  keywords: [
    "import duty calculator",
    "landed cost calculator",
    "South Africa import",
    "VAT calculator",
    "customs duty",
    "import costs",
    "HS code",
  ],
  authors: [{ name: "ImportCosts" }],
  creator: "ImportCosts",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://www.importcosts.co.za"),
  openGraph: {
    type: "website",
    locale: "en_ZA",
    siteName: "ImportCosts",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
