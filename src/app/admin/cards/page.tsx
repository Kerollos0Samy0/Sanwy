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
    <div dir="rtl" className="p-8 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-8 print:hidden">
        <h1 className="text-3xl font-bold text-blue-900">طباعة الكارنيهات</h1>
        <div className="flex gap-4">
          <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded shadow">طباعة الكارنيهات 🖨️</button>
          <Link href="/admin" className="bg-gray-800 text-white font-bold px-6 py-2 rounded hover:bg-black shadow">العودة للوحة الخدام &rarr;</Link>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {youths.map(y => (
          <div key={y.id} className="bg-white border-4 border-blue-900 rounded-2xl p-6 flex flex-col items-center text-center shadow-lg break-inside-avoid relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-blue-50 z-0"></div>
            <img src="/logo.jpg" alt="Logo" className="h-24 w-24 object-contain mb-4 z-10 rounded-full border-2 border-gray-100 shadow-sm" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4 z-10">{y.name}</h2>
            <div className="bg-white p-3 border-4 border-blue-100 rounded-xl z-10">
              <QRCodeSVG value={y.id} size={150} />
            </div>
            <p className="mt-4 text-gray-500 font-bold z-10 text-xl">{y.grade}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
