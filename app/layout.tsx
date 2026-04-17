// app/layout.tsx
import './globals.css'
import { Toaster } from 'sonner'; // 👈 أضف هذا الاستيراد

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        {children}
        {/* 👈 أضف هذا السطر هنا لتفعيل الإشعارات في كل الصفحات */}
        <Toaster position="bottom-center" richColors theme="light" />
      </body>
    </html>
  )
}
