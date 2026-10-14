"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Efteqad() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("الكل");

  useEffect(() => {
    fetch('/api/efteqad').then(res => res.json()).then(d => {
      setData(d);
      setLoading(false);
    });
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "لم يحضر بعد";
    return new Date(dateString).toLocaleDateString('ar-EG-u-nu-latn', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  };

  const filteredData = data.filter(y => {
    if (filterStatus === "الكل") return true;
    if (filterStatus === "انقطاع") return y.daysSinceLast === -1 || y.daysSinceLast > 14;
    if (filterStatus === "غياب") return y.daysSinceLast > 7 && y.daysSinceLast <= 14;
    if (filterStatus === "مواظب") return y.daysSinceLast >= 0 && y.daysSinceLast <= 7;
    return true;
  });

  return (
    <div dir="rtl" className="min-h-screen bg-slate-100 p-3 sm:p-6 md:p-8 text-gray-900">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-200 gap-3">
          <div>
            <h1 className="text-xl sm:text-3xl font-black text-blue-900 flex items-center gap-2">
              <span>🔍</span> المتابعة والافتقاد
            </h1>
            <p className="text-xs sm:text-sm font-bold text-gray-500 mt-0.5">
              متابعة غياب المخدومين والحرص على افتقادهم
            </p>
          </div>
          <Link href="/admin" className="bg-gray-800 hover:bg-black text-white px-4 py-2 rounded-xl font-bold transition shadow-sm text-xs sm:text-sm whitespace-nowrap self-end sm:self-auto">
            لوحة الخدام &rarr;
          </Link>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 mb-5 bg-white p-2.5 sm:p-3 rounded-2xl shadow-xs border border-gray-200">
          {[
            { id: "الكل", label: "الكل" },
            { id: "انقطاع", label: "🔴 محتاج افتقاد ضروري" },
            { id: "غياب", label: "🟡 غائب من أسبوع" },
            { id: "مواظب", label: "🟢 مواظب" },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              className={`px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm transition ${filterStatus === f.id ? 'bg-blue-600 text-white shadow-xs' : 'bg-gray-100 text-gray-600'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        
        {loading ? (
          <p className="text-center text-xl font-bold text-gray-500 mt-12">جاري تحليل بيانات الحضور... ⏳</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
            {filteredData.map(y => (
              <div 
                key={y.id} 
                className={`bg-white rounded-2xl shadow-xs p-4 sm:p-5 border-t-4 sm:border-t-6 border border-gray-200 flex flex-col justify-between ${
                  y.daysSinceLast === -1 || y.daysSinceLast > 14 
                    ? 'border-t-rose-500' 
                    : y.daysSinceLast > 7 
                    ? 'border-t-amber-400' 
                    : 'border-t-emerald-500'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <div>
                      <h2 className="text-lg sm:text-xl font-black text-gray-900 leading-tight">{y.name}</h2>
                      <p className="text-xs font-bold text-gray-500 mt-0.5">{y.grade}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-black text-white shrink-0 shadow-xs ${
                      y.daysSinceLast === -1 || y.daysSinceLast > 14 
                        ? 'bg-rose-600' 
                        : y.daysSinceLast > 7 
                        ? 'bg-amber-500' 
                        : 'bg-emerald-600'
                    }`}>
                      {y.daysSinceLast === -1 ? 'انقطاع تام' : y.daysSinceLast > 14 ? 'افتقاد عاجل ⚠️' : y.daysSinceLast > 7 ? 'غائب من أسبوع' : 'مواظب 👏'}
                    </span>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 mb-4 space-y-1.5 text-xs sm:text-sm">
                    <p className="text-gray-600 flex justify-between">
                      <span>📅 آخر حضور:</span>
                      <strong className="text-blue-900">{formatDate(y.lastAny)}</strong>
                    </p>
                    <p className="text-gray-600 flex justify-between">
                      <span>⛪ آخر قداس:</span>
                      <strong className="text-blue-900">{formatDate(y.lastLiturgy)}</strong>
                    </p>
                  </div>
                </div>

                <Link 
                  href={`/admin/youth/${y.id}`} 
                  className="block text-center w-full bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-800 font-black py-2.5 rounded-xl border border-blue-200 transition text-xs sm:text-sm shadow-xs active:scale-95"
                >
                  عرض سجل المخدوم &larr;
                </Link>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
