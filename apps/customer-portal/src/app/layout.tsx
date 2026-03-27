import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { Providers } from "@/providers";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Customer Portal",
  description: "Craft Apex - Customer Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", GeistSans.variable)}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
