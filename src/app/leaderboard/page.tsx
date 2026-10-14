"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Leaderboard() {
  const [youths, setYouths] = useState<{id: string, name: string, totalPoints: number}[]>([]);

  useEffect(() => {
    const fetchLeaderboard = () => {
      fetch('/api/leaderboard')
        .then(res => res.json())
        .then(data => setYouths(data));
    };
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div dir="rtl" className="min-h-screen bg-slate-100 p-3 sm:p-6 md:p-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 pt-4">
          <h1 className="text-3xl sm:text-5xl font-black text-blue-900 drop-shadow-xs">🏆 لوحة الشرف 🏆</h1>
          <p className="text-gray-500 mt-1.5 text-sm sm:text-lg font-bold">أعلى النقاط في الحضور والأنشطة</p>
          <div className="mt-3 flex justify-center gap-3">
            <Link href="/dashboard" className="text-xs sm:text-sm font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
              📊 إحصائيات الأبطال
            </Link>
            <Link href="/admin" className="text-xs sm:text-sm font-bold text-gray-700 bg-white px-3 py-1.5 rounded-xl border border-gray-200">
              لوحة الخدام &rarr;
            </Link>
          </div>
        </div>
        
        {/* Leaderboard List */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden border border-gray-200 p-2 sm:p-3 space-y-2">
          {youths.map((youth, idx) => (
            <div 
              key={youth.id} 
              className={`flex justify-between items-center p-3 sm:p-4 rounded-xl sm:rounded-2xl gap-3 transition ${
                idx === 0 
                  ? 'bg-amber-50 border-2 border-amber-300' 
                  : idx === 1 
                  ? 'bg-slate-50 border border-gray-300' 
                  : idx === 2 
                  ? 'bg-orange-50/70 border border-orange-200' 
                  : 'bg-white border border-gray-100'
              }`}
            >
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                <span className={`text-xl sm:text-3xl font-black shrink-0 ${
                  idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-amber-700' : 'text-gray-300'
                }`}>
                  #{idx + 1}
                </span>
                <span className="text-base sm:text-xl font-black text-gray-900 truncate">
                  {youth.name}
                </span>
              </div>
              <div className="text-sm sm:text-xl font-black text-white bg-blue-600 px-3 sm:px-5 py-1.5 rounded-full shadow-xs shrink-0 whitespace-nowrap">
                {youth.totalPoints} نقطة
              </div>
            </div>
          ))}
          {youths.length === 0 && (
            <p className="text-center text-gray-400 font-bold text-base py-10">لم يتم تسجيل أي نقاط حتى الآن...</p>
          )}
        </div>

      </div>
    </div>
  );
}
