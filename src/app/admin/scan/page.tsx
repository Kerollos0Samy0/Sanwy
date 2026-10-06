"use client";
import { useState, useEffect, useRef } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import Link from "next/link";
import { fireConfetti, playSuccessSound } from "@/lib/effects";

export default function Scan() {
  const [currentServant, setCurrentServant] = useState("أدمن");
  const [selectedActivities, setSelectedActivities] = useState<any[]>([]);
  const [logs, setLogs] = useState<{id: number, msg: string, type: 'success'|'error'}[]>([]);
  const lastScanTime = useRef<{ [key: string]: number }>({});

  const ACTIVITIES = [
    { id: 'liturgy', name: 'القداس', defaultPoints: 50, color: 'bg-blue-100 text-blue-800 border-blue-400' },
    { id: 'communion', name: 'التناول', defaultPoints: 20, color: 'bg-teal-100 text-teal-800 border-teal-400' },
    { id: 'tasbeha', name: 'التسبحة', defaultPoints: 30, color: 'bg-purple-100 text-purple-800 border-purple-400' },
    { id: 'vespers', name: 'العشية', defaultPoints: 20, color: 'bg-orange-100 text-orange-800 border-orange-400' },
    { id: 'service', name: 'الخدمة', defaultPoints: 50, color: 'bg-rose-100 text-rose-800 border-rose-400' },
    { id: 'mercy', name: 'أعمال رحمة', defaultPoints: 50, color: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-400' },
  ];

  const toggleActivity = (act: any) => {
    if (selectedActivities.find(a => a.id === act.id)) {
      setSelectedActivities(selectedActivities.filter(a => a.id !== act.id));
    } else {
      setSelectedActivities([...selectedActivities, act]);
    }
  };

  const handleScan = async (result: any) => {
    if (!result || !result[0] || !result[0].rawValue) return;
    const id = result[0].rawValue;
    
    const now = Date.now();
    // Prevent double scanning within 5 seconds
    if (lastScanTime.current[id] && now - lastScanTime.current[id] < 5000) {
      return;
    }
    lastScanTime.current[id] = now;

    if (selectedActivities.length === 0) {
      setLogs(prev => [{ id: Math.random(), msg: `⚠️ يرجى تحديد النشاط أولاً قبل مسح الكارت!`, type: 'error' as 'error' }, ...prev].slice(0, 5));
      return;
    }

    try {
      const youthRes = await fetch(`/api/youth/${id}`);
      const youthData = await youthRes.json();
      
      if (!youthData || !youthData.name) {
        setLogs(prev => [{ id: Math.random(), msg: '❌ كود غير صحيح أو مخدوم غير موجود!', type: 'error' as 'error' }, ...prev].slice(0, 5));
        return;
      }

      for (const act of selectedActivities) {
        await fetch('/api/points', {
          method: 'POST',
          body: JSON.stringify({ youthId: id, reason: act.name, points: act.defaultPoints, servantName: currentServant || "أدمن" })
        });
      }

      playSuccessSound();
      fireConfetti();
      
      setLogs(prev => [{ 
        id: Math.random(), 
        msg: `✅ تم تسجيل (${selectedActivities.map(a => a.name).join(' + ')}) لـ: ${youthData.name}`, 
        type: 'success' as 'success' 
      }, ...prev].slice(0, 5));
      
    } catch (e) {
      setLogs(prev => [{ id: Math.random(), msg: '❌ حدث خطأ في الاتصال!', type: 'error' as 'error' }, ...prev].slice(0, 5));
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 text-gray-900 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 gap-4">
          <h1 className="text-3xl font-extrabold text-blue-900 flex items-center gap-3">
            <span className="text-4xl">📷</span> المسح السريع (QR)
          </h1>
          <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl shadow-inner border border-gray-200">
            <label className="text-gray-600 font-bold text-sm whitespace-nowrap">اسم الخادم:</label>
            <input 
              type="text" 
              value={currentServant} 
              onChange={(e) => setCurrentServant(e.target.value)}
              className="w-24 md:w-40 border-b-2 border-blue-200 focus:border-blue-500 outline-none text-blue-900 font-bold bg-transparent"
              placeholder="اسمك..."
            />
          </div>
          <Link href="/admin" className="bg-gray-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition shadow-md whitespace-nowrap">
            العودة للوحة الخدام &rarr;
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Settings & Logs */}
          <div className="flex flex-col gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-lg border-t-8 border-blue-500">
              <h2 className="text-2xl font-black text-gray-800 mb-4">1. حدد الأنشطة المراد تسجيلها:</h2>
              <p className="text-gray-500 font-bold mb-6">الكاميرا هتفضل مفتوحة، أي كارت هتعمله سكان هيتسجله كل الأنشطة دي مع بعض تلقائياً!</p>
              
              <div className="flex flex-wrap gap-3">
                {ACTIVITIES.map(act => {
                  const isSelected = selectedActivities.find(a => a.id === act.id);
                  return (
                    <button 
                      key={act.id}
                      onClick={() => toggleActivity(act)}
                      className={`px-6 py-4 rounded-2xl font-black text-lg transition-all transform active:scale-95 border-2 ${isSelected ? act.color + ' ring-4 ring-offset-2 ring-blue-300 shadow-md scale-105' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}`}
                    >
                      {isSelected ? '✅ ' : ''}{act.name}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 flex-1 min-h-[250px]">
              <h2 className="text-xl font-black text-gray-800 mb-4 border-b pb-2">سجل المسح المباشر:</h2>
              <div className="flex flex-col gap-3">
                {logs.length === 0 ? (
                  <p className="text-gray-400 font-bold text-center mt-10">امسح كارت لتظهر النتيجة هنا...</p>
                ) : (
                  logs.map(log => (
                    <div key={log.id} className={`p-4 rounded-xl font-bold text-lg animate-fade-in shadow-sm border ${log.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
                      {log.msg}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Camera Scanner */}
          <div className="bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border-8 border-gray-800 relative flex flex-col">
            <div className="bg-gray-800 text-white text-center py-3 font-bold text-lg border-b border-gray-700">
              2. وجه الكاميرا لكارت المخدوم
            </div>
            <div className="relative flex-1 bg-black">
              <Scanner 
                onScan={handleScan} 
                formats={['qr_code']}
              />
              {/* Overlay target box */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-64 h-64 border-4 border-blue-500 rounded-3xl opacity-50 relative">
                  <div className="absolute -top-2 -left-2 w-8 h-8 border-t-8 border-l-8 border-blue-400 rounded-tl-2xl"></div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 border-t-8 border-r-8 border-blue-400 rounded-tr-2xl"></div>
                  <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-8 border-l-8 border-blue-400 rounded-bl-2xl"></div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-8 border-r-8 border-blue-400 rounded-br-2xl"></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
