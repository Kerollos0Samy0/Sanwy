"use client";
import { useState, useRef, useEffect } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import Link from "next/link";
import { fireConfetti, playSuccessSound } from "@/lib/effects";

const ACTIVITIES = [
  { id: 'liturgy', name: 'القداس', defaultPoints: 50, color: 'bg-blue-100 text-blue-900 border-blue-400', icon: '⛪' },
  { id: 'confession', name: 'الاعتراف', defaultPoints: 50, color: 'bg-teal-100 text-teal-900 border-teal-400', icon: '🙏' },
  { id: 'tasbeha', name: 'التسبحة', defaultPoints: 30, color: 'bg-purple-100 text-purple-900 border-purple-400', icon: '🎵' },
  { id: 'vespers', name: 'العشية', defaultPoints: 20, color: 'bg-orange-100 text-orange-900 border-orange-400', icon: '🌅' },
  { id: 'service', name: 'الخدمة', defaultPoints: 30, color: 'bg-rose-100 text-rose-900 border-rose-400', icon: '❤️' },
  { id: 'mercy', name: 'أعمال رحمة', defaultPoints: 50, color: 'bg-fuchsia-100 text-fuchsia-900 border-fuchsia-400', icon: '🕊️' },
];

export default function Scan() {
  const [currentServant, setCurrentServant] = useState("أدمن");
  const [selectedActivities, setSelectedActivities] = useState<any[]>([]);
  const [logs, setLogs] = useState<{id: number, msg: string, type: 'success'|'error'}[]>([]);
  const lastScanTime = useRef<{ [key: string]: number }>({});
  const [preventDuplicateToday, setPreventDuplicateToday] = useState(true);

  // Weekly points configuration
  const [weeklyPoints, setWeeklyPoints] = useState<Record<string, number>>({
    'القداس': 50,
    'الاعتراف': 50,
    'التسبحة': 30,
    'العشية': 20,
    'الخدمة': 30,
    'أعمال رحمة': 50,
  });
  const [showPointsConfig, setShowPointsConfig] = useState(false);
  const [tempPoints, setTempPoints] = useState<Record<string, number>>(weeklyPoints);
  const [isSavingPoints, setIsSavingPoints] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  // Load weekly points on mount
  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && typeof data === 'object') {
          setWeeklyPoints(prev => ({ ...prev, ...data }));
          setTempPoints(prev => ({ ...prev, ...data }));
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveWeeklyPoints = async () => {
    setIsSavingPoints(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tempPoints)
      });
      if (res.ok) {
        setWeeklyPoints(tempPoints);
        setSaveSuccessMsg("تم حفظ درجات هذا الأسبوع بنجاح ✅");
        setTimeout(() => setSaveSuccessMsg(""), 3000);
      } else {
        alert("فشل في حفظ إعدادات الدرجات");
      }
    } catch {
      alert("حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setIsSavingPoints(false);
    }
  };

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
        const pointsToAssign = weeklyPoints[act.name] !== undefined ? weeklyPoints[act.name] : act.defaultPoints;

        const res = await fetch('/api/points', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            youthId: id, 
            reason: act.name, 
            points: pointsToAssign, 
            servantName: currentServant || "أدمن",
            preventDuplicateToday
          })
        });

        if (!res.ok) {
          const errData = await res.json();
          if (errData.error === 'duplicate_month') {
            msgs.push(`⚠️ ${act.name}: مسجل هذا الشهر بالفعل (مرة شهرياً)`);
          } else if (errData.error === 'duplicate_today') {
            msgs.push(`⚠️ ${act.name}: مسجل من قبل اليوم`);
          } else {
            msgs.push(`❌ ${act.name}: خطأ`);
          }
        } else {
          hasSuccess = true;
          msgs.push(`✅ ${act.name} (+${pointsToAssign})`);
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

        {/* Weekly Points Config Box (Toggleable) */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-200 mb-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚙️</span>
              <div>
                <h3 className="font-black text-gray-800 text-sm sm:text-base">
                  تحديد درجات الأنشطة لهذا الأسبوع
                </h3>
                <p className="text-xs text-gray-500 font-bold">
                  يمكنك تغيير نقاط القداس أو أي نشاط قبل البدء في المسح (مثلاً القداس بـ 100 بدل 50)
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPointsConfig(!showPointsConfig)}
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-black px-3.5 py-1.5 rounded-xl border border-blue-200 text-xs sm:text-sm transition active:scale-95"
            >
              {showPointsConfig ? "إخفاء لوحة التعديل ✕" : "تعديل درجات هذا الأسبوع ✏️"}
            </button>
          </div>

          {showPointsConfig && (
            <div className="mt-4 pt-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-4">
                {ACTIVITIES.map(act => (
                  <div key={act.id} className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-center">
                    <label className="block text-xs font-black text-gray-700 mb-1">
                      {act.icon} {act.name}
                    </label>
                    <div className="flex items-center justify-center gap-1">
                      <input 
                        type="number"
                        value={tempPoints[act.name] !== undefined ? tempPoints[act.name] : act.defaultPoints}
                        onChange={e => setTempPoints({ ...tempPoints, [act.name]: parseInt(e.target.value) || 0 })}
                        className="w-16 text-center font-black text-base border-2 border-blue-300 rounded-lg p-1 bg-white focus:outline-none focus:border-blue-600 text-blue-900"
                      />
                      <span className="text-xs font-bold text-gray-500">نقطة</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-green-700 font-bold text-xs sm:text-sm">
                  {saveSuccessMsg}
                </span>
                <button
                  onClick={handleSaveWeeklyPoints}
                  disabled={isSavingPoints}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-black px-5 py-2 rounded-xl text-xs sm:text-sm shadow-sm transition active:scale-95 disabled:opacity-50"
                >
                  {isSavingPoints ? "جاري الحفظ..." : "حفظ الدرجات لهذا الأسبوع 💾"}
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Activities Selection (Always visible at top for mobile) */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border-t-4 border-blue-600 mb-5">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base sm:text-lg font-black text-gray-800">
              1. حدد الأنشطة المراد رصدها عند المسح:
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
              const currentPts = weeklyPoints[act.name] !== undefined ? weeklyPoints[act.name] : act.defaultPoints;

              return (
                <button 
                  key={act.id}
                  onClick={() => toggleActivity(act)}
                  className={`py-3 px-2 rounded-xl font-black text-xs sm:text-sm transition-all border-2 text-center active:scale-95 ${isSelected ? act.color + ' ring-2 ring-blue-400 shadow-sm scale-[1.02]' : 'bg-gray-50 text-gray-600 border-gray-200'}`}
                >
                  {isSelected ? '✅ ' : ''}{act.icon} {act.name} (+{currentPts})
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Grid: Camera Scanner & Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          
          {/* Camera Scanner */}
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
