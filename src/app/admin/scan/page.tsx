"use client";
import { useState, useEffect } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import Link from "next/link";

export default function Scan() {
  const [scannedId, setScannedId] = useState<string | null>(null);
  const [youth, setYouth] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (scannedId) {
      setIsLoading(true);
      fetch(`/api/youth/${scannedId}`)
        .then(res => res.json())
        .then(data => {
          if(data && data.name) setYouth(data);
          else { alert("كود غير صحيح!"); setScannedId(null); }
        })
        .catch(() => { alert("خطأ في قراءة الكود!"); setScannedId(null); })
        .finally(() => setIsLoading(false));
    }
  }, [scannedId]);

  const handleAddPoints = async (points: number, reason: string) => {
    if (!scannedId) return;
    const res = await fetch('/api/points', {
      method: 'POST',
      body: JSON.stringify({ youthId: scannedId, reason, points, servantName: "خادم (موبايل)" })
    });
    const data = await res.json();
    alert(`تم إضافة ${data.log.points} نقطة بنجاح لـ ${youth.name}`);
    setScannedId(null);
    setYouth(null);
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-900 text-white p-4 flex flex-col items-center justify-center relative">
      <Link href="/admin" className="absolute top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg font-bold">العودة &rarr;</Link>
      
      <h1 className="text-3xl font-bold mb-8 text-blue-400">مسح كود الحضور 📷</h1>
      
      {!scannedId ? (
        <div className="w-full max-w-sm bg-gray-800 rounded-3xl overflow-hidden shadow-2xl border-4 border-blue-500 relative">
          <Scanner onScan={(result) => setScannedId(result[0].rawValue)} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-dashed border-white opacity-50 pointer-events-none"></div>
          <p className="text-center p-4 text-gray-300 font-bold bg-gray-900">وجه الكاميرا للكارنيه بتاع المخدوم</p>
        </div>
      ) : (
        <div className="bg-white text-gray-900 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl">
          {isLoading ? (
            <p className="text-xl font-bold text-gray-500">جاري تحميل بيانات المخدوم...</p>
          ) : youth ? (
            <>
              <h2 className="text-4xl font-extrabold text-blue-900 mb-2">{youth.name}</h2>
              <p className="text-gray-500 mb-8 font-bold text-xl">النقاط الحالية: {youth.totalPoints}</p>
              
              <div className="grid grid-cols-1 gap-4">
                <button onClick={() => handleAddPoints(50, "القداس")} className="bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-xl shadow-lg transition">حضور القداس (+50)</button>
                <button onClick={() => handleAddPoints(20, "التناول")} className="bg-teal-600 hover:bg-teal-700 text-white py-4 rounded-xl font-bold text-xl shadow-lg transition">التناول (+20)</button>
                <button onClick={() => handleAddPoints(30, "التسبحة")} className="bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl font-bold text-xl shadow-lg transition">حضور التسبحة (+30)</button>
                <button onClick={() => handleAddPoints(20, "العشية")} className="bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-bold text-xl shadow-lg transition">حضور العشية (+20)</button>
                <button onClick={() => { setScannedId(null); setYouth(null); }} className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 mt-4 rounded-xl font-bold text-lg">إلغاء ومسح كود آخر</button>
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
