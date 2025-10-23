import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maze Puzzle Runner",
  description: "A turn-based maze puzzle with walls, enemies, and an exit to reach",
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
