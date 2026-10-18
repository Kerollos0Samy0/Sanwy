"use client";
import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";

export default function Cards() {
  const [youths, setYouths] = useState<any[]>([]);
  const [isWhatsappMode, setIsWhatsappMode] = useState(false);
  const [selectedGender, setSelectedGender] = useState<string>("الكل");
  const [selectedGrade, setSelectedGrade] = useState<string>("الكل");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchYouths = () => {
    fetch('/api/youth')
      .then(res => res.json())
      .then(setYouths)
      .catch(console.error);
  };

  useEffect(() => {
    fetchYouths();
  }, []);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setMessage(null);
    try {
      const res = await fetch('/api/cards/generate', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ تم إنشاء وتحديث ${data.count} كارت بنجاح في مجلد cards!`);
      } else {
        setMessage(`❌ فشل في التوليد: ${data.error}`);
      }
    } catch {
      setMessage("❌ حدث خطأ أثناء الاتصال بالسيرفر");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleWhatsappPrint = () => {
    setIsWhatsappMode(true);
    setTimeout(() => {
      window.print();
      setIsWhatsappMode(false);
    }, 500);
  };

  const filteredYouths = youths.filter(y => {
    const matchesGender = selectedGender === "الكل" || y.gender === selectedGender;
    const matchesGrade = selectedGrade === "الكل" || y.grade === selectedGrade;
    const matchesSearch = !searchQuery || y.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGender && matchesGrade && matchesSearch;
  });

  const boysCount = youths.filter(y => y.gender === "ولد").length;
  const girlsCount = youths.filter(y => y.gender === "بنت").length;

  return (
    <div dir="rtl" className="p-3 sm:p-6 md:p-8 bg-slate-100 min-h-screen text-gray-900">
      <style>{`
        @media print {
          @page { 
            size: ${isWhatsappMode ? '9cm 6.2cm' : 'A4'}; 
            margin: 0; 
          }
          body { 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-hidden { display: none !important; }
        }
      `}</style>

      {/* Top Header & Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 print-hidden gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-blue-900 flex items-center gap-3">
            <span>💳</span> كارنيهات اجتماع شباب ثانوي
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-bold">
            إجمالي الطلاب: {youths.length} (👦 {boysCount} ولاد | 👧 {girlsCount} بنات)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl shadow transition text-sm flex items-center gap-1.5 disabled:opacity-50"
            title="إعادة بناء وتحديث ملفات الكارنيهات عالية الدقة"
          >
            <span>{isRegenerating ? "⏳ جاري التحديث..." : "🔄 تحديث صور الكارنيهات"}</span>
          </button>

          <button 
            onClick={handleWhatsappPrint} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl shadow flex items-center gap-1.5 text-sm transition"
          >
            <span>📱 واتساب (1 بالصفحة)</span>
          </button>

          <button 
            onClick={() => window.print()} 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl shadow flex items-center gap-1.5 text-sm transition"
          >
            <span>🖨️ طباعة مطبعة (8 بالصفحة)</span>
          </button>

          <Link href="/admin" className="bg-gray-800 text-white font-bold px-4 py-2 rounded-xl hover:bg-black shadow text-sm transition">
            العودة &rarr;
          </Link>
        </div>
      </div>

      {message && (
        <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 font-bold print-hidden">
          {message}
        </div>
      )}

      {/* Download ZIP Section */}
      <div className="mb-6 bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 text-white p-5 rounded-2xl shadow-md print-hidden flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg md:text-xl font-black text-amber-200 flex items-center gap-2">
            <span>📦</span> تحميل كل الكارنيهات الجاهزة (مضغوطة ZIP)
          </h2>
          <p className="text-gray-300 text-xs md:text-sm mt-1">
            تم توليد الكارنيهات بدقة عالية باسم كل طالب والـ QR Code الخاص به بدون صور.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          <a
            href="/cards/all_cards.zip"
            download="كل_الكارنيهات.zip"
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2 rounded-xl shadow text-xs md:text-sm transition flex items-center gap-1"
          >
            <span>⬇️ تحميل الكل ({youths.length})</span>
          </a>
          <a
            href="/cards/boys_cards.zip"
            download="كارنيهات_الولاد.zip"
            className="bg-blue-600 hover:bg-blue-500 text-white font-black px-4 py-2 rounded-xl shadow text-xs md:text-sm transition flex items-center gap-1"
          >
            <span>👦 تحميل الولاد ({boysCount})</span>
          </a>
          <a
            href="/cards/girls_cards.zip"
            download="كارنيهات_البنات.zip"
            className="bg-pink-600 hover:bg-pink-500 text-white font-black px-4 py-2 rounded-xl shadow text-xs md:text-sm transition flex items-center gap-1"
          >
            <span>👧 تحميل البنات ({girlsCount})</span>
          </a>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-200 print-hidden flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
            {["الكل", "ولد", "بنت"].map(gender => (
              <button
                key={gender}
                onClick={() => setSelectedGender(gender)}
                className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-black transition ${selectedGender === gender ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-600 hover:text-black'}`}
              >
                {gender === "الكل" ? "الكل" : gender === "ولد" ? "👦 ولاد" : "👧 بنات"}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-gray-500">المرحلة:</label>
            <select
              value={selectedGrade}
              onChange={e => setSelectedGrade(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-1.5 text-xs md:text-sm font-bold bg-white text-gray-800 focus:outline-none focus:border-blue-500"
            >
              <option value="الكل">كل المراحل</option>
              <option value="أولى ثانوي">أولى ثانوي</option>
              <option value="تانية ثانوي">تانية ثانوي</option>
              <option value="تالتة ثانوي">تالتة ثانوي</option>
            </select>
          </div>
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="🔍 بحث باسم الطالب..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-3 py-1.5 text-xs md:text-sm font-bold placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="flex flex-wrap gap-6 justify-center md:justify-start">
        {filteredYouths.map(y => {
          const safeName = y.name.replace(/[\\/:*?"<>|]/g, '_').trim();
          const safeGrade = (y.grade || 'عام').replace(/[\\/:*?"<>|]/g, '_').trim();
          const cardImageUrl = `/cards/${encodeURIComponent(`${safeName} - ${safeGrade}.png`)}`;

          return (
            <div key={y.id} className={isWhatsappMode ? 'print:break-after-page print:m-0 print:p-0' : ''}>
              <div 
                id={`card-${y.id}`} 
                className="group relative w-[9cm] max-w-[calc(100vw-2rem)] h-[6.2cm] max-h-[calc((100vw-2rem)*6.2/9)] rounded-2xl overflow-hidden shadow-md border-2 border-amber-900/20 print:w-[9cm] print:h-[6.2cm] print:border-none print:shadow-none break-inside-avoid print:m-0 bg-cover bg-center select-none mx-auto"
                style={{ backgroundImage: "url('/card-template.png')" }}
              >
                {/* QR Code Container */}
                <div 
                  className="absolute flex items-center justify-center"
                  style={{
                    left: '7.3%',
                    top: '38.8%',
                    width: '35.2%',
                    height: '48.6%'
                  }}
                >
                  <QRCodeSVG 
                    value={y.id} 
                    size={110}
                    level="M"
                    fgColor="#1a1a1a"
                    bgColor="transparent"
                    className="w-[82%] h-[82%] object-contain"
                  />
                </div>

                {/* Student Name */}
                <div 
                  className="absolute flex items-center justify-center text-center px-2"
                  style={{
                    left: '44.5%',
                    top: '47.0%',
                    width: '42.0%',
                    height: '10.8%'
                  }}
                >
                  <span 
                    className="font-black text-[#420b12] leading-tight block w-full truncate"
                    style={{
                      fontSize: y.name.length > 25 ? '11px' : y.name.length > 20 ? '12.5px' : y.name.length > 16 ? '14px' : '15.5px'
                    }}
                  >
                    {y.name}
                  </span>
                </div>

                {/* زرار تحميل الكارنيه كصورة */}
                <a
                  href={cardImageUrl}
                  download={`كارنيه_${y.name}.png`}
                  className="absolute top-2 right-2 z-50 bg-gray-900/80 hover:bg-black text-white w-8 h-8 flex items-center justify-center rounded-full shadow-md print-hidden transition-all opacity-0 group-hover:opacity-100"
                  title="تحميل الكارنيه كصورة PNG"
                >
                  ⬇️
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {filteredYouths.length === 0 && (
        <div className="text-center py-12 text-gray-500 font-bold text-lg bg-white rounded-2xl shadow-sm border border-gray-200">
          لا يوجد طلاب مطابقين للبحث أو الفلتر المحدد.
        </div>
      )}
    </div>
  );
}
