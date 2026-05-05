import db from "@/lib/db";
import CashView from "./CashView";

export default async function CashPage() {
  const transactions = await db.cashTransaction.findMany({
    include: { employee: true },
    orderBy: { createdAt: "desc" },
  });

  const employees = await db.employee.findMany();

  // 🔥 تحويل Date → string
  const formatted = transactions.map(t => ({
    ...t,
    createdAt: t.createdAt.toISOString(),
  }));

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-black mb-6">إدارة النقدية</h1>
      <CashView initialTransactions={formatted} employees={employees} />
    </div>
  );
}