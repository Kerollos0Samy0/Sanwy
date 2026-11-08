"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { fireConfetti, playSuccessSound } from "@/lib/effects";

export default function RecordPoints() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("الكل");
  const [selectedGender, setSelectedGender] = useState("الكل");
  const [currentServant, setCurrentServant] = useState("أدمن");
  const [youths, setYouths] = useState<any[]>([]);
  const [customPoints, setCustomPoints] = useState<{ [key: string]: number }>({});
  const [customReason, setCustomReason] = useState<{ [key: string]: string }>({});

  // Weekly points from settings
  const [weeklyPoints, setWeeklyPoints] = useState<Record<string, number>>({
    'القداس': 50,
    'الاعتراف': 50,
    'التسبحة': 30,
    'العشية': 20,
    'الخدمة': 30,
    'أعمال رحمة': 50,
  });
  const [showConfig, setShowConfig] = useState(false);
  const [tempPoints, setTempPoints] = useState<Record<string, number>>(weeklyPoints);
  const [isSavingPoints, setIsSavingPoints] = useState(false);
  const [configMsg, setConfigMsg] = useState("");

  const fetchYouths = () => fetch('/api/youth').then(res => res.json()).then(setYouths);
  
  useEffect(() => { 
    fetchYouths(); 
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
        setConfigMsg("تم حفظ درجات هذا الأسبوع بنجاح ✅");
        setTimeout(() => setConfigMsg(""), 3000);
      } else {
        alert("فشل في حفظ الدرجات");
      }
    } catch {
      alert("حدث خطأ في الاتصال بالخادم");
    } finally {
      setIsSavingPoints(false);
    }
  };

  const GRADES = ["أولى ثانوي", "تانية ثانوي", "تالتة ثانوي"];

  const getGradeColor = (grade: string) => {
    if (!grade) return 'bg-gray-100 text-gray-800 border-gray-200';
    if (grade.includes('أول')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (grade.includes('ثاني')) return 'bg-amber-100 text-amber-800 border-amber-200';
    if (grade.includes('تالت') || grade.includes('ثالث')) return 'bg-purple-100 text-purple-800 border-purple-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const filteredYouths = youths.filter(y => {
    const matchesGrade = selectedGrade === "الكل" || y.grade === selectedGrade;
    const matchesGender = selectedGender === "الكل" || y.gender === selectedGender;
    const matchesSearch = !searchQuery || y.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGrade && matchesGender && matchesSearch;
  });

  const gradeOrder: Record<string, number> = {
    'أولى ثانوي': 1, 'أولي ثانوي': 1,
    'تانية ثانوي': 2, 'ثانية ثانوي': 2,
    'تالتة ثانوي': 3, 'ثالثة ثانوي': 3,
  };

  filteredYouths.sort((a, b) => {
    const orderA = gradeOrder[a.grade] || 99;
    const orderB = gradeOrder[b.grade] || 99;
    if (orderA !== orderB) return orderA - orderB;
    return (a.name || "").localeCompare(b.name || "");
  });

  const handleAddPoints = async (id: string, points: number, reason: string, force = false) => {
    if (!points || points === 0) return alert("برجاء إدخال عدد نقاط صحيح");
    if (!reason) return alert("برجاء إدخال السبب");
    
    const res = await fetch('/api/points', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        youthId: id, 
        reason, 
        points, 
        servantName: currentServant || "أدمن",
        preventDuplicateToday: !force,
        force
      })
    });

    if (!res.ok) {
      const data = await res.json();
      if (data.error === 'duplicate_month') {
        const confirmForce = confirm(`${data.msg}\nهل تريد تسجيله استثنائياً لهذا الشهر؟`);
        if (confirmForce) {
          handleAddPoints(id, points, reason, true);
        }
      } else if (data.error === 'duplicate_today') {
        const confirmForce = confirm(`${data.msg}\nهل تريد تسجيلها مرة أخرى على أي حال؟`);
        if (confirmForce) {
          handleAddPoints(id, points, reason, true);
        }
      } else {
        alert("حدث خطأ أثناء تسجيل النقاط");
      }
      return;
    }

    if (points > 0) {
      playSuccessSound();
      fireConfetti();
    }
    setCustomPoints(prev => ({...prev, [id]: 0}));
    setCustomReason(prev => ({...prev, [id]: ""}));
    fetchYouths();
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-100 p-3 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-200 gap-3">
          <div>
            <h1 className="text-xl sm:text-3xl font-black text-blue-900 flex items-center gap-2">
              <span>✍️</span> تسجيل النقاط
            </h1>
            <p className="text-xs sm:text-sm font-bold text-gray-500 mt-0.5">
              رصد الأنشطة اليومية وحضور القداسات والاعترافات
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="bg-blue-50 hover:bg-blue-100 text-blue-800 px-3 py-1.5 rounded-xl border border-blue-200 text-xs sm:text-sm font-bold transition active:scale-95"
            >
              ⚙️ {showConfig ? "إخفاء الدرجات" : "تعديل درجات الأسبوع"}
            </button>
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
            <Link href="/admin" className="bg-gray-800 hover:bg-black text-white px-3.5 py-2 rounded-xl font-bold transition text-xs sm:text-sm shadow-sm whitespace-nowrap">
              لوحة الخدام &rarr;
            </Link>
          </div>
        </div>

        {/* Weekly Points Config Box (Toggleable) */}
        {showConfig && (
          <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-200 mb-5">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
              <h3 className="font-black text-gray-800 text-sm sm:text-base">
                ⚙️ درجات الأنشطة المحددة لهذا الأسبوع:
              </h3>
              <span className="text-xs text-green-700 font-bold">{configMsg}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 mb-3">
              {[
                { name: 'القداس', icon: '⛪' },
                { name: 'الاعتراف', icon: '🙏' },
                { name: 'التسبحة', icon: '🎵' },
                { name: 'العشية', icon: '🌅' },
                { name: 'الخدمة', icon: '❤️' },
                { name: 'أعمال رحمة', icon: '🕊️' },
              ].map(item => (
                <div key={item.name} className="bg-gray-50 p-2 rounded-xl border border-gray-200 text-center">
                  <label className="block text-xs font-black text-gray-700 mb-1">{item.icon} {item.name}</label>
                  <input 
                    type="number"
                    value={tempPoints[item.name] || 0}
                    onChange={e => setTempPoints({ ...tempPoints, [item.name]: parseInt(e.target.value) || 0 })}
                    className="w-16 text-center font-black text-sm border-2 border-blue-300 rounded-lg p-1 bg-white focus:outline-none focus:border-blue-600 text-blue-900"
                  />
                </div>
              ))}
            </div>
            <div className="text-left">
              <button
                onClick={handleSaveWeeklyPoints}
                disabled={isSavingPoints}
                className="bg-blue-600 hover:bg-blue-700 text-white font-black px-4 py-1.5 rounded-xl text-xs sm:text-sm shadow-sm transition active:scale-95 disabled:opacity-50"
              >
                {isSavingPoints ? "جاري الحفظ..." : "حفظ الدرجات 💾"}
              </button>
            </div>
          </div>
        )}
        
        {/* Search & Filters */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl shadow-sm mb-5 border border-gray-200 flex flex-col gap-3">
          <input 
            type="text"
            className="w-full border-2 border-gray-200 p-3 sm:p-3.5 rounded-xl text-base sm:text-lg font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500" 
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)} 
            placeholder="🔍 ابحث بالاسم..." 
          />

          <div className="flex flex-wrap items-center justify-between gap-2.5">
            {/* Gender filter */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
              {["الكل", "ولد", "بنت"].map(g => (
                <button
                  key={g}
                  onClick={() => setSelectedGender(g)}
                  className={`px-3 py-1 rounded-lg text-xs sm:text-sm font-black transition ${selectedGender === g ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-600'}`}
                >
                  {g === "الكل" ? "الكل" : g === "ولد" ? "👦 ولاد" : "👧 بنات"}
                </button>
              ))}
            </div>

            {/* Grade filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-xs sm:text-sm font-bold text-gray-600 whitespace-nowrap">المرحلة:</label>
              <select 
                className="flex-1 sm:w-44 border border-gray-300 p-1.5 sm:p-2 rounded-xl text-xs sm:text-sm font-bold text-gray-900 focus:outline-none focus:border-blue-500 bg-white"
                value={selectedGrade} onChange={e => setSelectedGrade(e.target.value)}
              >
                <option value="الكل">كل المراحل</option>
                {GRADES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Student Cards List */}
        <div className="flex flex-col gap-3 sm:gap-4">
          {filteredYouths.length === 0 ? (
            <div className="text-center text-gray-400 font-bold py-12 bg-white rounded-2xl border border-gray-200 text-base">
              لا يوجد مخدومين مطابقين للبحث
            </div>
          ) : (
            filteredYouths.map(y => (
              <div 
                key={y.id} 
                className={`flex flex-col xl:flex-row justify-between items-stretch xl:items-center p-4 sm:p-5 bg-white border border-gray-200 rounded-2xl shadow-xs hover:shadow-md transition-all gap-4 border-r-4 ${y.gender === 'بنت' ? 'border-r-pink-400' : 'border-r-blue-500'}`}
              >
                {/* Youth Info */}
                <div className="flex items-center gap-3.5 shrink-0">
                  {y.imageUrl ? (
                    <img 
                      src={y.imageUrl} 
                      alt="Avatar" 
                      className="w-13 h-13 sm:w-16 sm:h-16 rounded-full shadow-xs border border-gray-100 object-cover shrink-0"
                    />
                  ) : (
                    <div className={`w-13 h-13 sm:w-16 sm:h-16 rounded-full shadow-xs border border-gray-100 flex items-center justify-center shrink-0 ${y.gender === 'بنت' ? 'bg-pink-50' : 'bg-blue-50'}`}>
                      <span className="text-2xl sm:text-3xl">
                        {y.gender === 'بنت' ? '👧' : '👦'}
                      </span>
                    </div>
                  )}
                  <div>
                    <Link href={`/admin/youth/${y.id}`} className="text-lg sm:text-xl font-black text-gray-900 hover:text-blue-600 transition block leading-tight">
                      {y.name}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${getGradeColor(y.grade)}`}>
                        {y.grade || 'غير محدد'}
                      </span>
                      <span className="text-xs font-bold text-gray-500">
                        <strong className="text-blue-700 text-base mx-0.5">{y.totalPoints}</strong> نقطة
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Quick Points Buttons (3x2 grid) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 flex-1 max-w-xl">
                  <button 
                    onClick={() => handleAddPoints(y.id, weeklyPoints['القداس'] || 50, "القداس")} 
                    className="bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 py-2.5 px-2 rounded-xl font-black text-xs sm:text-sm transition active:scale-95 text-center"
                  >
                    ⛪ القداس (+{weeklyPoints['القداس'] || 50})
                  </button>
                  <button 
                    onClick={() => handleAddPoints(y.id, weeklyPoints['الاعتراف'] || 50, "الاعتراف")} 
                    className="bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white border border-teal-200 py-2.5 px-2 rounded-xl font-black text-xs sm:text-sm transition active:scale-95 text-center"
                    title="الاعتراف مسموح به مرة واحدة شهرياً"
                  >
                    🙏 الاعتراف (+{weeklyPoints['الاعتراف'] || 50})
                  </button>
                  <button 
                    onClick={() => handleAddPoints(y.id, weeklyPoints['التسبحة'] || 30, "التسبحة")} 
                    className="bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white border border-purple-200 py-2.5 px-2 rounded-xl font-black text-xs sm:text-sm transition active:scale-95 text-center"
                  >
                    🎵 التسبحة (+{weeklyPoints['التسبحة'] || 30})
                  </button>
                  <button 
                    onClick={() => handleAddPoints(y.id, weeklyPoints['العشية'] || 20, "العشية")} 
                    className="bg-orange-50 hover:bg-orange-500 text-orange-700 hover:text-white border border-orange-200 py-2.5 px-2 rounded-xl font-black text-xs sm:text-sm transition active:scale-95 text-center"
                  >
                    🌅 العشية (+{weeklyPoints['العشية'] || 20})
                  </button>
                  <button 
                    onClick={() => handleAddPoints(y.id, weeklyPoints['الخدمة'] || 30, "الخدمة")} 
                    className="bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 py-2.5 px-2 rounded-xl font-black text-xs sm:text-sm transition active:scale-95 text-center"
                  >
                    ❤️ الخدمة (+{weeklyPoints['الخدمة'] || 30})
                  </button>
                  <button 
                    onClick={() => handleAddPoints(y.id, weeklyPoints['أعمال رحمة'] || 50, "أعمال رحمة")} 
                    className="bg-fuchsia-50 hover:bg-fuchsia-600 text-fuchsia-700 hover:text-white border border-fuchsia-200 py-2.5 px-2 rounded-xl font-black text-xs sm:text-sm transition active:scale-95 text-center"
                  >
                    🕊️ أعمال رحمة (+{weeklyPoints['أعمال رحمة'] || 50})
                  </button>
                </div>

                {/* Custom Points Block */}
                <div className="flex gap-2 items-center bg-gray-50 p-2 sm:p-2.5 rounded-xl border border-gray-200 shadow-inner shrink-0">
                  <input 
                    type="number" 
                    placeholder="النقاط" 
                    className="w-16 sm:w-20 border border-gray-300 p-2 rounded-lg text-center font-black text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none text-xs sm:text-sm bg-white"
                    value={customPoints[y.id] || ""} 
                    onChange={e => setCustomPoints({...customPoints, [y.id]: parseInt(e.target.value) || 0})}
                  />
                  <input 
                    type="text" 
                    placeholder="السبب..." 
                    className="flex-1 sm:w-28 border border-gray-300 p-2 rounded-lg text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none font-bold text-xs sm:text-sm bg-white min-w-0"
                    value={customReason[y.id] || ""} 
                    onChange={e => setCustomReason({...customReason, [y.id]: e.target.value})}
                  />
                  <button 
                    onClick={() => handleAddPoints(y.id, customPoints[y.id], customReason[y.id])} 
                    className="bg-blue-900 hover:bg-blue-800 text-white px-3 sm:px-4 py-2 rounded-lg font-black shadow-sm transition text-xs sm:text-sm shrink-0 active:scale-95"
                  >
                    إضافة
                  </button>
                </div>

              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
