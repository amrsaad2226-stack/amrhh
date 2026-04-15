// app/admin/page.tsx
import db from "@/lib/db";
import AddEmployeeForm from "./AddEmployeeForm";

export default async function AdminDashboard() {
  // جلب تاريخ اليوم
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // جلب الفروع من قاعدة البيانات
  const branches = await db.branch.findMany({ select: { id: true, name: true } });

  // جلب كل الموظفين مع سجلات حضورهم لليوم فقط
  const employees = await db.employee.findMany({
    include: {
      attendances: {
        where: { date: today }
      }
    },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-sans" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-gray-800 border-r-4 border-blue-600 pr-4">لوحة تحكم المدير 🖥️</h1>
          <AddEmployeeForm branches={branches} />
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {employees.map((emp) => {
            const attendance = emp.attendances[0]; // سجل حضور اليوم إن وجد
            
            return (
              <div key={emp.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{emp.name}</h2>
                    <p className="text-gray-400 text-xs">كود: {emp.code} | {emp.department}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    attendance ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {attendance ? "حضر" : "غائب"}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>وقت الحضور الفعلي:</span>
                    <span className="font-mono font-bold text-blue-600">
                      {attendance?.checkIn ? new Date(attendance.checkIn).toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'}) : "--:--"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>الحالة:</span>
                    <span className={`font-bold ${attendance?.status === "Late" ? "text-orange-500" : "text-green-600"}`}>
                      {attendance?.status === "Late" ? "متأخر ⚠️" : attendance?.status === "Present" ? "في الموعد ✅" : "لم يحضر"}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-50 flex gap-2">
                   {/* زرار لتصفير بصمة الجهاز (سنقوم ببرمجته لاحقاً) */}
                   <button className="text-[10px] bg-gray-100 text-gray-500 px-3 py-1 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors">
                     إعادة تعيين الجهاز 📱
                   </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}