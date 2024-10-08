import type { Metadata } from "next";
import localFont from "next/font/local";
import { Orbitron, Aldrich } from "next/font/google";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const orbitron = Orbitron({ subsets: ["latin"], variable: "--font-orbitron" });
const aldrich = Aldrich({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-aldrich",
});

export const metadata: Metadata = {
  title: "Immerse the Bay | Stanford",
  description: "Immerse the Bay, Stanford University's leading XR hackathon",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${orbitron.variable} ${geistSans.variable} ${geistMono.variable} ${aldrich.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
