import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maze Puzzle Runner",
  description: "A dynamic maze puzzle game with shifting parts, gates, and enemies",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
