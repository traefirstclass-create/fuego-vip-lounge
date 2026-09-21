import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reserve Your VIP Experience | Fuego VIP Lounge",
  description: "Select your night and choose an available section directly from the Fuego VIP Lounge floor plan.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-fuego-black text-white antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
