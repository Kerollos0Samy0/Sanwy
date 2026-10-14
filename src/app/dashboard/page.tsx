"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const CategoryCard = ({ title, youthList, colorClass }: { title: string, youthList: any[], colorClass: string }) => (
  <div className={`bg-white rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-md transition-shadow border-t-4 sm:border-t-8 ${colorClass} p-4 sm:p-6 flex flex-col border border-gray-100`}>
    <h2 className="text-lg sm:text-2xl font-black text-gray-800 mb-4 sm:mb-6 text-center">{title}</h2>
    {youthList.length === 0 ? (
      <p className="text-gray-400 text-center font-bold text-sm py-6">لا توجد بيانات حتى الآن</p>
    ) : (
      <ul className="space-y-2.5 sm:space-y-3.5 flex-1">
        {youthList.map((y, idx) => (
          <li key={y.id} className="flex justify-between items-center bg-gray-50 p-3 sm:p-3.5 rounded-xl border border-gray-100 shadow-xs gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
              <span className={`text-xl sm:text-2xl font-black shrink-0 ${idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-amber-700' : 'text-gray-300'}`}>
                #{idx + 1}
              </span>
              <span className="font-black text-gray-900 text-sm sm:text-lg truncate">
                {y.name}
              </span>
            </div>
            <span className="font-black text-blue-700 bg-blue-100 px-2.5 sm:px-3.5 py-1 rounded-lg text-xs sm:text-sm shrink-0 whitespace-nowrap">
              {y.categoryScore || y.totalPoints} نقطة
            </span>
          </li>
        ))}
      </ul>
    )}
  </div>
);

export default function Dashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/dashboard').then(res => res.json()).then(setData);
  }, []);

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center text-xl font-bold text-blue-900 p-4" dir="rtl">
      جاري تحميل إحصائيات الأبطال... ⏳
    </div>
  );

  return (
    <div dir="rtl" className="min-h-screen bg-slate-100 p-3 sm:p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-200 gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <img src="/logo.png" alt="Logo" className="w-13 h-13 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full border-2 border-white shadow-sm object-cover shrink-0" />
            <div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-blue-900 leading-tight">📊 إحصائيات الأبطال</h1>
              <p className="text-xs sm:text-sm font-bold text-gray-500 mt-0.5">ترتيب مخدومي اجتماع شباب ثانوي</p>
            </div>
          </div>
          <Link href="/admin" className="bg-gray-800 hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition text-xs sm:text-base whitespace-nowrap active:scale-95">
            لوحة الخدام &rarr;
          </Link>
        </div>
        
        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          <CategoryCard title="👑 الترتيب العام (أعلى نقاط)" youthList={data.overall} colorClass="border-blue-600" />
          <CategoryCard title="⛪ أبطال القداس" youthList={data.topLiturgy} colorClass="border-green-500" />
          <CategoryCard title="🎵 أبطال التسبحة" youthList={data.topTasbeha} colorClass="border-purple-500" />
          <CategoryCard title="🌅 أبطال العشية" youthList={data.topVespers} colorClass="border-orange-500" />
          <CategoryCard title="🍞 أبطال التناول" youthList={data.topCommunion} colorClass="border-teal-500" />
          <CategoryCard title="❤️ أبطال الخدمة" youthList={data.topService} colorClass="border-red-500" />
          <CategoryCard title="🕊️ أبطال أعمال الرحمة" youthList={data.topMercy || []} colorClass="border-fuchsia-500" />
        </div>

      </div>
    </div>
  );
}
