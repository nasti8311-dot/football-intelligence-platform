import "./globals.css";
import Link from "next/link";
import BackgroundFX from "@/components/BackgroundFX";
import MobileBottomNav from "@/components/MobileBottomNav";
import Footer from "@/components/Footer";
import BrandMark from "@/components/BrandMark";
import AuthButton from "@/components/AuthButton";
import UserActivityTracker from "@/components/UserActivityTracker";

export const metadata = {
  title: "Daily Football Predictions",
  description: "Daily top football predictions with odds markets and team form",
};

const nav = [
  ["/", "Top 10"],
  ["/news", "News"],
  ["/dashboard", "Dashboard"],
  ["/methodology", "Method"],
  ["/prediction-performance", "Performance"],
  ["/elo-ratings", "Ratings"],
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <head>
        <script
          defer
          data-domain="football-intelligence-platform-tau.vercel.app"
          src="https://plausible.io/js/script.js"
        />
      </head>
      <body className="bg-slate-950 text-white">
        <BackgroundFX />

          <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 px-4 py-3 backdrop-blur-2xl">
            <div className="mx-auto flex max-w-6xl items-center justify-between">
              <Link href="/" className="font-black text-cyan-300">
                <BrandMark />
              </Link>

              <nav className="hidden gap-3 md:flex">
                {nav.map(([href, label]) => (
                  <Link
                    key={href}
                    href={href}
                    className="rounded-xl px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/10 hover:text-cyan-300"
                  >
                    {label}
                  </Link>
                ))}
              </nav>

              <AuthButton />
            </div>
          </header>

          <UserActivityTracker />
        <main className="relative z-10">{children}</main>

        <Footer />
        <MobileBottomNav />
      </body>
    </html>
  );
}
