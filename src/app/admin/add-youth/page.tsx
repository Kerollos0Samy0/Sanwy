"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AddYouth() {
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("أولى ثانوي");
  const [gender, setGender] = useState("ولد");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleAddYouth = async () => {
    if (!name.trim()) return alert("برجاء إدخال اسم المخدوم");
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/youth', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), grade, gender }) 
      });
      if (res.ok) {
        alert("تم إضافة المخدوم بنجاح!");
        router.push('/admin');
      } else {
        alert("حدث خطأ أثناء الإضافة");
      }
    } catch {
      alert("حدث خطأ في الاتصال");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-100 p-3 sm:p-6 md:p-8 flex items-center justify-center text-gray-900">
      <div className="max-w-xl w-full bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-3">
          <h1 className="text-xl sm:text-2xl font-black text-blue-900 flex items-center gap-2">
            <span>➕</span> إضافة مخدوم جديد
          </h1>
          <Link href="/admin" className="text-gray-500 hover:text-black font-bold text-xs sm:text-sm">
            العودة ←
          </Link>
        </div>
        
        <div className="flex flex-col gap-4 sm:gap-5">
          <div>
            <label className="block text-gray-700 font-bold mb-1.5 text-xs sm:text-sm">اسم المخدوم ثلاثي أو رباعي</label>
            <input 
              className="w-full border-2 border-gray-200 p-3 rounded-xl text-base sm:text-lg font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 bg-white" 
              value={name} onChange={e => setName(e.target.value)} placeholder="مثال: بيشوي سامح يوسف..." 
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-gray-700 font-bold mb-1.5 text-xs sm:text-sm">المرحلة الدراسية</label>
              <select 
                className="w-full border-2 border-gray-200 p-3 rounded-xl text-sm sm:text-base font-bold text-gray-900 focus:outline-none focus:border-blue-500 bg-white" 
                value={grade} onChange={e => setGrade(e.target.value)}
              >
                <option value="أولى ثانوي">أولى ثانوي</option>
                <option value="ثانية ثانوي">ثانية ثانوي</option>
                <option value="ثالثة ثانوي">ثالثة ثانوي</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-1.5 text-xs sm:text-sm">النوع</label>
              <select 
                className="w-full border-2 border-gray-200 p-3 rounded-xl text-sm sm:text-base font-bold text-gray-900 focus:outline-none focus:border-blue-500 bg-white" 
                value={gender} onChange={e => setGender(e.target.value)}
              >
                <option value="ولد">👦 ولد</option>
                <option value="بنت">👧 بنت</option>
              </select>
            </div>
          </div>
          
          <button 
            onClick={handleAddYouth} 
            disabled={isSubmitting}
            className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 rounded-xl shadow-xs text-base sm:text-lg transition active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? "جاري الإضافة..." : "حفظ وإضافة للقائمة ✅"}
          </button>
        </div>
      </div>
    </div>
  );
}
