import { Poppins } from "next/font/google"; // Poppins fontunu içe aktarıyoruz
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Poppins fontunu tanımla
const poppins = Poppins({
  variable: "--font-poppins", // CSS değişkeni
  subsets: ["latin"], // Latin karakter desteği
  weight: ["300", "400", "500", "600", "700", "800", "900"], // Farklı kalınlıklar
});

export const metadata: Metadata = {
  title: "Google Maps Scraper - KonarWorks",
  description: "Google Maps Scraper by KonarWorks",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} h-full w-full`}>
      <body className="flex flex-col h-screen font-sans">
        <Navbar />
        <main className="h-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
