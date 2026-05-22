import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import PremiumFooter from "@/components/layout/PremiumFooter";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Football IQ",
  description: "KI-Fußballplattform für Picks, Wahrscheinlichkeiten und Risiko-Kontrolle.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="bg-neutral-950 text-white antialiased">
        {children}
        <Footer />
<PremiumFooter /></body>
    </html>
  );
}
