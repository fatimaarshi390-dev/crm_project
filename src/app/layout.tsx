import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Inter,
  Orbitron,
} from "next/font/google";
import { Theme } from "@radix-ui/themes";
import "./globals.css";
import { cn } from "@/lib/utils";

import { Toaster } from "sonner";
//import { ThemeProvider } from 'next-themes';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["500", "700", "800"],
  variable: "--font-orbitron",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CRM Digital System",
  description: "Next-Generation CRM Engineered for Excellence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        inter.variable,
        orbitron.variable,
        "font-sans"
      )}
    >
      <body className="min-h-full flex flex-col">
       
        <Theme>
        {children}

        <Toaster
          position="top-center"
          richColors
          closeButton
        />
        </Theme>
     
      </body>
    </html>
  );
}