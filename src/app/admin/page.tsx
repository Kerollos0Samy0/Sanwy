"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fireConfetti, playSuccessSound } from "@/lib/effects";

const t = {
  ar: {
    title: "لوحة الخدام",
    youthSubtitle: (total: number, boys: number, girls: number) => `${total} مخدوم (👦 ${boys} ولاد | 👧 ${girls} بنات)`,
    newYouth: "+ مخدوم جديد",
    langButton: "English 🌐",
    actions: {
      points: "تسجيل النقاط",
      scan: "المسح (QR)",
      cards: "الكارنيهات",
      leaderboard: "لوحة الأبطال",
      efteqad: "الافتقاد",
      logs: "سجل النقاط",
    },
    searchPlaceholder: "🔍 ابحث بالاسم...",
    all: "الكل",
    boys: "👦 ولاد",
    girls: "👧 بنات",
    gradeLabel: "المرحلة:",
    allGrades: "كل المراحل",
    grades: {
      "أولى ثانوي": "أولى ثانوي",
      "تانية ثانوي": "تانية ثانوي",
      "تالتة ثانوي": "تالتة ثانوي",
      "غير محدد": "غير محدد",
    } as Record<string, string>,
    directoryTitle: "دليل المخدومين",
    showingCount: (shown: number, total: number) => `عرض ${shown} من ${total}`,
    noYouth: "لا يوجد مخدومين مطابقين للبحث",
    pts: "نقطة",
  },
  en: {
    title: "Servants Dashboard",
    youthSubtitle: (total: number, boys: number, girls: number) => `${total} Youth (👦 ${boys} Boys | 👧 ${girls} Girls)`,
    newYouth: "+ New Youth",
    langButton: "عربي 🌐",
    actions: {
      points: "Record Points",
      scan: "QR Scanner",
      cards: "ID Cards",
      leaderboard: "Leaderboard",
      efteqad: "Visitation",
      logs: "Points Logs",
    },
    searchPlaceholder: "🔍 Search by name...",
    all: "All",
    boys: "👦 Boys",
    girls: "👧 Girls",
    gradeLabel: "Grade:",
    allGrades: "All Grades",
    grades: {
      "أولى ثانوي": "1st Secondary",
      "أولي ثانوي": "1st Secondary",
      "تانية ثانوي": "2nd Secondary",
      "ثانية ثانوي": "2nd Secondary",
      "تالتة ثانوي": "3rd Secondary",
      "ثالثة ثانوي": "3rd Secondary",
      "غير محدد": "Unspecified",
    } as Record<string, string>,
    directoryTitle: "Youth Directory",
    showingCount: (shown: number, total: number) => `Showing ${shown} of ${total}`,
    noYouth: "No youth match your search",
    pts: "pts",
  }
};

