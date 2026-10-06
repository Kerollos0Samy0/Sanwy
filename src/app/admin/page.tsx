"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { fireConfetti, playSuccessSound } from "@/lib/effects";

export default function Admin() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("الكل");
  const [currentServant, setCurrentServant] = useState("أدمن");
  const [youths, setYouths] = useState<any[]>([]);
  const [customPoints, setCustomPoints] = useState<{ [key: string]: number }>({});
  const [customReason, setCustomReason] = useState<{ [key: string]: string }>({});

  const filteredYouths = youths.filter(y => {
    const matchesGrade = selectedGrade === "الكل" || y.grade === selectedGrade;
    const matchesSearch = y.name.includes(searchQuery);
    return matchesGrade && matchesSearch;
  });

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

  // Sort by grade, then by name
  filteredYouths.sort((a, b) => {
    const orderA = gradeOrder[a.grade] || 99;
    const orderB = gradeOrder[b.grade] || 99;
    if (orderA !== orderB) return orderA - orderB;
    return (a.name || "").localeCompare(b.name || "");
  });

  return (
    <div dir="rtl" className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6 border-b-2 border-gray-200 pb-4 gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Logo" className="w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-white shadow-md object-cover" />
            <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900">لوحة تحكم الخدام</h1>
          </div>
          <Link href="/admin/add-youth" className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-xl shadow-md transition whitespace-nowrap ml-auto md:ml-0">
            + إضافة مخدوم
          </Link>
        </div>
        
        {/* Top Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Link href="/admin/record-points" className="flex-1 min-w-[140px] bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-2 py-6 rounded-2xl shadow-md text-lg text-center flex flex-col items-center justify-center transition transform hover:-translate-y-1">
            <span className="text-3xl mb-2">✍️</span>
            تسجيل النقاط
          </Link>
          <Link href="/admin/scan" className="flex-1 min-w-[140px] bg-blue-600 hover:bg-blue-700 text-white font-bold px-2 py-6 rounded-2xl shadow-md text-lg text-center flex flex-col items-center justify-center transition transform hover:-translate-y-1">
            <span className="text-3xl mb-2">📷</span>
            الكاميرا (QR)
          </Link>
          <Link href="/admin/cards" className="flex-1 min-w-[140px] bg-purple-600 hover:bg-purple-700 text-white font-bold px-2 py-6 rounded-2xl shadow-md text-lg text-center flex flex-col items-center justify-center transition transform hover:-translate-y-1">
            <span className="text-3xl mb-2">🖨️</span>
            طباعة الكارنيهات
          </Link>
          <Link href="/dashboard" className="flex-1 min-w-[140px] bg-green-600 hover:bg-green-700 text-white font-bold px-2 py-6 rounded-2xl shadow-md text-lg text-center flex flex-col items-center justify-center transition transform hover:-translate-y-1">
            <span className="text-3xl mb-2">📊</span>
            لوحة الأبطال
          </Link>
          <Link href="/admin/efteqad" className="flex-1 min-w-[140px] bg-red-600 hover:bg-red-700 text-white font-bold px-2 py-6 rounded-2xl shadow-md text-lg text-center flex flex-col items-center justify-center transition transform hover:-translate-y-1">
            <span className="text-3xl mb-2">🔍</span>
            الافتقاد
          </Link>
          <Link href="/admin/logs" className="flex-1 min-w-[140px] bg-gray-800 hover:bg-black text-white font-bold px-2 py-6 rounded-2xl shadow-md text-lg text-center flex flex-col items-center justify-center transition transform hover:-translate-y-1">
            <span className="text-3xl mb-2">📜</span>
            سجل النقاط
          </Link>
        </div>
        
        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm mb-8 border border-gray-200">
          <input 
            type="text"
            className="w-full border-2 border-gray-300 p-4 rounded-xl text-lg font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" 
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)} 
            placeholder="🔍 ابحث عن مخدوم بالاسم..." 
          />
        </div>

        {/* Youth List */}
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b pb-4 gap-4">
            <h2 className="text-2xl font-bold text-gray-800">قائمة المخدومين (الدليل)</h2>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredYouths.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 font-bold py-8">لا يوجد مخدومين في هذه المرحلة</div>
            ) : (
              filteredYouths.map(y => (
              <Link href={`/admin/youth/${y.id}`} key={y.id} className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-200">
                {y.imageUrl ? (
                  <img 
                    src={y.imageUrl} 
                    alt="Avatar" 
                    className="w-16 h-16 rounded-full shadow-sm border-2 border-gray-100 object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full shadow-sm border-2 border-gray-100 bg-blue-50 flex items-center justify-center shrink-0">
                    <svg className="w-8 h-8 text-blue-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-black text-gray-900 block leading-tight">{y.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded-md border ${getGradeColor(y.grade)}`}>{y.grade || 'غير محدد'}</span>
                    <span className="text-sm font-bold text-gray-500">
                      <strong className="text-blue-700 text-lg mx-1">{y.totalPoints}</strong> نقطة
                    </span>
                  </div>
                </div>
              </Link>
            )))}
          </div>
        </div>
      </div>
    </div>
  );
}
