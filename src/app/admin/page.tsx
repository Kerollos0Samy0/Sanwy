"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Admin() {
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("أولى ثانوي");
  const [youths, setYouths] = useState<any[]>([]);
  const [customPoints, setCustomPoints] = useState<{ [key: string]: number }>({});
  const [customReason, setCustomReason] = useState<{ [key: string]: string }>({});

  const fetchYouths = () => fetch('/api/youth').then(res => res.json()).then(setYouths);
  useEffect(() => { fetchYouths(); }, []);

  const handleAddYouth = async () => {
    if(!name) return;
    await fetch('/api/youth', { method: 'POST', body: JSON.stringify({ name, grade }) });
    setName(""); fetchYouths();
  }

  const handleAddPoints = async (id: string, points: number, reason: string) => {
    if (!points || points === 0) return alert("برجاء إدخال عدد نقاط صحيح");
    if (!reason) return alert("برجاء إدخال السبب");
    const res = await fetch('/api/points', {
      method: 'POST',
      body: JSON.stringify({ youthId: id, reason, points, servantName: "أدمن" })
    });
    const data = await res.json();
    if (reason === "القداس") {
      alert(`تم إضافة ${data.log.points} نقطة للقداس (حسب التكرار هذا الأسبوع)`);
    }
    setCustomPoints(prev => ({...prev, [id]: 0}));
    setCustomReason(prev => ({...prev, [id]: ""}));
    fetchYouths();
  }

  return (
    <div dir="rtl" className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6 border-b-2 border-gray-200 pb-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900">لوحة تحكم الخدام</h1>
        </div>
        
        {/* Top Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Link href="/admin/scan" className="flex-1 min-w-[140px] bg-blue-600 hover:bg-blue-700 text-white font-bold px-2 py-6 rounded-2xl shadow-md text-lg text-center flex flex-col items-center justify-center transition transform hover:-translate-y-1">
            <span className="text-3xl mb-2">📷</span>
            الكاميرا (QR)
          </Link>
          <Link href="/admin/cards" className="flex-1 min-w-[140px] bg-purple-600 hover:bg-purple-700 text-white font-bold px-2 py-6 rounded-2xl shadow-md text-lg text-center flex flex-col items-center justify-center transition transform hover:-translate-y-1">
            <span className="text-3xl mb-2">🖨️</span>
            طباعة الكارنيهات
          </Link>
          <Link href="/dashboard" className="flex-1 min-w-[140px] bg-green-600 hover:bg-green-700 text-white font-bold px-2 py-6 rounded-2xl shadow-md text-lg text-center flex flex-col items-center justify-center transition transform hover:-translate-y-1">
            <span className="text-3xl mb-2">📊</span>
            لوحة الأبطال
          </Link>
          <Link href="/admin/efteqad" className="flex-1 min-w-[140px] bg-red-600 hover:bg-red-700 text-white font-bold px-2 py-6 rounded-2xl shadow-md text-lg text-center flex flex-col items-center justify-center transition transform hover:-translate-y-1">
            <span className="text-3xl mb-2">🔍</span>
            الافتقاد
          </Link>
          <Link href="/admin/logs" className="flex-1 min-w-[140px] bg-gray-800 hover:bg-black text-white font-bold px-2 py-6 rounded-2xl shadow-md text-lg text-center flex flex-col items-center justify-center transition transform hover:-translate-y-1">
            <span className="text-3xl mb-2">📜</span>
            سجل النقاط
          </Link>
        </div>
        
        {/* Add New Youth Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-end border border-gray-200">
          <div className="flex-1 w-full">
            <label className="block text-gray-700 font-bold mb-2">إضافة مخدوم جديد</label>
            <input 
              className="w-full border-2 border-gray-300 p-4 rounded-xl text-lg font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" 
              value={name} onChange={e => setName(e.target.value)} placeholder="اكتب اسم المخدوم هنا..." 
            />
          </div>
          <div className="w-full md:w-1/4">
            <label className="block text-gray-700 font-bold mb-2">المرحلة</label>
            <select 
              className="w-full border-2 border-gray-300 p-4 rounded-xl text-lg font-bold text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" 
              value={grade} onChange={e => setGrade(e.target.value)}
            >
              <option value="أولى ثانوي">أولى ثانوي</option>
              <option value="تانية ثانوي">تانية ثانوي</option>
              <option value="تالتة ثانوي">تالتة ثانوي</option>
            </select>
          </div>
          <button onClick={handleAddYouth} className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-bold px-10 py-4 rounded-xl shadow-md text-lg transition">إضافة للقائمة</button>
        </div>

        {/* Youth List */}
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">قائمة المخدومين (تسجيل الحضور والنقاط)</h2>
          <div className="grid gap-6">
            {youths.map(y => (
              <div key={y.id} className="flex flex-col xl:flex-row justify-between items-start xl:items-center p-5 bg-white border-2 border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition gap-6">
                
                {/* Name and Points Section */}
                <div className="text-right w-full xl:w-1/4 border-b-2 xl:border-b-0 border-gray-100 pb-4 xl:pb-0">
                  <Link href={`/admin/youth/${y.id}`} className="text-2xl font-black text-blue-900 hover:text-blue-600 hover:underline block">{y.name}</Link>
                  <span className="text-md font-bold text-gray-500 mt-2 block">
                    الإجمالي: <strong className="text-blue-700 text-3xl mx-2">{y.totalPoints}</strong> نقطة
                  </span>
                </div>
                
                {/* Quick Add Buttons */}
                <div className="flex flex-wrap gap-2 md:gap-3 w-full xl:w-auto">
                  <button onClick={() => handleAddPoints(y.id, 50, "القداس")} className="flex-1 md:flex-none bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border-2 border-blue-200 px-5 py-3 rounded-xl font-bold text-sm md:text-base transition">القداس (50/10)</button>
                  <button onClick={() => handleAddPoints(y.id, 20, "التناول")} className="flex-1 md:flex-none bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white border-2 border-teal-200 px-5 py-3 rounded-xl font-bold text-sm md:text-base transition">التناول (+20)</button>
                  <button onClick={() => handleAddPoints(y.id, 30, "التسبحة")} className="flex-1 md:flex-none bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white border-2 border-purple-200 px-5 py-3 rounded-xl font-bold text-sm md:text-base transition">التسبحة (+30)</button>
                  <button onClick={() => handleAddPoints(y.id, 20, "العشية")} className="flex-1 md:flex-none bg-orange-50 hover:bg-orange-500 text-orange-700 hover:text-white border-2 border-orange-200 px-5 py-3 rounded-xl font-bold text-sm md:text-base transition">العشية (+20)</button>
                </div>

                {/* Custom Add/Deduct */}
                <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto items-center bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <input 
                    type="number" placeholder="الرقم (+ أو -)" 
                    className="w-full sm:w-32 border-2 border-gray-400 p-3 rounded-lg text-center font-black text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                    value={customPoints[y.id] || ""} onChange={e => setCustomPoints({...customPoints, [y.id]: parseInt(e.target.value)})}
                  />
                  <input 
                    type="text" placeholder="السبب (مثال: خصم)" 
                    className="w-full sm:w-48 border-2 border-gray-400 p-3 rounded-lg text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none font-bold"
                    value={customReason[y.id] || ""} onChange={e => setCustomReason({...customReason, [y.id]: e.target.value})}
                  />
                  <button 
                    onClick={() => handleAddPoints(y.id, customPoints[y.id], customReason[y.id])} 
                    className="w-full sm:w-auto bg-gray-800 hover:bg-black text-white px-6 py-3 rounded-lg font-bold shadow-md transition">
                    تأكيد
                  </button>
                </div>

              </div>
            ))}
            {youths.length === 0 && <p className="text-center text-gray-500 py-10 font-bold text-xl">لا يوجد مخدومين مسجلين بعد.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
