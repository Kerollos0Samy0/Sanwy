"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { fireConfetti, playSuccessSound } from "@/lib/effects";

export default function RecordPoints() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("الكل");
  const [currentServant, setCurrentServant] = useState("أدمن");
  const [youths, setYouths] = useState<any[]>([]);
  const [customPoints, setCustomPoints] = useState<{ [key: string]: number }>({});
  const [customReason, setCustomReason] = useState<{ [key: string]: string }>({});

  const fetchYouths = () => fetch('/api/youth').then(res => res.json()).then(setYouths);
  useEffect(() => { fetchYouths(); }, []);

  const allGrades = Array.from(new Set(youths.map(y => y.grade).filter(Boolean)));

  const getGradeColor = (grade: string) => {
    if (!grade) return 'bg-gray-100 text-gray-800 border-gray-200';
    if (grade.includes('أول')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (grade.includes('ثاني')) return 'bg-amber-100 text-amber-800 border-amber-200';
    if (grade.includes('تالت') || grade.includes('ثالث')) return 'bg-purple-100 text-purple-800 border-purple-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const filteredYouths = youths.filter(y => {
    const matchesGrade = selectedGrade === "الكل" || y.grade === selectedGrade;
    const matchesSearch = y.name.includes(searchQuery);
    return matchesGrade && matchesSearch;
  });

  const gradeOrder: Record<string, number> = {
    'أولى ثانوي': 1, 'أولي ثانوي': 1,
    'تانية ثانوي': 2, 'ثانية ثانوي': 2,
    'تالتة ثانوي': 3, 'ثالثة ثانوي': 3,
  };

  // Sort by grade, then by name
  filteredYouths.sort((a, b) => {
    const orderA = gradeOrder[a.grade] || 99;
    const orderB = gradeOrder[b.grade] || 99;
    if (orderA !== orderB) return orderA - orderB;
    return (a.name || "").localeCompare(b.name || "");
  });

  const handleAddPoints = async (id: string, points: number, reason: string) => {
    if (!points || points === 0) return alert("برجاء إدخال عدد نقاط صحيح");
    if (!reason) return alert("برجاء إدخال السبب");
    const res = await fetch('/api/points', {
      method: 'POST',
      body: JSON.stringify({ youthId: id, reason, points, servantName: currentServant || "أدمن" })
    });
    
    playSuccessSound();
    fireConfetti();

    const data = await res.json();
    if (reason === "القداس") {
      alert(`تم إضافة ${data.log.points} نقطة للقداس (حسب التكرار هذا الأسبوع)`);
    }
    setCustomPoints(prev => ({...prev, [id]: 0}));
    setCustomReason(prev => ({...prev, [id]: ""}));
    fetchYouths();
  }

  return (
    <div dir="rtl" className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6 border-b-2 border-gray-200 pb-4 gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900">✍️ تسجيل النقاط والغياب</h1>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200 ml-auto">
            <label className="text-gray-600 font-bold text-sm whitespace-nowrap">اسم الخادم:</label>
            <input 
              type="text" 
              value={currentServant} 
              onChange={(e) => setCurrentServant(e.target.value)}
              className="w-24 md:w-40 border-b-2 border-blue-200 focus:border-blue-500 outline-none text-blue-900 font-bold bg-transparent"
              placeholder="اسمك..."
            />
          </div>
          <Link href="/admin" className="bg-gray-800 hover:bg-black text-white px-6 py-3 rounded-xl font-bold transition shadow-md whitespace-nowrap">
            العودة للوحة الخدام &rarr;
          </Link>
        </div>
        
        <div className="bg-white p-4 rounded-2xl shadow-sm mb-8 border border-gray-200">
          <input 
            type="text"
            className="w-full border-2 border-gray-300 p-4 rounded-xl text-lg font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" 
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)} 
            placeholder="🔍 ابحث عن مخدوم بالاسم..." 
          />
        </div>

        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b pb-4 gap-4">
            <h2 className="text-2xl font-bold text-gray-800">قائمة المخدومين للتسجيل</h2>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <label className="font-bold text-gray-700 whitespace-nowrap">تصفية بالمرحلة:</label>
              <select 
                className="flex-1 md:w-48 border-2 border-gray-300 p-2 rounded-xl font-bold text-gray-900 focus:outline-none focus:border-blue-500"
                value={selectedGrade} onChange={e => setSelectedGrade(e.target.value)}
              >
                <option value="الكل">الكل</option>
                {allGrades.map((g: any) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid gap-6">
            {filteredYouths.length === 0 ? (
              <div className="text-center text-gray-500 font-bold py-8">لا يوجد مخدومين في هذه المرحلة</div>
            ) : (
              filteredYouths.map(y => (
              <div key={y.id} className={`flex flex-col xl:flex-row justify-between items-start xl:items-center p-5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 gap-6 border-r-4 ${y.gender === 'بنت' ? 'border-r-pink-400 hover:border-pink-300' : 'border-r-blue-400 hover:border-blue-300'}`}>
                
                <div className="flex items-center gap-4 w-full xl:w-1/3 border-b-2 xl:border-b-0 border-gray-100 pb-4 xl:pb-0">
                  {y.imageUrl ? (
                    <img 
                      src={y.imageUrl} 
                      alt="Avatar" 
                      className="w-16 h-16 rounded-full shadow-sm border-2 border-gray-100 object-cover shrink-0"
                    />
                  ) : (
                    <div className={`w-16 h-16 rounded-full shadow-sm border-2 border-gray-100 flex items-center justify-center shrink-0 ${y.gender === 'بنت' ? 'bg-pink-50' : 'bg-blue-50'}`}>
                      <svg className={`w-8 h-8 ${y.gender === 'بنت' ? 'text-pink-300' : 'text-blue-300'}`} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                  )}
                  <div>
                    <Link href={`/admin/youth/${y.id}`} className="text-2xl font-black text-gray-900 hover:text-blue-600 transition block leading-tight">{y.name}</Link>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded-md border ${getGradeColor(y.grade)}`}>{y.grade || 'غير محدد'}</span>
                      <span className="text-sm font-bold text-gray-500">
                        <strong className="text-blue-700 text-xl mx-1">{y.totalPoints}</strong> نقطة
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 md:gap-3 w-full xl:w-auto xl:justify-center">
                  <button onClick={() => handleAddPoints(y.id, 50, "القداس")} className="flex-1 md:flex-none bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 px-4 py-3 rounded-xl font-bold text-sm md:text-base transition">القداس (50/10)</button>
                  <button onClick={() => handleAddPoints(y.id, 20, "التناول")} className="flex-1 md:flex-none bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white border border-teal-200 px-4 py-3 rounded-xl font-bold text-sm md:text-base transition">التناول (+20)</button>
                  <button onClick={() => handleAddPoints(y.id, 30, "التسبحة")} className="flex-1 md:flex-none bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white border border-purple-200 px-4 py-3 rounded-xl font-bold text-sm md:text-base transition">التسبحة (+30)</button>
                  <button onClick={() => handleAddPoints(y.id, 20, "العشية")} className="flex-1 md:flex-none bg-orange-50 hover:bg-orange-500 text-orange-700 hover:text-white border border-orange-200 px-4 py-3 rounded-xl font-bold text-sm md:text-base transition">العشية (+20)</button>
                  <button onClick={() => handleAddPoints(y.id, 50, "الخدمة")} className="flex-1 md:flex-none bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 px-4 py-3 rounded-xl font-bold text-sm md:text-base transition">الخدمة (+50)</button>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-auto items-center bg-gray-50 p-3 rounded-xl border border-gray-200 shadow-inner">
                  <input 
                    type="number" placeholder="الرقم" 
                    className="w-full sm:w-24 border border-gray-300 p-2 rounded-lg text-center font-black text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                    value={customPoints[y.id] || ""} onChange={e => setCustomPoints({...customPoints, [y.id]: parseInt(e.target.value)})}
                  />
                  <input 
                    type="text" placeholder="السبب" 
                    className="w-full sm:w-36 border border-gray-300 p-2 rounded-lg text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none font-bold text-sm"
                    value={customReason[y.id] || ""} onChange={e => setCustomReason({...customReason, [y.id]: e.target.value})}
                  />
                  <button 
                    onClick={() => handleAddPoints(y.id, customPoints[y.id], customReason[y.id])} 
                    className="w-full sm:w-auto bg-gray-800 hover:bg-black text-white px-4 py-2 rounded-lg font-bold shadow-sm transition text-sm">
                    تأكيد
                  </button>
                </div>
              </div>
            )))}
          </div>
        </div>
      </div>
    </div>
  );
}
