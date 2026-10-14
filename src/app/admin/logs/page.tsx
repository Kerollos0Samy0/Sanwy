"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Logs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/points')
      .then(res => res.json())
      .then(data => {
        setLogs(data);
        setLoading(false);
      });
  }, []);

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleString('en-GB', { 
      day: '2-digit', month: '2-digit', year: 'numeric', 
      hour: '2-digit', minute: '2-digit', hour12: true 
    });
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-100 p-3 sm:p-6 md:p-8 text-gray-900">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-3 bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-xl sm:text-3xl font-black text-blue-900 flex items-center gap-2">
              <span>📜</span> السجل العام للنقاط
            </h1>
            <p className="text-xs sm:text-sm font-bold text-gray-500 mt-0.5">
              عرض جميع حركات النقاط المسجلة بالتواريخ والخدام
            </p>
          </div>
          <Link href="/admin" className="bg-gray-800 hover:bg-black text-white px-4 py-2 rounded-xl font-bold transition shadow-sm text-xs sm:text-sm whitespace-nowrap self-end sm:self-auto">
            لوحة الخدام &rarr;
          </Link>
        </div>
        
        {loading ? (
          <p className="text-center text-xl font-bold text-gray-500 mt-12">جاري تحميل السجل... ⏳</p>
        ) : (
          <div>
            {/* Mobile View: Cards (hidden on md and up) */}
            <div className="block md:hidden space-y-2.5">
              {logs.map(log => (
                <div key={log.id} className="bg-white p-3.5 rounded-2xl shadow-xs border border-gray-200 flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-xs text-white ${log.points > 0 ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                    {log.points > 0 ? '+' : ''}{log.points}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-start gap-2">
                      <Link href={`/admin/youth/${log.youth?.id}`} className="font-black text-blue-800 text-base truncate">
                        {log.youth?.name || 'مخدوم محذوف'}
                      </Link>
                      <span className="text-xs font-black text-gray-700 bg-gray-100 px-2 py-0.5 rounded shrink-0">
                        {log.reason}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2 text-xs text-gray-500 font-bold">
                      <span>الخادم: <strong className="text-gray-800">{log.servantName || 'أدمن'}</strong></span>
                      <span dir="ltr" className="font-mono text-[11px] bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200">
                        {formatDate(log.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {logs.length === 0 && (
                <div className="text-center p-8 text-gray-400 font-bold text-base bg-white rounded-2xl border border-gray-200">
                  لا توجد أي سجلات حتى الآن.
                </div>
              )}
            </div>

            {/* Desktop View: Table (hidden on mobile, visible on md+) */}
            <div className="hidden md:block bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead className="bg-blue-900 text-white">
                    <tr>
                      <th className="p-4 font-bold text-base whitespace-nowrap">الاسم</th>
                      <th className="p-4 font-bold text-base whitespace-nowrap">السبب/النشاط</th>
                      <th className="p-4 font-bold text-base whitespace-nowrap text-center">النقاط</th>
                      <th className="p-4 font-bold text-base whitespace-nowrap text-center">الخادم</th>
                      <th className="p-4 font-bold text-base whitespace-nowrap text-left">الوقت والتاريخ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {logs.map(log => (
                      <tr key={log.id} className="hover:bg-blue-50/50 transition duration-150">
                        <td className="p-4">
                          <Link href={`/admin/youth/${log.youth?.id}`} className="font-bold text-blue-700 hover:text-blue-900 hover:underline text-base">
                            {log.youth?.name || 'مخدوم محذوف'}
                          </Link>
                        </td>
                        <td className="p-4 font-bold text-gray-900 text-base">{log.reason}</td>
                        <td className="p-4 text-center">
                          <span className={`inline-block px-3 py-1 rounded-xl font-black text-sm shadow-xs border ${log.points > 0 ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                            {log.points > 0 ? '+' : ''}{log.points}
                          </span>
                        </td>
                        <td className="p-4 text-center font-bold text-gray-600 text-base">{log.servantName || 'أدمن'}</td>
                        <td className="p-4 font-mono font-bold text-gray-500 text-left text-sm" dir="ltr">
                          {formatDate(log.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {logs.length === 0 && (
                  <div className="text-center p-12 text-gray-400 font-bold text-xl">لا توجد أي سجلات حتى الآن.</div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
