"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Efteqad() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/efteqad').then(res => res.json()).then(d => {
      setData(d);
      setLoading(false);
    });
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "لم يحضر بعد";
    return new Date(dateString).toLocaleDateString('ar-EG-u-nu-latn', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b-2 border-gray-200 pb-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900">🔍 لوحة المتابعة والافتقاد</h1>
          <Link href="/admin" className="bg-gray-800 hover:bg-black text-white px-6 py-3 rounded-xl font-bold shadow-md transition">اللوحة الرئيسية &rarr;</Link>
        </div>
        
        {loading ? (
          <p className="text-center text-2xl font-bold text-gray-500 mt-10">جاري تحليل بيانات الحضور...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map(y => (
              <div key={y.id} className={`bg-white rounded-3xl shadow-md p-6 border-t-8 ${y.daysSinceLast === -1 || y.daysSinceLast > 14 ? 'border-red-500' : y.daysSinceLast > 7 ? 'border-orange-400' : 'border-green-500'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 mb-1">{y.name}</h2>
                    <p className="text-gray-500 font-bold">{y.grade}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-xl text-sm font-bold text-white shadow-sm ${y.daysSinceLast === -1 || y.daysSinceLast > 14 ? 'bg-red-500' : y.daysSinceLast > 7 ? 'bg-orange-400' : 'bg-green-500'}`}>
                    {y.daysSinceLast === -1 ? 'انقطاع تام' : y.daysSinceLast > 14 ? 'محتاج افتقاد ضروري' : y.daysSinceLast > 7 ? 'غائب من أسبوع' : 'مواظب 👏'}
                  </span>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
                  <p className="text-sm text-gray-600 mb-3 text-base"><strong>📅 آخر حضور عام:</strong><br/><span className="text-blue-700 font-bold">{formatDate(y.lastAny)}</span></p>
                  <p className="text-sm text-gray-600 text-base"><strong>⛪ آخر حضور قداس:</strong><br/><span className="text-blue-700 font-bold">{formatDate(y.lastLiturgy)}</span></p>
                </div>

                <Link href={`/admin/youth/${y.id}`} className="block text-center w-full bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 font-bold py-3 rounded-xl border-2 border-blue-200 transition text-lg shadow-sm">
                  عرض السجل الكامل بالتواريخ
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
