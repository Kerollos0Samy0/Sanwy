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
    // Use en-GB to enforce English numbers and DD/MM/YYYY format
    return d.toLocaleString('en-GB', { 
      day: '2-digit', month: '2-digit', year: 'numeric', 
      hour: '2-digit', minute: '2-digit', hour12: true 
    });
  }

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h1 className="text-3xl md:text-4xl font-black text-blue-900">📜 السجل العام للنقاط</h1>
          <Link href="/admin" className="bg-gray-800 hover:bg-black text-white px-8 py-3 rounded-xl font-bold transition shadow-md text-lg">
            العودة للوحة الخدام &rarr;
          </Link>
        </div>
        
        {loading ? (
          <p className="text-center text-2xl font-bold text-gray-500 mt-10">جاري تحميل السجل... ⏳</p>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full text-right min-w-[800px]">
                <thead className="bg-blue-900 text-white">
                  <tr>
                    <th className="p-5 font-bold text-xl whitespace-nowrap">الاسم</th>
                    <th className="p-5 font-bold text-xl whitespace-nowrap">السبب/النشاط</th>
                    <th className="p-5 font-bold text-xl whitespace-nowrap text-center">النقاط</th>
                    <th className="p-5 font-bold text-xl whitespace-nowrap text-center">الخادم</th>
                    <th className="p-5 font-bold text-xl whitespace-nowrap text-left">الوقت والتاريخ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-blue-50 transition duration-150">
                      <td className="p-5">
                        <Link href={`/admin/youth/${log.youth?.id}`} className="font-bold text-blue-700 hover:text-blue-900 hover:underline text-lg">
                          {log.youth?.name || 'مخدوم محذوف'}
                        </Link>
                      </td>
                      <td className="p-5 font-bold text-gray-900 text-lg">{log.reason}</td>
                      <td className="p-5 text-center">
                        <span className={`inline-block px-5 py-2 rounded-xl font-black text-lg shadow-sm border ${log.points > 0 ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                          {log.points > 0 ? '+' : ''}{log.points}
                        </span>
                      </td>
                      <td className="p-5 text-center font-bold text-gray-600 text-lg">{log.servantName}</td>
                      <td className="p-5 font-mono font-bold text-gray-500 text-left text-lg" dir="ltr">
                        {formatDate(log.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {logs.length === 0 && (
                <div className="text-center p-12 text-gray-500 font-bold text-2xl">لا يوجد أي سجلات حتى الآن.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
