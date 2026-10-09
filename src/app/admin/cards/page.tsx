"use client";
import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";

export default function Cards() {
  const [youths, setYouths] = useState<any[]>([]);
  const [isWhatsappMode, setIsWhatsappMode] = useState(false);

  useEffect(() => {
    fetch('/api/youth').then(res => res.json()).then(setYouths);
  }, []);

  const handleWhatsappPrint = () => {
    setIsWhatsappMode(true);
    setTimeout(() => {
      window.print();
      setIsWhatsappMode(false);
    }, 500);
  };

  return (
    <div dir="rtl" className="p-4 md:p-8 bg-gray-100 min-h-screen">
      <style>{`
        @media print {
          @page { margin: 10mm; }
          body { 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
            background: white !important;
          }
          .print-hidden { display: none !important; }
        }
      `}</style>

      <div className="flex flex-col md:flex-row justify-between items-center mb-8 print-hidden gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-blue-900">طباعة الكارنيهات</h1>
        <div className="flex flex-wrap gap-3">
          <button onClick={handleWhatsappPrint} className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded shadow flex items-center gap-2 text-sm md:text-base">
            <span>واتساب (1 بالصفحة)</span>
            <span>📱</span>
          </button>
          <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded shadow text-sm md:text-base">
            طباعة مطبعة (8 بالصفحة) 🖨️
          </button>
          <Link href="/admin" className="bg-gray-800 text-white font-bold px-4 py-2 rounded hover:bg-black shadow text-sm md:text-base">العودة &rarr;</Link>
        </div>
      </div>

      {/* تصميم ظهر الكارنيه الثابت */}
      <div className={`mb-10 flex flex-col items-center md:items-start ${isWhatsappMode ? 'print-hidden' : ''}`}>
        <h2 className="text-xl font-bold text-gray-500 mb-4 print-hidden">تصميم ظهر الكارنيه (ثابت)</h2>
        <div className="w-[9cm] h-[6cm] bg-gradient-to-br from-blue-900 via-blue-950 to-gray-900 text-white rounded-xl overflow-hidden shadow-lg flex flex-col items-center justify-center border-2 border-gray-300 relative print:border-gray-400">
          {/* تأثيرات دمج الخلفية */}
          <div className="absolute top-[-2cm] right-[-2cm] w-[6cm] h-[6cm] bg-blue-500 rounded-full mix-blend-screen filter blur-[40px] opacity-30 z-0"></div>
          <div className="absolute bottom-[-2cm] left-[-2cm] w-[6cm] h-[6cm] bg-teal-400 rounded-full mix-blend-screen filter blur-[40px] opacity-20 z-0"></div>
          
          <div className="bg-white p-1 rounded-full shadow-2xl z-10 mb-2">
            <img src="/logo.png" alt="Logo" className="w-[2.2cm] h-[2.2cm] object-contain rounded-full" />
          </div>
          
          <h2 className="text-[18px] font-black tracking-widest z-10 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 drop-shadow-sm">
            كنيسة القديسة رفقة
          </h2>
          <div className="w-10 h-1 bg-gradient-to-r from-blue-400 to-teal-400 rounded-full my-1.5 z-10"></div>
          <h3 className="text-[12px] font-bold text-blue-200 z-10 tracking-wider">
            اجتماع شباب ثانوي
          </h3>
        </div>
      </div>

      <hr className={`my-8 border-2 border-dashed border-gray-300 print-hidden ${isWhatsappMode ? 'hidden' : ''}`} />

      {/* تصميم وش الكارنيه المتغير */}
      <div>
        <h2 className="text-xl font-bold text-gray-500 mb-4 print-hidden">تصميم وش الكارنيه (متغير)</h2>
        <div className="flex flex-wrap gap-6 justify-center md:justify-start">
          {youths.map(y => (
            <div key={y.id} className={isWhatsappMode ? 'print:w-full print:h-[95vh] print:flex print:items-center print:justify-center print:break-after-page' : ''}>
              <div id={`card-${y.id}`} className="group w-[9cm] h-[6cm] bg-white rounded-xl overflow-hidden shadow-md flex flex-row relative border-2 border-gray-200 print:border-gray-300 break-inside-avoid">
                
                {/* تأثيرات دمج الخلفية (وش الكارنيه) */}
                <div className="absolute top-[-2cm] right-[-2cm] w-[6cm] h-[6cm] bg-blue-100 rounded-full mix-blend-multiply filter blur-2xl opacity-80 z-0"></div>
                <div className="absolute bottom-[-2cm] left-[-2cm] w-[6cm] h-[6cm] bg-teal-50 rounded-full mix-blend-multiply filter blur-2xl opacity-80 z-0"></div>
                
                {/* Watermark Logo */}
                <img src="/logo.png" className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[4cm] h-[4cm] opacity-[0.03] object-contain z-0 grayscale" />

                {/* الناحية اليمين: الصورة والاسم */}
                <div className="w-[5.5cm] h-full flex flex-col justify-center items-center relative z-10 pl-1 pr-2">
                  
                  {/* إطار الصورة المدمج */}
                  <div className={`relative w-[2.6cm] h-[2.6cm] rounded-full p-1 mb-2 shadow-sm bg-gradient-to-tr ${y.gender === 'بنت' ? 'from-pink-400 to-rose-200' : 'from-blue-600 to-teal-300'}`}>
                    <div className="w-full h-full rounded-full overflow-hidden bg-white border-2 border-white flex items-center justify-center">
                      {y.imageUrl ? (
                        <img src={y.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <img src="/logo.png" className="w-3/4 h-3/4 object-contain opacity-40" />
                      )}
                    </div>
                  </div>
                  
                  {/* الاسم */}
                  <h2 className="text-[15px] font-black text-gray-900 text-center leading-tight">
                    {y.name}
                  </h2>
                  
                  {/* خط زخرفي بدل المرحلة */}
                  <div className={`w-12 h-1 rounded-full mt-1.5 mb-1 bg-gradient-to-r ${y.gender === 'بنت' ? 'from-pink-400 to-rose-300' : 'from-blue-500 to-teal-400'}`}></div>
                  <p className="text-[10px] font-bold text-gray-500">اجتماع شباب ثانوي</p>
                </div>

                {/* الناحية الشمال: كود QR */}
                <div className="w-[3.5cm] h-full flex items-center justify-center relative z-10 pl-2">
                  <div className="bg-white/80 backdrop-blur-sm p-2 rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col items-center">
                    <QRCodeSVG value={y.id} size={78} />
                  </div>
                </div>

                {/* زرار تحميل الكارنيه كصورة */}
                <button 
                  onClick={() => {
                    import('html2canvas').then((html2canvas) => {
                      const el = document.getElementById(`card-${y.id}`);
                      if(el) {
                        html2canvas.default(el, { scale: 3, useCORS: true }).then(canvas => {
                          const a = document.createElement('a');
                          a.href = canvas.toDataURL('image/png');
                          a.download = `كارنيه_${y.name}.png`;
                          a.click();
                        });
                      }
                    });
                  }}
                  className="absolute top-2 right-2 z-50 bg-gray-800 text-white w-8 h-8 flex items-center justify-center rounded-full shadow-md print-hidden hover:bg-black transition-colors opacity-0 group-hover:opacity-100"
                  title="تحميل الكارنيه كصورة"
                >
                  ⬇️
                </button>

              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
