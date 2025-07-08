import type { Metadata } from "next";
import { Orbitron } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VibOS - The Missing Link for Humanoid Robots",
  description:
    "VibOS is the missing link for humanoid robots, providing voice, intelligence, and behavior capabilities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${orbitron.variable}antialiased`}>{children}</body>
    </html>
  );
}
