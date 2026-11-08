"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const CategoryCard = ({ 
  title, 
  youthList = [], 
  colorClass 
}: { 
  title: string, 
  youthList: any[], 
  colorClass: string 
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = searchTerm.trim() 
    ? youthList.filter(y => y.name?.toLowerCase().includes(searchTerm.trim().toLowerCase()))
    : youthList;

  return (
    <div className={`bg-white rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-md transition-shadow border-t-4 sm:border-t-8 ${colorClass} p-4 sm:p-6 flex flex-col border border-gray-100`}>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg sm:text-xl font-black text-gray-800">{title}</h2>
        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
          {youthList.length} بطل
        </span>
      </div>

      {youthList.length > 5 && (
        <input 
          type="text"
          placeholder="🔍 بحث في هذا الترتيب..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full text-xs font-bold p-2 mb-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-blue-400 placeholder-gray-400"
        />
      )}

      {youthList.length === 0 ? (
        <p className="text-gray-400 text-center font-bold text-sm py-8">لا توجد بيانات حتى الآن</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-400 text-center font-bold text-sm py-6">لا توجد أسماء مطابقة للبحث</p>
      ) : (
        <ul className="space-y-2 sm:space-y-2.5 flex-1 max-h-[460px] overflow-y-auto pr-1">
          {filtered.map((y) => {
            const originalRank = youthList.findIndex(item => item.id === y.id) + 1;
            const isTop1 = originalRank === 1;
            const isTop2 = originalRank === 2;
            const isTop3 = originalRank === 3;

            return (
              <li 
                key={y.id} 
                className={`flex justify-between items-center p-2.5 sm:p-3 rounded-xl border shadow-xs gap-2 transition ${
                  isTop1 
                    ? 'bg-amber-50/90 border-amber-300' 
                    : isTop2 
                    ? 'bg-slate-50 border-gray-300' 
                    : isTop3 
                    ? 'bg-orange-50/80 border-orange-200' 
                    : 'bg-gray-50/70 border-gray-100'
                }`}
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                  <span className={`text-base sm:text-lg font-black shrink-0 w-8 text-center ${
                    isTop1 ? 'text-amber-500 text-xl' : isTop2 ? 'text-gray-400 text-lg' : isTop3 ? 'text-amber-700 text-lg' : 'text-gray-400'
                  }`}>
                    {isTop1 ? '🥇' : isTop2 ? '🥈' : isTop3 ? '🥉' : `#${originalRank}`}
                  </span>
                  <span className="font-black text-gray-900 text-xs sm:text-base truncate">
                    {y.name}
                  </span>
                </div>
                <span className="font-black text-blue-700 bg-blue-100 px-2.5 sm:px-3 py-1 rounded-lg text-xs sm:text-sm shrink-0 whitespace-nowrap">
                  {y.categoryScore !== undefined ? y.categoryScore : y.totalPoints} نقطة
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

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
              <p className="text-xs sm:text-sm font-bold text-gray-500 mt-0.5">
                ترتيب مخدومي اجتماع شباب ثانوي بالكامل من الأول للأخير
              </p>
            </div>
          </div>
          <Link href="/admin" className="bg-gray-800 hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition text-xs sm:text-base whitespace-nowrap active:scale-95">
            لوحة الخدام &rarr;
          </Link>
        </div>
        
        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          <CategoryCard title="👑 الترتيب العام (أعلى نقاط)" youthList={data.overall || []} colorClass="border-blue-600" />
          <CategoryCard title="⛪ أبطال القداس" youthList={data.topLiturgy || []} colorClass="border-green-500" />
          <CategoryCard title="🙏 أبطال الاعتراف" youthList={data.topConfession || []} colorClass="border-teal-500" />
          <CategoryCard title="🎵 أبطال التسبحة" youthList={data.topTasbeha || []} colorClass="border-purple-500" />
          <CategoryCard title="🌅 أبطال العشية" youthList={data.topVespers || []} colorClass="border-orange-500" />
          <CategoryCard title="❤️ أبطال الخدمة" youthList={data.topService || []} colorClass="border-red-500" />
          <CategoryCard title="🕊️ أبطال أعمال الرحمة" youthList={data.topMercy || []} colorClass="border-fuchsia-500" />
        </div>

      </div>
    </div>
  );
}
