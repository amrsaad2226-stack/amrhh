
// app/layout.tsx
import './globals.css'
import { Toaster } from 'sonner';
import { Providers } from "./providers"; // 👈 استيراد الـ Providers

export const metadata = {
  title: "نظام الحضور",
  // هذه السطور هي التي تظهر خيار "التثبيت" وتخفي شريط المتصفح
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "نظام الحضور",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // 👈 أضف suppressHydrationWarning هنا لكي لا يشتكي Next.js من تغيير الـ class
    <html lang="ar" dir="rtl" class="dark" suppressHydrationWarning>
      <head>
        {/* هذا السطر يمنع الموبايل من عمل Zoom عند الكتابة ويجعلها تبدو كتطبيق */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </head>
      <body className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300 min-h-screen">
        <Providers>
          {children}
          <Toaster position="bottom-center" richColors theme="system" />
        </Providers>
      </body>
    </html>
  );
}
