import db from "@/lib/db";
import AdminRequestsView from "./AdminRequestsView"; // تأكد من المسار

export default async function AdminRequestsPage() {
  // جلب الطلبات التي تنتظر الموافقة فقط مع بيانات الموظف
  const pendingRequests = await db.cashAdvanceRequest.findMany({
    where: { status: "Pending" },
    include: { employee: true }, // نحتاج اسم الموظف للعرض
    orderBy: { createdAt: 'asc' } // الأقدم أولاً
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 font-sans text-right" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-black text-slate-800 mb-8">إدارة طلبات السلف</h1>
        
        {/* تمرير البيانات لمكون العرض والتفاعل */}
        <AdminRequestsView pendingRequests={pendingRequests} />
      </div>
    </div>
  );
}