export default function Admin() {
  const router = useRouter();
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("الكل");
  const [selectedGender, setSelectedGender] = useState("الكل");
  const [youths, setYouths] = useState<any[]>([]);
  const [role, setRole] = useState<'admin' | 'servant' | null>(null);

  // Reset modal state
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmationInput, setResetConfirmationInput] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [resetMsg, setResetMsg] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem('admin_lang');
    if (saved === 'en' || saved === 'ar') {
      setLang(saved);
    }

    // Check user role
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setRole(data.role);
        }
      })
      .catch(() => {});
  }, []);

  const toggleLang = () => {
    const next = lang === 'ar' ? 'en' : 'ar';
    setLang(next);
    localStorage.setItem('admin_lang', next);
  };

  const fetchYouths = () => fetch('/api/youth').then(res => res.json()).then(setYouths);
  useEffect(() => { fetchYouths(); }, []);

  const handleLogout = async () => {
    await fetch('/api/login', { method: 'DELETE' });
    router.push('/login');
  };

  const handleResetCounter = async () => {
    if (resetConfirmationInput.trim() !== "تصفير") {
      alert("برجاء كتابة كلمة 'تصفير' للتأكيد");
      return;
    }

    setIsResetting(true);
    try {
      const res = await fetch('/api/admin/reset-points', {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok) {
        setShowResetModal(false);
        setResetConfirmationInput("");
        setResetMsg("تم تصفير عداد جميع المخدومين بنجاح للبدء من الصفر 🔄");
        playSuccessSound();
        fireConfetti();
        fetchYouths();
        setTimeout(() => setResetMsg(""), 5000);
      } else {
        alert(data.error || "فشل في تصفير العداد");
      }
    } catch {
      alert("حدث خطأ في الاتصال بالخادم");
    } finally {
      setIsResetting(false);
    }
  };

  const curT = t[lang];

  const GRADES = ["أولى ثانوي", "تانية ثانوي", "تالتة ثانوي"];

  const getGradeColor = (grade: string) => {
    if (!grade) return 'bg-gray-100 text-gray-800 border-gray-200';
    if (grade.includes('أول')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (grade.includes('ثاني') || grade.includes('تاني')) return 'bg-amber-100 text-amber-800 border-amber-200';
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
    <div dir={lang === 'en' ? 'ltr' : 'rtl'} className="min-h-screen bg-slate-100 p-3 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-200 gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-white shadow-sm object-cover shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-3xl font-black text-blue-900 leading-tight">{curT.title}</h1>
                {role === 'admin' ? (
                  <span className="bg-amber-100 text-amber-900 border border-amber-300 font-black text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full shadow-xs">
                    👑 الأدمن العام
                  </span>
                ) : (
                  <span className="bg-blue-100 text-blue-800 border border-blue-200 font-bold text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full shadow-xs">
                    👤 حساب الخدام
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm font-bold text-gray-500 mt-0.5">
                {curT.youthSubtitle(youths.length, boysCount, girlsCount)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            {/* Language Switcher */}
            <button
              onClick={toggleLang}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-black px-3 py-2 rounded-xl border border-slate-300 shadow-xs transition text-xs sm:text-sm flex items-center gap-1 active:scale-95"
              title={lang === 'ar' ? 'Switch interface to English' : 'تحويل الواجهة للغة العربية'}
            >
              <span>{curT.langButton}</span>
            </button>

            <Link href="/admin/add-youth" className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-3.5 sm:px-4 py-2 rounded-xl shadow-sm transition text-xs sm:text-sm whitespace-nowrap active:scale-95">
              {curT.newYouth}
            </Link>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-700 border border-gray-200 font-black px-3 py-2 rounded-xl text-xs sm:text-sm transition active:scale-95"
              title="تسجيل الخروج"
            >
              🚪 خروج
            </button>
          </div>
        </div>

        {/* Reset Success Message Banner */}
        {resetMsg && (
          <div className="bg-green-600 text-white font-black p-3.5 rounded-2xl mb-5 shadow-sm text-center text-sm sm:text-base animate-fade-in flex items-center justify-center gap-2">
            <span>✅</span> {resetMsg}
          </div>
        )}

        {/* Admin Special Panel (Visible to Admin Role only) */}
        {role === 'admin' && (
          <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white p-4 sm:p-5 rounded-2xl shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 border border-red-500">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">👑</span>
                <h3 className="font-black text-base sm:text-lg">صلاحيات الأدمن الخاص</h3>
              </div>
              <p className="text-xs sm:text-sm text-red-100 font-bold mt-0.5">
                تصفير عداد جميع النقاط بالكامل للبدء من الصفر لموسم أو فترة جديدة في أي وقت.
              </p>
            </div>
            <button
              onClick={() => {
                setResetConfirmationInput("");
                setShowResetModal(true);
              }}
              className="bg-white hover:bg-red-50 text-red-700 font-black px-4 py-2.5 rounded-xl shadow-md transition active:scale-95 text-xs sm:text-sm whitespace-nowrap flex items-center gap-1.5"
            >
              <span>🔄</span> تصفير العداد العام
            </button>
          </div>
        )}
        
        {/* Quick Actions Mobile Grid (2 cols on mobile, 3 on tablet, 6 on desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4 mb-6">
          <Link href="/admin/record-points" className="bg-amber-500 hover:bg-amber-600 text-white font-black p-3.5 sm:p-5 rounded-2xl shadow-sm text-center flex flex-col items-center justify-center transition active:scale-95">
            <span className="text-2xl sm:text-3xl mb-1.5">✍️</span>
            <span className="text-sm sm:text-base">{curT.actions.points}</span>
          </Link>

          <Link href="/admin/scan" className="bg-blue-600 hover:bg-blue-700 text-white font-black p-3.5 sm:p-5 rounded-2xl shadow-sm text-center flex flex-col items-center justify-center transition active:scale-95">
            <span className="text-2xl sm:text-3xl mb-1.5">📷</span>
            <span className="text-sm sm:text-base">{curT.actions.scan}</span>
          </Link>

          <Link href="/admin/cards" className="bg-purple-600 hover:bg-purple-700 text-white font-black p-3.5 sm:p-5 rounded-2xl shadow-sm text-center flex flex-col items-center justify-center transition active:scale-95">
            <span className="text-2xl sm:text-3xl mb-1.5">💳</span>
            <span className="text-sm sm:text-base">{curT.actions.cards}</span>
          </Link>

          <Link href="/dashboard" className="bg-teal-600 hover:bg-teal-700 text-white font-black p-3.5 sm:p-5 rounded-2xl shadow-sm text-center flex flex-col items-center justify-center transition active:scale-95">
            <span className="text-2xl sm:text-3xl mb-1.5">📊</span>
            <span className="text-sm sm:text-base">{curT.actions.leaderboard}</span>
          </Link>

          <Link href="/admin/efteqad" className="bg-rose-600 hover:bg-rose-700 text-white font-black p-3.5 sm:p-5 rounded-2xl shadow-sm text-center flex flex-col items-center justify-center transition active:scale-95">
            <span className="text-2xl sm:text-3xl mb-1.5">🔍</span>
            <span className="text-sm sm:text-base">{curT.actions.efteqad}</span>
          </Link>

          <Link href="/admin/logs" className="bg-gray-800 hover:bg-black text-white font-black p-3.5 sm:p-5 rounded-2xl shadow-sm text-center flex flex-col items-center justify-center transition active:scale-95">
            <span className="text-2xl sm:text-3xl mb-1.5">📜</span>
            <span className="text-sm sm:text-base">{curT.actions.logs}</span>
          </Link>
        </div>
        
        {/* Search & Filters */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl shadow-sm mb-6 border border-gray-200 flex flex-col gap-3">
          <input 
            type="text"
            className="w-full border-2 border-gray-200 p-3 sm:p-3.5 rounded-xl text-base sm:text-lg font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500" 
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)} 
            placeholder={curT.searchPlaceholder} 
          />

          <div className="flex flex-wrap items-center justify-between gap-2.5">
            {/* Gender filter */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
              {[
                { key: "الكل", label: curT.all },
                { key: "ولد", label: curT.boys },
                { key: "بنت", label: curT.girls }
              ].map(item => (
                <button
                  key={item.key}
                  onClick={() => setSelectedGender(item.key)}
                  className={`px-3 py-1 rounded-lg text-xs sm:text-sm font-black transition ${selectedGender === item.key ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-600 hover:text-black'}`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Grade filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-xs sm:text-sm font-bold text-gray-600 whitespace-nowrap">{curT.gradeLabel}</label>
              <select 
                className="flex-1 sm:w-44 border border-gray-300 p-1.5 sm:p-2 rounded-xl text-xs sm:text-sm font-bold text-gray-900 focus:outline-none focus:border-blue-500 bg-white"
                value={selectedGrade} onChange={e => setSelectedGrade(e.target.value)}
              >
                <option value="الكل">{curT.allGrades}</option>
                {GRADES.map((g) => (
                  <option key={g} value={g}>{curT.grades[g] || g}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Youth Grid */}
        <div className="bg-white p-3.5 sm:p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
            <h2 className="text-lg sm:text-2xl font-black text-gray-800">{curT.directoryTitle}</h2>
            <span className="text-xs sm:text-sm font-bold text-gray-500">
              {curT.showingCount(filteredYouths.length, youths.length)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredYouths.length === 0 ? (
              <div className="col-span-full text-center text-gray-400 font-bold py-10 text-base">{curT.noYouth}</div>
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
                        {curT.grades[y.grade] || y.grade || (lang === 'en' ? 'Unspecified' : 'غير محدد')}
                      </span>
                      <span className="text-xs font-bold text-gray-500">
                        <strong className="text-blue-700 text-sm sm:text-base mx-0.5">{y.totalPoints}</strong> {curT.pts}
                      </span>
                    </div>
                  </div>
                  <span className="text-gray-400 text-sm font-bold">{lang === 'en' ? '→' : '←'}</span>
                </Link>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Confirmation Modal for Resetting Counter */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" dir="rtl">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-4 border-red-500 text-center">
            <span className="text-5xl block mb-3">⚠️</span>
            <h2 className="text-2xl font-black text-red-700 mb-2">تصفير عداد النقاط بالكامل</h2>
            <p className="text-gray-600 font-bold text-sm mb-4 leading-relaxed">
              تحذير: هذا الإجراء سيقوم بإعادة إجمالي نقاط جميع المخدومين إلى <strong>0 نقطة</strong> وحذف السجلات السابقة للبدء في موسم جديد.
              <br />
              <strong>لا يمكن التراجع عن هذه الخطوة!</strong>
            </p>

            <div className="bg-red-50 p-3 rounded-xl mb-4 border border-red-200 text-right">
              <label className="block text-xs font-black text-red-900 mb-1">
                اكتب كلمة <span className="underline font-mono text-sm text-red-600">تصفير</span> للتأكيد:
              </label>
              <input 
                type="text"
                placeholder="اكتب تصفير هنا..."
                value={resetConfirmationInput}
                onChange={e => setResetConfirmationInput(e.target.value)}
                className="w-full border-2 border-red-300 p-2.5 rounded-xl text-center font-black text-gray-900 bg-white focus:outline-none focus:border-red-600"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleResetCounter}
                disabled={isResetting || resetConfirmationInput.trim() !== "تصفير"}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-xl shadow-md transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {isResetting ? "جاري التصفير..." : "نعم، صفّر العداد الآن 🔄"}
              </button>
              <button
                onClick={() => setShowResetModal(false)}
                disabled={isResetting}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-5 rounded-xl transition active:scale-95 text-sm"
              >
                إلغاء ✕
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
