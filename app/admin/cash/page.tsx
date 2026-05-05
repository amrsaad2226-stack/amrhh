// app/admin/cash/page.tsx
import db from "@/lib/db";
import CashView from "../CashView";

export default async function CashPage() {
  
  const cashTransactions = await db.cashTransaction.findMany({
    include: { employee: true },
    orderBy: { createdAt: 'desc' }
  });

  const employees = await db.employee.findMany();

  return (
     <div className="min-h-screen bg-slate-50 p-4 md:p-10 font-sans text-right" dir="rtl">
        <div className="max-w-7xl mx-auto">
             <h1 className="text-3xl font-black text-slate-800 mb-8">النقدية والعهدة</h1>
             <CashView transactions={cashTransactions} employees={employees} />
        </div>
    </div>
  );
}
