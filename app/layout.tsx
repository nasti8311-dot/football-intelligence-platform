import type { Metadata } from "next";
import "./globals.css";

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
      </body>
    </html>
  );
}
