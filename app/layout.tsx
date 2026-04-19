// app/layout.tsx
import "./globals.css"; // 👈👈👈 هذا هو السطر السحري الذي طار منك!
import { Providers } from "./providers";

export const metadata = {
  title: 'نظام الحضور والانصراف',
  description: 'نظام الحضور والانصراف الذكي',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning> 
      <body className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300 min-h-screen">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}