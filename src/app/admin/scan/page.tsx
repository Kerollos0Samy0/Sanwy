"use client";
import { useState, useRef } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import Link from "next/link";
import { fireConfetti, playSuccessSound } from "@/lib/effects";

export default function Scan() {
  const [currentServant, setCurrentServant] = useState("أدمن");
  const [selectedActivities, setSelectedActivities] = useState<any[]>([]);
  const [logs, setLogs] = useState<{id: number, msg: string, type: 'success'|'error'}[]>([]);
  const lastScanTime = useRef<{ [key: string]: number }>({});
  const [preventDuplicateToday, setPreventDuplicateToday] = useState(true);

  const ACTIVITIES = [
    { id: 'liturgy', name: 'القداس', defaultPoints: 50, color: 'bg-blue-100 text-blue-900 border-blue-400' },
    { id: 'communion', name: 'التناول', defaultPoints: 20, color: 'bg-teal-100 text-teal-900 border-teal-400' },
    { id: 'tasbeha', name: 'التسبحة', defaultPoints: 30, color: 'bg-purple-100 text-purple-900 border-purple-400' },
    { id: 'vespers', name: 'العشية', defaultPoints: 20, color: 'bg-orange-100 text-orange-900 border-orange-400' },
    { id: 'service', name: 'الخدمة', defaultPoints: 30, color: 'bg-rose-100 text-rose-900 border-rose-400' },
    { id: 'mercy', name: 'أعمال رحمة', defaultPoints: 50, color: 'bg-fuchsia-100 text-fuchsia-900 border-fuchsia-400' },
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

      let hasSuccess = false;
      const msgs: string[] = [];

      for (const act of selectedActivities) {
        const res = await fetch('/api/points', {
          method: 'POST',
          body: JSON.stringify({ 
            youthId: id, 
            reason: act.name, 
            points: act.defaultPoints, 
            servantName: currentServant || "أدمن",
            preventDuplicateToday
          })
        });

        if (!res.ok) {
          const errData = await res.json();
          if (errData.error === 'duplicate_today') {
            msgs.push(`⚠️ ${act.name}: مسجل من قبل`);
          } else {
            msgs.push(`❌ ${act.name}: خطأ`);
          }
        } else {
          hasSuccess = true;
          msgs.push(`✅ ${act.name}`);
        }
      }

      if (hasSuccess) {
        playSuccessSound();
        fireConfetti();
      }
      
      setLogs(prev => [{ 
        id: Math.random(), 
        msg: `${youthData.name} ⬅️ ${msgs.join(' | ')}`, 
        type: hasSuccess ? 'success' as 'success' : 'error' as 'error'
      }, ...prev].slice(0, 5));
      
    } catch {
      setLogs(prev => [{ id: Math.random(), msg: '❌ حدث خطأ في الاتصال!', type: 'error' as 'error' }, ...prev].slice(0, 5));
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 text-gray-900 p-3 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100 gap-3">
          <div>
            <h1 className="text-xl sm:text-3xl font-black text-blue-900 flex items-center gap-2">
              <span>📷</span> المسح السريع بالـ QR
            </h1>
            <p className="text-xs sm:text-sm font-bold text-gray-500 mt-0.5">
              امسح كارت المخدوم لتسجيل النقاط فوراً
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200 shadow-inner">
              <label className="text-gray-600 font-bold text-xs whitespace-nowrap">الخادم:</label>
              <input 
                type="text" 
                value={currentServant} 
                onChange={(e) => setCurrentServant(e.target.value)}
                className="w-24 sm:w-32 border-b border-blue-400 focus:outline-none text-blue-950 font-black text-xs sm:text-sm bg-transparent"
                placeholder="اسمك..."
              />
            </div>
            <Link href="/admin" className="bg-gray-800 text-white px-3.5 py-2 rounded-xl font-bold hover:bg-black transition shadow-sm text-xs sm:text-sm whitespace-nowrap">
              لوحة الخدام &rarr;
            </Link>
          </div>
        </div>
        
        {/* Activities Selection (Always at top for mobile) */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border-t-4 border-blue-600 mb-5">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base sm:text-lg font-black text-gray-800">
              1. حدد الأنشطة المراد رصدها:
            </h2>
            <label className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gray-600 cursor-pointer">
              <input 
                type="checkbox" 
                checked={preventDuplicateToday} 
                onChange={e => setPreventDuplicateToday(e.target.checked)} 
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span>منع التكرار اليوم</span>
            </label>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {ACTIVITIES.map(act => {
              const isSelected = selectedActivities.find(a => a.id === act.id);
              return (
                <button 
                  key={act.id}
                  onClick={() => toggleActivity(act)}
                  className={`py-3 px-2 rounded-xl font-black text-xs sm:text-sm transition-all border-2 text-center active:scale-95 ${isSelected ? act.color + ' ring-2 ring-blue-400 shadow-sm scale-[1.02]' : 'bg-gray-50 text-gray-500 border-gray-200'}`}
                >
                  {isSelected ? '✅ ' : ''}{act.name} (+{act.defaultPoints})
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Grid: Camera Scanner & Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          
          {/* Camera Scanner (Takes priority on mobile) */}
          <div className="bg-gray-950 rounded-2xl overflow-hidden shadow-lg border-4 border-gray-800 relative flex flex-col">
            <div className="bg-gray-900 text-white text-center py-2.5 font-bold text-sm sm:text-base border-b border-gray-800 flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
              2. وجّه الكاميرا لكارت المخدوم
            </div>
            <div className="relative aspect-square sm:aspect-auto sm:min-h-[380px] bg-black flex items-center justify-center">
              <Scanner 
                onScan={handleScan} 
                formats={['qr_code']}
              />
              {/* Overlay target box */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
                <div className="w-52 h-52 sm:w-64 sm:h-64 border-2 border-dashed border-blue-400/70 rounded-3xl relative">
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-blue-400 rounded-tl-xl"></div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-blue-400 rounded-tr-xl"></div>
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-blue-400 rounded-bl-xl"></div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-blue-400 rounded-br-xl"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Scan Logs */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col min-h-[220px]">
            <h2 className="text-base sm:text-lg font-black text-gray-800 mb-3 pb-2 border-b border-gray-100 flex items-center gap-2">
              <span>📋</span> نتائج المسح المباشر:
            </h2>
            <div className="flex flex-col gap-2.5 flex-1">
              {logs.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-gray-400 font-bold text-sm py-8 text-center">
                  امسح أي كارت ليظهر اسم المخدوم والنقاط هنا...
                </div>
              ) : (
                logs.map(log => (
                  <div 
                    key={log.id} 
                    className={`p-3 sm:p-3.5 rounded-xl font-bold text-sm sm:text-base animate-fade-in shadow-xs border ${log.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}
                  >
                    {log.msg}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
