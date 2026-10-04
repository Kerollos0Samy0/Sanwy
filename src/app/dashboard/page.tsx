"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/dashboard').then(res => res.json()).then(setData);
  }, []);

  if (!data) return <div className="min-h-screen flex items-center justify-center text-2xl font-bold text-blue-900" dir="rtl">جاري تحميل إحصائيات الأبطال... ⏳</div>;

  const CategoryCard = ({ title, youthList, colorClass }: { title: string, youthList: any[], colorClass: string }) => (
    <div className={`bg-white rounded-3xl shadow-lg border-t-8 ${colorClass} p-6 flex flex-col`}>
      <h2 className="text-2xl font-black text-gray-800 mb-6 text-center">{title}</h2>
      {youthList.length === 0 ? <p className="text-gray-400 text-center font-bold">لا يوجد بيانات حتى الآن</p> : (
        <ul className="space-y-4 flex-1">
          {youthList.map((y, idx) => (
            <li key={y.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-4">
                <span className={`text-2xl font-black ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-orange-700' : 'text-gray-300'}`}>#{idx + 1}</span>
                <span className="font-bold text-gray-800 text-xl">{y.name}</span>
              </div>
              <span className="font-black text-blue-700 bg-blue-100 px-4 py-2 rounded-lg">{y.categoryScore || y.totalPoints} نقطة</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10 border-b-2 border-gray-200 pb-6">
          <h1 className="text-4xl md:text-5xl font-black text-blue-900 drop-shadow-sm">📊 لوحة إحصائيات الأبطال</h1>
          <Link href="/admin" className="bg-gray-800 hover:bg-black text-white px-6 py-3 rounded-xl font-bold shadow-md transition">لوحة الخدام &rarr;</Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          <CategoryCard title="👑 الترتيب العام (أعلى نقاط)" youthList={data.overall} colorClass="border-blue-600" />
          <CategoryCard title="⛪ أبطال القداس" youthList={data.topLiturgy} colorClass="border-green-500" />
          <CategoryCard title="🎵 أبطال التسبحة" youthList={data.topTasbeha} colorClass="border-purple-500" />
          <CategoryCard title="🌅 أبطال العشية" youthList={data.topVespers} colorClass="border-orange-500" />
          <CategoryCard title="🍞 أبطال التناول" youthList={data.topCommunion} colorClass="border-teal-500" />
          <CategoryCard title="❤️ أبطال الخدمة" youthList={data.topService} colorClass="border-red-500" />
        </div>
      </div>
    </div>
  );
}
