"use client";
import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";

export default function Cards() {
  const [youths, setYouths] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/youth').then(res => res.json()).then(setYouths);
  }, []);

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

      <div className="flex justify-between items-center mb-8 print-hidden">
        <h1 className="text-3xl font-bold text-blue-900">طباعة الكارنيهات (9x6 سم)</h1>
        <div className="flex gap-4">
          <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded shadow">طباعة 🖨️</button>
          <Link href="/admin" className="bg-gray-800 text-white font-bold px-6 py-2 rounded hover:bg-black shadow">العودة &rarr;</Link>
        </div>
      </div>

      {/* تصميم ظهر الكارنيه الثابت */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-gray-500 mb-4 print-hidden">تصميم ظهر الكارنيه (ثابت)</h2>
        <div className="w-[9cm] h-[6cm] bg-blue-900 text-white rounded-xl overflow-hidden shadow-md flex flex-col items-center justify-center border border-gray-400 relative">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
          <img src="/logo.png" alt="Logo" className="w-[2.5cm] h-[2.5cm] object-contain mb-3 bg-white rounded-full p-1 shadow-lg z-10" />
          <h2 className="text-xl font-black tracking-widest z-10">كنيسة القديسة رفقة</h2>
          <h3 className="text-sm font-bold text-blue-200 mt-1 z-10">اجتماع شباب ثانوي</h3>
        </div>
      </div>

      <hr className="my-8 border-2 border-dashed border-gray-300 print-hidden" />

      {/* تصميم وش الكارنيه المتغير */}
      <div>
        <h2 className="text-xl font-bold text-gray-500 mb-4 print-hidden">تصميم وش الكارنيه (متغير)</h2>
        <div className="flex flex-wrap gap-4 justify-start">
          {youths.map(y => (
            <div key={y.id} className="w-[9cm] h-[6cm] bg-white border border-gray-400 rounded-xl overflow-hidden shadow-sm flex flex-row relative break-inside-avoid">
              
              {/* Left Section: QR Code */}
              <div className="w-[3.5cm] h-full bg-blue-50 flex flex-col items-center justify-center border-l-2 border-blue-100">
                <div className="bg-white p-1 rounded-lg shadow-sm">
                  <QRCodeSVG value={y.id} size={85} />
                </div>
              </div>

              {/* Right Section: Details */}
              <div className="flex-1 h-full flex flex-col relative">
                {/* Header */}
                <div className="bg-blue-900 text-white text-center py-1.5 text-xs font-bold w-full shadow-sm z-10">
                  اجتماع شباب ثانوي
                </div>
                
                {/* Body */}
                <div className="flex-1 flex flex-col items-center justify-center p-2 relative">
                  {/* Watermark Logo */}
                  <img src="/logo.png" className="absolute w-[3cm] h-[3cm] opacity-5 object-contain z-0" />
                  
                  {/* Profile Photo */}
                  <div className={`w-[2.2cm] h-[2.2cm] rounded-full overflow-hidden border-2 mb-2 ${y.gender === 'بنت' ? 'border-pink-500' : 'border-blue-500'} shadow-sm flex items-center justify-center bg-white z-10`}>
                    {y.imageUrl ? (
                      <img src={y.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <img src="/logo.png" className="w-full h-full object-contain p-2 opacity-50" />
                    )}
                  </div>
                  
                  {/* Name & Grade */}
                  <h2 className="text-[14px] font-black text-gray-900 text-center leading-tight mb-1 z-10 px-1">{y.name}</h2>
                  <p className="text-[11px] font-bold text-blue-800 bg-blue-100 px-3 py-0.5 rounded-full z-10 border border-blue-200">{y.grade}</p>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
