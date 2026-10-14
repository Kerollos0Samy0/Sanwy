"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Admin() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("الكل");
  const [selectedGender, setSelectedGender] = useState("الكل");
  const [youths, setYouths] = useState<any[]>([]);

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

  const gradeOrder: Record<string, number> = {
    'أولى ثانوي': 1, 'أولي ثانوي': 1,
    'تانية ثانوي': 2, 'ثانية ثانوي': 2,
    'تالتة ثانوي': 3, 'ثالثة ثانوي': 3,
  };

  const filteredYouths = youths.filter(y => {
    const matchesGrade = selectedGrade === "الكل" || y.grade === selectedGrade;
    const matchesGender = selectedGender === "الكل" || y.gender === selectedGender;
    const matchesSearch = !searchQuery || y.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGrade && matchesGender && matchesSearch;
  });

  filteredYouths.sort((a, b) => {
    const orderA = gradeOrder[a.grade] || 99;
    const orderB = gradeOrder[b.grade] || 99;
    if (orderA !== orderB) return orderA - orderB;
    return (a.name || "").localeCompare(b.name || "");
  });

  const boysCount = youths.filter(y => y.gender === "ولد").length;
  const girlsCount = youths.filter(y => y.gender === "بنت").length;

  return (
    <div dir="rtl" className="min-h-screen bg-slate-100 p-3 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-5 bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-200 gap-3">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-white shadow-sm object-cover shrink-0" />
            <div>
              <h1 className="text-xl sm:text-3xl font-black text-blue-900 leading-tight">لوحة الخدام</h1>
              <p className="text-xs sm:text-sm font-bold text-gray-500 mt-0.5">
                {youths.length} مخدوم (👦 {boysCount} | 👧 {girlsCount})
              </p>
            </div>
          </div>
          <Link href="/admin/add-youth" className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-3.5 sm:px-5 py-2.5 rounded-xl shadow-sm transition text-xs sm:text-base whitespace-nowrap active:scale-95">
            + مخدوم جديد
          </Link>
        </div>
        
        {/* Quick Actions Mobile Grid (2 cols on mobile, 3 on tablet, 6 on desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4 mb-6">
          <Link href="/admin/record-points" className="bg-amber-500 hover:bg-amber-600 text-white font-black p-3.5 sm:p-5 rounded-2xl shadow-sm text-center flex flex-col items-center justify-center transition active:scale-95">
            <span className="text-2xl sm:text-3xl mb-1.5">✍️</span>
            <span className="text-sm sm:text-base">تسجيل النقاط</span>
          </Link>

          <Link href="/admin/scan" className="bg-blue-600 hover:bg-blue-700 text-white font-black p-3.5 sm:p-5 rounded-2xl shadow-sm text-center flex flex-col items-center justify-center transition active:scale-95">
            <span className="text-2xl sm:text-3xl mb-1.5">📷</span>
            <span className="text-sm sm:text-base">المسح (QR)</span>
          </Link>

          <Link href="/admin/cards" className="bg-purple-600 hover:bg-purple-700 text-white font-black p-3.5 sm:p-5 rounded-2xl shadow-sm text-center flex flex-col items-center justify-center transition active:scale-95">
            <span className="text-2xl sm:text-3xl mb-1.5">🪪</span>
            <span className="text-sm sm:text-base">الكارنيهات</span>
          </Link>

          <Link href="/dashboard" className="bg-teal-600 hover:bg-teal-700 text-white font-black p-3.5 sm:p-5 rounded-2xl shadow-sm text-center flex flex-col items-center justify-center transition active:scale-95">
            <span className="text-2xl sm:text-3xl mb-1.5">📊</span>
            <span className="text-sm sm:text-base">لوحة الأبطال</span>
          </Link>

          <Link href="/admin/efteqad" className="bg-rose-600 hover:bg-rose-700 text-white font-black p-3.5 sm:p-5 rounded-2xl shadow-sm text-center flex flex-col items-center justify-center transition active:scale-95">
            <span className="text-2xl sm:text-3xl mb-1.5">🔍</span>
            <span className="text-sm sm:text-base">الافتقاد</span>
          </Link>

          <Link href="/admin/logs" className="bg-gray-800 hover:bg-black text-white font-black p-3.5 sm:p-5 rounded-2xl shadow-sm text-center flex flex-col items-center justify-center transition active:scale-95">
            <span className="text-2xl sm:text-3xl mb-1.5">📜</span>
            <span className="text-sm sm:text-base">سجل النقاط</span>
          </Link>
        </div>
        
        {/* Search & Filters */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl shadow-sm mb-6 border border-gray-200 flex flex-col gap-3">
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
                {allGrades.map((g: any) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Youth Grid */}
        <div className="bg-white p-3.5 sm:p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
            <h2 className="text-lg sm:text-2xl font-black text-gray-800">دليل المخدومين</h2>
            <span className="text-xs sm:text-sm font-bold text-gray-500">
              عرض {filteredYouths.length} من {youths.length}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredYouths.length === 0 ? (
              <div className="col-span-full text-center text-gray-400 font-bold py-10 text-base">لا يوجد مخدومين مطابقين للبحث</div>
            ) : (
              filteredYouths.map(y => (
                <Link 
                  href={`/admin/youth/${y.id}`} 
                  key={y.id} 
                  className={`flex items-center gap-3.5 p-3.5 sm:p-4 bg-white border border-gray-200 rounded-2xl shadow-xs hover:shadow-md transition-all active:scale-[0.98] border-r-4 ${y.gender === 'بنت' ? 'border-r-pink-400' : 'border-r-blue-500'}`}
                >
                  {y.imageUrl ? (
                    <img 
                      src={y.imageUrl} 
                      alt="Avatar" 
                      className="w-13 h-13 sm:w-16 sm:h-16 rounded-full shadow-xs border border-gray-100 object-cover shrink-0"
                    />
                  ) : (
                    <div className={`w-13 h-13 sm:w-16 sm:h-16 rounded-full shadow-xs border border-gray-100 flex items-center justify-center shrink-0 ${y.gender === 'بنت' ? 'bg-pink-50 text-pink-400' : 'bg-blue-50 text-blue-500'}`}>
                      <span className="text-2xl sm:text-3xl">
                        {y.gender === 'بنت' ? '👧' : '👦'}
                      </span>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg font-black text-gray-900 truncate">{y.name}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${getGradeColor(y.grade)}`}>
                        {y.grade || 'غير محدد'}
                      </span>
                      <span className="text-xs font-bold text-gray-500">
                        <strong className="text-blue-700 text-sm sm:text-base mx-0.5">{y.totalPoints}</strong> نقطة
                      </span>
                    </div>
                  </div>
                  <span className="text-gray-400 text-sm font-bold">&larr;</span>
                </Link>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
