import "./globals.css";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Email Generator",
  description: "Safe HTML email editor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
