import type React from "react";
import type { Metadata } from "next";
import { Inter, Roboto } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "CloudIO - File Storage Dashboard",
  description: "A modern file storage dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link
            href="https://fonts.googleapis.com/icon?family=Material+Icons"
            rel="stylesheet"
          />
        </head>
        <body className={`${inter.variable} ${roboto.variable} font-sans`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
