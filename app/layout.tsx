import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Post Management - PRN232 Exam",
  description: "Post management application built with Next.js and .NET",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50">
        {children}
      </body>
    </html>
  );
}
