import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { APP_NAME } from "@/lib/constants";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KidGuardian | Privacy-first child safety assistant",
  description:
    "KidGuardian helps parents and legal guardians track wellbeing signals, detect repeated safety patterns, and create professional reports without covert recording, hidden listening, or automatic accusations.",
  keywords: [
    "KidGuardian",
    "child safety",
    "baby monitor",
    "privacy-first monitoring",
    "guardian-controlled monitoring",
    "child wellbeing",
    "safety signals",
    "family safety",
    "pediatric reports",
    "consent-based monitoring",
  ],
  applicationName: APP_NAME,
  manifest: "/manifest.json",
  metadataBase: new URL("https://kid-guardian.vercel.app"),
  alternates: {
    canonical: "https://kid-guardian.vercel.app",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "KidGuardian | Privacy-first child safety assistant",
    description: "Privacy-first child safety support for transparent, guardian-controlled monitoring.",
    url: "https://kid-guardian.vercel.app",
    siteName: APP_NAME,
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "KidGuardian dashboard preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KidGuardian | Privacy-first child safety assistant",
    description: "Transparent, guardian-controlled child safety support without covert surveillance.",
    images: ["/opengraph-image"],
  },
  icons: {
    icon: "/icon",
    shortcut: "/icon",
    apple: "/apple-icon",
  },
};

export const viewport: Viewport = {
  themeColor: "#2F8F7A",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-[color:var(--color-background)] text-[color:var(--color-foreground)] antialiased">
        {children}
      </body>
    </html>
  );
}
