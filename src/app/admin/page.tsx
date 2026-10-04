"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Admin() {
  const [name, setName] = useState("");
  const [youths, setYouths] = useState<any[]>([]);
  const [customPoints, setCustomPoints] = useState<{ [key: string]: number }>({});
  const [customReason, setCustomReason] = useState<{ [key: string]: string }>({});

  const fetchYouths = () => fetch('/api/youth').then(res => res.json()).then(setYouths);
  useEffect(() => { fetchYouths(); }, []);

  const handleAddYouth = async () => {
    if(!name) return;
    await fetch('/api/youth', { method: 'POST', body: JSON.stringify({ name, grade: "ثانوي" }) });
    setName(""); fetchYouths();
  }

  const handleAddPoints = async (id: string, points: number, reason: string) => {
    if (!points || points === 0) return alert("برجاء إدخال عدد نقاط صحيح");
    if (!reason) return alert("برجاء إدخال السبب");
    await fetch('/api/points', {
      method: 'POST',
      body: JSON.stringify({ youthId: id, reason, points, servantName: "أدمن" })
    });
    setCustomPoints(prev => ({...prev, [id]: 0}));
    setCustomReason(prev => ({...prev, [id]: ""}));
    fetchYouths();
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h1 className="text-4xl font-bold text-blue-900">لوحة تحكم الخدام</h1>
          <Link href="/admin/logs" className="bg-gray-800 text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-gray-900">
            السجل العام للنقاط 📜
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md mb-8 flex flex-col md:flex-row gap-4 items-end border border-gray-100">
          <div className="flex-1">
            <label className="block text-gray-700 font-bold mb-2">إضافة مخدوم جديد</label>
            <input 
              className="w-full border-2 border-gray-300 p-3 rounded-lg focus:outline-none focus:border-blue-500" 
              value={name} onChange={e => setName(e.target.value)} placeholder="اسم المخدوم..." 
            />
          </div>
          <button onClick={handleAddYouth} className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded-lg shadow">إضافة للقائمة</button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">قائمة المخدومين (تسجيل الحضور والنقاط)</h2>
          <div className="grid gap-6">
            {youths.map(y => (
              <div key={y.id} className="flex flex-col xl:flex-row justify-between items-center p-5 bg-gray-50 border border-gray-200 rounded-xl hover:shadow-md transition">
                
                <div className="text-xl font-bold text-gray-800 mb-4 xl:mb-0 w-full xl:w-1/4">
                  <Link href={`/admin/youth/${y.id}`} className="text-blue-800 hover:underline">{y.name}</Link>
                  <span className="text-sm font-normal text-gray-500 block mt-1">الإجمالي: <strong className="text-blue-600 text-lg">{y.totalPoints}</strong></span>
                </div>
                
                <div className="flex flex-wrap gap-2 w-full xl:w-1/2 justify-center xl:justify-start mb-4 xl:mb-0">
                  <button onClick={() => handleAddPoints(y.id, 50, "القداس")} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded shadow-sm font-bold text-sm">+ 50 (قداس)</button>
                  <button onClick={() => handleAddPoints(y.id, 30, "التسبحة")} className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded shadow-sm font-bold text-sm">+ 30 (تسبحة)</button>
                  <button onClick={() => handleAddPoints(y.id, 20, "العشية")} className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded shadow-sm font-bold text-sm">+ 20 (عشية)</button>
                </div>

                <div className="flex flex-row gap-2 w-full xl:w-auto items-center bg-white p-2 rounded border border-gray-300 shadow-inner">
                  <input 
                    type="number" placeholder="رقم (+ أو -)" 
                    className="border p-2 rounded w-24 text-center font-bold text-sm"
                    value={customPoints[y.id] || ""} onChange={e => setCustomPoints({...customPoints, [y.id]: parseInt(e.target.value)})}
                  />
                  <input 
                    type="text" placeholder="السبب (مكافأة، خصم..)" 
                    className="border p-2 rounded w-36 text-sm"
                    value={customReason[y.id] || ""} onChange={e => setCustomReason({...customReason, [y.id]: e.target.value})}
                  />
                  <button 
                    onClick={() => handleAddPoints(y.id, customPoints[y.id], customReason[y.id])} 
                    className="bg-gray-800 hover:bg-black text-white px-4 py-2 rounded font-bold text-sm">
                    تنفيذ
                  </button>
                </div>

              </div>
            ))}
            {youths.length === 0 && <p className="text-center text-gray-500 py-4">لا يوجد مخدومين مسجلين بعد.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
