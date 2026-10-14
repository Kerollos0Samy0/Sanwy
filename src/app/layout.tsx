import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#1e3a8a",
};

export const metadata: Metadata = {
  title: "ثانوي - القديسة رفقة",
  description: "نظام متابعة نقاط وحضور شباب ثانوي - كنيسة القديسة رفقة",
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-gray-900 overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
