// app/layout.tsx
import './globals.css'
import { Toaster } from 'sonner';

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
    <html lang="ar" dir="rtl">
      <head>
        {/* هذا السطر يمنع الموبايل من عمل Zoom عند الكتابة ويجعلها تبدو كتطبيق */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </head>
      <body>
        {children}
        <Toaster position="bottom-center" richColors />
      </body>
    </html>
  );
}
