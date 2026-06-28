import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { Toaster } from "@/components/ui/sonner";
import { Suspense } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://warishlabs.in'),
  title: {
    default: 'WarishLabs — Engineering-First Software Laboratory',
    template: '%s | WarishLabs',
  },
  description: 'WarishLabs builds production-grade SaaS platforms, developer tools, and distributed systems engineered for scale.',
  keywords: ['WarishLabs', 'warishlabs', 'warish labs', 'warish','SaaS', 'Next.js', 'TypeScript', 'Full Stack', 'Developer Tools'],
  authors: [{ name: 'MD Warish Ansari', url: 'https://portfolio.warishlabs.in' }],
  creator: 'MD Warish Ansari',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://warishlabs.in',
    siteName: 'WarishLabs',
    title: 'WarishLabs — Engineering-First Software Laboratory',
    description: 'Production-grade SaaS platforms, developer tools, and distributed systems.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'WarishLabs' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WarishLabs',
    description: 'Engineering-First Software Laboratory',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        theme: dark,
        variables: {
          colorPrimary: '#3B82F6',        // Blue primary
          colorBackground: '#020b1a',     // Dark slate blue bg
          borderRadius: '0.5rem',
        },
        elements: {
          card: 'shadow-[0_0_40px_rgba(59,130,246,0.15)] border border-white/8 bg-[#020b1a]',
          formButtonPrimary: 'bg-blue-600 hover:bg-blue-500 font-semibold transition-all',
        }
      }}
    >
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
        data-scroll-behavior="smooth"
      >
        <body className="min-h-full flex flex-col bg-black text-white">
          <Suspense fallback={null}>
            <AnalyticsProvider>
              <TooltipProvider>
                {children}
              </TooltipProvider>
            </AnalyticsProvider>
          </Suspense>
          <Toaster theme="dark" position="top-right" />
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  );
}
