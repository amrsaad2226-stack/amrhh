// app/layout.tsx
import { Metadata } from "next";
import './globals.css'
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: "نظام الحضور الذكي",
  description: "بوابة الموظفين والمديرين",
  manifest: "/manifest.json", // 👈 هذا السطر هو السر
  themeColor: "#2563eb",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "نظام الحضور",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body>
        {children}
        <Toaster position="bottom-center" richColors theme="light" />
      </body>
    </html>
  );
}
