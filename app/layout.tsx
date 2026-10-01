import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import CartLink from "@/components/CartLink";
import AuthButtons from "@/components/AuthButtons";

export const metadata: Metadata = {
  title: "Octavius Technologies",
  description: "Laptops, phones and accessories — delivered.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <header className="site-header">
            <div className="container header-inner">
              <Link href="/" className="logo">
                <span className="logo-mark">O</span>
                <span>Octavius <span className="logo-light">Technologies</span></span>
              </Link>
              <nav className="nav">
                <Link href="/">Shop</Link>
                <CartLink />
                <AuthButtons />
              </nav>
            </div>
          </header>
          <main className="container main">{children}</main>
          <footer className="site-footer">
            <div className="container">© {new Date().getFullYear()} Octavius Technologies</div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
