"use client";
import { useEffect, useState } from "react";

export default function Leaderboard() {
  const [youths, setYouths] = useState<any[]>([]);

  useEffect(() => {
    const fetchLeaderboard = () => {
      fetch('/api/leaderboard')
        .then(res => res.json())
        .then(data => setYouths(data));
    };
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 5000); // تحديث تلقائي كل 5 ثواني
    return () => clearInterval(interval);
  }, []);

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10 flex flex-col items-center">
          <h1 className="text-5xl font-extrabold text-blue-900 drop-shadow-md">🏆 لوحة الشرف 🏆</h1>
          <p className="text-gray-500 mt-3 text-xl">أعلى النقاط في الحضور والأنشطة</p>
        </div>
        
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-2">
          {youths.map((youth, idx) => (
            <div 
              key={youth.id} 
              className={`flex justify-between items-center p-6 mb-2 rounded-2xl ${idx === 0 ? 'bg-yellow-100 border-2 border-yellow-400' : idx === 1 ? 'bg-gray-100' : idx === 2 ? 'bg-orange-50' : 'bg-white border-b'}`}
            >
              <div className="flex items-center gap-6">
                <span className={`text-3xl font-black ${idx === 0 ? 'text-yellow-600' : idx === 1 ? 'text-gray-500' : idx === 2 ? 'text-orange-600' : 'text-gray-400'}`}>
                  #{idx + 1}
                </span>
                <span className="text-2xl font-bold text-gray-800">{youth.name}</span>
              </div>
              <div className="text-2xl font-black text-white bg-blue-600 px-6 py-2 rounded-full shadow-md">
                {youth.totalPoints} نقطة
              </div>
            </div>
          ))}
          {youths.length === 0 && (
            <p className="text-center text-gray-500 text-xl py-10">لم يتم تسجيل أي نقاط حتى الآن...</p>
          )}
        </div>
      </div>
    </div>
  );
}
