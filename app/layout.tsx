import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { Toaster } from "@/components/ui/sonner";
import { Suspense } from "react";
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
  title: "WarishLabs — Premium Software Engineering Laboratory",
  description: "Constructing immersive 3D architectures, developer utilities, and resilient distributed platforms.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
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
        </body>
      </html>
    </ClerkProvider>
  );
}
