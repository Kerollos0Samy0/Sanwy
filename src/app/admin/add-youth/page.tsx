"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AddYouth() {
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("أولى ثانوي");
  const [gender, setGender] = useState("ولد");
  const router = useRouter();

  const handleAddYouth = async () => {
    if (!name) return;
    await fetch('/api/youth', { method: 'POST', body: JSON.stringify({ name, grade, gender }) });
    alert("تم إضافة المخدوم بنجاح!");
    router.push('/admin');
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-100 p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white p-8 rounded-3xl shadow-lg border-2 border-gray-100">
        <div className="flex justify-between items-center mb-8 border-b-2 border-gray-200 pb-4">
          <h1 className="text-3xl font-extrabold text-blue-900">إضافة مخدوم جديد</h1>
          <Link href="/admin" className="text-gray-500 hover:text-gray-800 font-bold text-lg">العودة ←</Link>
        </div>
        
        <div className="flex flex-col gap-6">
          <div>
            <label className="block text-gray-700 font-bold mb-2 text-lg">اسم المخدوم</label>
            <input 
              className="w-full border-2 border-gray-300 p-4 rounded-xl text-lg font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition" 
              value={name} onChange={e => setName(e.target.value)} placeholder="اكتب اسم المخدوم هنا..." 
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-gray-700 font-bold mb-2 text-lg">المرحلة</label>
              <select 
                className="w-full border-2 border-gray-300 p-4 rounded-xl text-lg font-bold text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition bg-white" 
                value={grade} onChange={e => setGrade(e.target.value)}
              >
                <option value="أولى ثانوي">أولى ثانوي</option>
                <option value="تانية ثانوي">تانية ثانوي</option>
                <option value="تالتة ثانوي">تالتة ثانوي</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-gray-700 font-bold mb-2 text-lg">النوع</label>
              <select 
                className="w-full border-2 border-gray-300 p-4 rounded-xl text-lg font-bold text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition bg-white" 
                value={gender} onChange={e => setGender(e.target.value)}
              >
                <option value="ولد">ولد</option>
                <option value="بنت">بنت</option>
              </select>
            </div>
          </div>
          
          <button 
            onClick={handleAddYouth} 
            className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-extrabold px-10 py-5 rounded-2xl shadow-md text-xl transition transform hover:-translate-y-1"
          >
            إضافة للقائمة
          </button>
        </div>
      </div>
    </div>
  );
}
