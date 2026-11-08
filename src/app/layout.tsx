import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Vendora AI — Your AI. Your Store. Your Commerce Engine.",
  description: "AI-powered dropshipping and ecommerce automation platform.",
  openGraph: {
    siteName: "Vendora AI",
    title: "Vendora AI — Your AI. Your Store. Your Commerce Engine.",
    description: "AI-powered dropshipping and ecommerce automation platform.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-background text-text font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
