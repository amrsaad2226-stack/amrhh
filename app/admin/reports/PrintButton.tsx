'use client'; // 👈 هذا هو السر، جعل الزر يعمل من جهة العميل

import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()} 
      className="bg-white text-slate-700 px-5 py-3 rounded-2xl font-bold border shadow-sm flex items-center gap-2 hover:bg-slate-50 no-print"
    >
      <Printer size={18} /> طباعة التقرير
    </button>
  );
}
