"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";

interface YouthEfteqad {
  id: string;
  name: string;
  grade: string;
  gender: string;
  imageUrl?: string;
  lastLiturgy: string | null;
  lastAny: string | null;
  daysSinceLast: number;
  totalPoints: number;
  attendedToday: boolean;
  todayActivities: string[];
}

export default function Efteqad() {
  const [data, setData] = useState<YouthEfteqad[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("غائب_اليوم");
  const [filterGrade, setFilterGrade] = useState<string>("الكل");
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    fetch('/api/efteqad')
      .then(res => res.json())
      .then(d => {
        const list = Array.isArray(d) ? d : (d.youth || []);
        setData(list);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "لم يحضر بعد";
    return new Date(dateString).toLocaleDateString('ar-EG-u-nu-latn', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // إحصائيات سريعة
  const stats = useMemo(() => {
    const total = data.length;
    const attendedToday = data.filter(y => y.attendedToday).length;
    const absentToday = data.filter(y => !y.attendedToday).length;
    const chronic = data.filter(y => y.daysSinceLast === -1 || y.daysSinceLast > 14).length;
    const hasAttendanceToday = attendedToday > 0;
    return { total, attendedToday, absentToday, chronic, hasAttendanceToday };
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter(y => {
      // 1. فلتر البحث بالاسم
      if (searchTerm.trim() && !y.name.toLowerCase().includes(searchTerm.trim().toLowerCase())) {
        return false;
      }

      // 2. فلتر المرحلة
      if (filterGrade !== "الكل") {
        const normalizedYouthGrade = (y.grade || "").replace("أولي", "أولى").replace("ثانية", "تانية").replace("ثالثة", "تالتة");
        const normalizedFilter = filterGrade.replace("أولي", "أولى").replace("ثانية", "تانية").replace("ثالثة", "تالتة");
        if (normalizedYouthGrade !== normalizedFilter) {
          return false;
        }
      }

      // 3. فلتر الحالة (غياب / حضور / انقطاع)
      if (filterStatus === "الكل") {
        return true;
      }

      // غياب اليوم / الأسبوع: يشمل كل من لم يسجل حضور اليوم حتى لو كان حاضر الأسبوع الماضي
      if (filterStatus === "غائب_اليوم" || filterStatus === "غياب") {
        if (stats.hasAttendanceToday) {
          return !y.attendedToday;
        } else {
          return y.daysSinceLast > 7 || y.daysSinceLast === -1;
        }
      }

      // حاضر اليوم
      if (filterStatus === "حاضر_اليوم") {
        return y.attendedToday;
      }

      // انقطاع تام (أكثر من أسبوعين أو لم يحضر إطلاقاً)
      if (filterStatus === "انقطاع") {
        return y.daysSinceLast === -1 || y.daysSinceLast > 14;
      }

      // مواظبون (حضر اليوم أو خلال الأسبوع الماضي)
      if (filterStatus === "مواظب") {
        return y.attendedToday || (y.daysSinceLast >= 0 && y.daysSinceLast <= 7);
      }

      return true;
    });
  }, [data, filterStatus, filterGrade, searchTerm, stats.hasAttendanceToday]);

  return (
    <div dir="rtl" className="min-h-screen bg-slate-100 p-3 sm:p-6 md:p-8 text-gray-900">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xs border border-gray-200 gap-3">
          <div>
            <h1 className="text-xl sm:text-3xl font-black text-blue-900 flex items-center gap-2">
              <span>🔍</span> المتابعة والافتقاد
            </h1>
            <p className="text-xs sm:text-sm font-bold text-gray-500 mt-1">
              متابعة غياب اليوم والأسبوع، وحصر الشباب المحتاجين افتقاد ورعاية
            </p>
          </div>
          <Link 
            href="/admin" 
            className="bg-gray-800 hover:bg-black text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-bold transition shadow-xs text-xs sm:text-sm whitespace-nowrap self-end sm:self-auto active:scale-95"
          >
            لوحة الخدام &rarr;
          </Link>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <button 
            onClick={() => setFilterStatus("غائب_اليوم")}
            className={`p-3.5 sm:p-4 rounded-2xl border text-right transition active:scale-95 ${
              filterStatus === "غائب_اليوم" || filterStatus === "غياب" 
                ? 'bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-400 ring-offset-2' 
                : 'bg-white hover:bg-amber-50 text-gray-900 border-gray-200 shadow-xs'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-black opacity-90">🚨 غائب اليوم / الأسبوع</span>
              <span className="text-lg sm:text-2xl font-black">{stats.absentToday}</span>
            </div>
            <p className="text-[11px] sm:text-xs opacity-80 font-bold">لم يسجلوا حضور اليوم</p>
          </button>

          <button 
            onClick={() => setFilterStatus("حاضر_اليوم")}
            className={`p-3.5 sm:p-4 rounded-2xl border text-right transition active:scale-95 ${
              filterStatus === "حاضر_اليوم" 
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-400 ring-offset-2' 
                : 'bg-white hover:bg-emerald-50 text-gray-900 border-gray-200 shadow-xs'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-black opacity-90">🟢 حاضر اليوم بالـ QR</span>
              <span className="text-lg sm:text-2xl font-black">{stats.attendedToday}</span>
            </div>
            <p className="text-[11px] sm:text-xs opacity-80 font-bold">سجلوا حضور اليوم</p>
          </button>

          <button 
            onClick={() => setFilterStatus("انقطاع")}
            className={`p-3.5 sm:p-4 rounded-2xl border text-right transition active:scale-95 ${
              filterStatus === "انقطاع" 
                ? 'bg-rose-600 text-white border-rose-700 shadow-md ring-2 ring-rose-400 ring-offset-2' 
                : 'bg-white hover:bg-rose-50 text-gray-900 border-gray-200 shadow-xs'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-black opacity-90">🔴 انقطاع تام / عاجل</span>
              <span className="text-lg sm:text-2xl font-black">{stats.chronic}</span>
            </div>
            <p className="text-[11px] sm:text-xs opacity-80 font-bold">منذ أسبوعين أو لم يحضروا</p>
          </button>

          <button 
            onClick={() => setFilterStatus("الكل")}
            className={`p-3.5 sm:p-4 rounded-2xl border text-right transition active:scale-95 ${
              filterStatus === "الكل" 
                ? 'bg-blue-600 text-white border-blue-700 shadow-md ring-2 ring-blue-400 ring-offset-2' 
                : 'bg-white hover:bg-blue-50 text-gray-900 border-gray-200 shadow-xs'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-black opacity-90">👥 إجمالي المخدومين</span>
              <span className="text-lg sm:text-2xl font-black">{stats.total}</span>
            </div>
            <p className="text-[11px] sm:text-xs opacity-80 font-bold">كل شباب ثانوي المسجلين</p>
          </button>
        </div>

        {/* Search & Filters Bar */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl shadow-xs border border-gray-200 space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="🔍 ابحث بالاسم عن أي مخدوم..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-gray-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white transition"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")} 
                  className="absolute left-3 top-2.5 text-gray-400 hover:text-gray-600 text-xs font-black"
                >
                  ✕ مسح
                </button>
              )}
            </div>

            {/* Grade Selector */}
            <div className="flex gap-2 items-center">
              <span className="text-xs font-bold text-gray-500 shrink-0">المرحلة:</span>
              <select
                value={filterGrade}
                onChange={e => setFilterGrade(e.target.value)}
                className="bg-slate-50 border border-gray-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-gray-900 focus:outline-none focus:border-blue-500 transition"
              >
                <option value="الكل">جميع المراحل</option>
                <option value="أولى ثانوي">أولى ثانوي</option>
                <option value="تانية ثانوي">تانية ثانوي</option>
                <option value="تالتة ثانوي">تالتة ثانوي</option>
              </select>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 items-center">
            <span className="text-xs font-bold text-gray-500 ml-1">عرض:</span>
            {[
              { id: "غائب_اليوم", label: `🚨 غياب الأسبوع ده (${stats.absentToday})`, color: 'bg-amber-500 text-white' },
              { id: "حاضر_اليوم", label: `🟢 حاضر اليوم (${stats.attendedToday})`, color: 'bg-emerald-600 text-white' },
              { id: "انقطاع", label: `🔴 انقطاع تام (${stats.chronic})`, color: 'bg-rose-600 text-white' },
              { id: "الكل", label: `الكل (${stats.total})`, color: 'bg-blue-600 text-white' },
            ].map(f => {
              const active = filterStatus === f.id || (f.id === "غائب_اليوم" && filterStatus === "غياب");
              return (
                <button
                  key={f.id}
                  onClick={() => setFilterStatus(f.id)}
                  className={`px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm transition ${
                    active 
                      ? `${f.color} shadow-xs scale-105` 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* List Content */}
        {loading ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-200">
            <p className="text-xl font-bold text-gray-500">جاري تحليل بيانات الحضور والغياب... ⏳</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 space-y-2">
            <span className="text-4xl">🎉</span>
            <p className="text-lg font-black text-gray-700">لا يوجد مخدومين في هذا الفلتر حالياً!</p>
            <p className="text-xs sm:text-sm text-gray-500">جرب تغيير الفلتر أو مسح البحث</p>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-3 px-1">
              <span className="text-xs font-bold text-gray-500">
                عرض {filteredData.length} من {data.length} مخدوم
              </span>
              {filterStatus === "غائب_اليوم" && (
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  ⚠️ يشمل كل الشباب الذين لم يسجلوا حضور اليوم حتى لو حضروا الأسبوع الماضي
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
              {filteredData.map(y => {
                // تلوين الكارت حسب الحالة
                let borderColor = 'border-t-amber-500';
                let badgeBg = 'bg-amber-500';
                let badgeText = 'غائب اليوم ❌';
                let statusSubtext = `آخر حضور: ${formatDate(y.lastAny)}`;

                if (y.attendedToday) {
                  borderColor = 'border-t-emerald-500';
                  badgeBg = 'bg-emerald-600';
                  badgeText = 'حاضر اليوم 👏';
                  statusSubtext = y.todayActivities.length > 0 
                    ? `سجل اليوم: ${y.todayActivities.join(' • ')}` 
                    : 'حضر اليوم بالـ QR';
                } else if (y.daysSinceLast === -1) {
                  borderColor = 'border-t-rose-600';
                  badgeBg = 'bg-rose-600';
                  badgeText = 'انقطاع تام ⚠️';
                  statusSubtext = 'لم يسجل أي حضور في الخدمة بعد';
                } else if (y.daysSinceLast > 14) {
                  borderColor = 'border-t-rose-600';
                  badgeBg = 'bg-rose-600';
                  badgeText = `غائب منذ ${y.daysSinceLast} يوم ⚠️`;
                  statusSubtext = `آخر حضور: ${formatDate(y.lastAny)}`;
                } else {
                  // غائب اليوم لكن كان حاضر الأسبوع الماضي!
                  borderColor = 'border-t-amber-500';
                  badgeBg = 'bg-amber-500';
                  badgeText = 'غائب اليوم ❌';
                  statusSubtext = `كان حاضر الأسبوع الماضي (${formatDate(y.lastAny)})`;
                }

                return (
                  <div 
                    key={y.id} 
                    className={`bg-white rounded-2xl shadow-xs p-4 sm:p-5 border-t-6 border border-gray-200 flex flex-col justify-between transition hover:shadow-md ${borderColor}`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3 gap-2">
                        <div>
                          <h2 className="text-lg sm:text-xl font-black text-gray-900 leading-tight">{y.name}</h2>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-gray-500">{y.grade}</span>
                            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                              ⭐ {y.totalPoints} نقطة
                            </span>
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-black text-white shrink-0 shadow-xs ${badgeBg}`}>
                          {badgeText}
                        </span>
                      </div>
                      
                      {/* تفاصيل الحضور والغياب */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-gray-200 mb-4 space-y-1.5 text-xs sm:text-sm">
                        <div className="text-gray-700 flex justify-between items-center">
                          <span className="font-bold">📅 الحالة:</span>
                          <span className="font-bold text-gray-900">{statusSubtext}</span>
                        </div>
                        <div className="text-gray-600 flex justify-between items-center pt-1 border-t border-gray-200">
                          <span>⛪ آخر قداس:</span>
                          <strong className="text-blue-900">{formatDate(y.lastLiturgy)}</strong>
                        </div>
                      </div>
                    </div>

                    <Link 
                      href={`/admin/youth/${y.id}`} 
                      className="block text-center w-full bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-800 font-black py-2.5 rounded-xl border border-blue-200 transition text-xs sm:text-sm shadow-xs active:scale-95"
                    >
                      عرض سجل المخدوم &larr;
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
