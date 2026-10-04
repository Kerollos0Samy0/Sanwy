"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Logs() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/logs').then(res => res.json()).then(setLogs);
  }, []);

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h1 className="text-4xl font-bold text-blue-900">السجل العام للنقاط</h1>
          <Link href="/admin" className="text-blue-600 font-bold hover:underline">العودة للوحة الخدام &rarr;</Link>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-gray-100 text-gray-600">
                <th className="p-4 rounded-tr-lg">الاسم</th>
                <th className="p-4">السبب/النشاط</th>
                <th className="p-4">النقاط</th>
                <th className="p-4">الخادم</th>
                <th className="p-4 rounded-tl-lg">الوقت والتاريخ</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-bold text-blue-800">
                    <Link href={`/admin/youth/${log.youth?.id}`}>{log.youth?.name}</Link>
                  </td>
                  <td className="p-4">{log.reason}</td>
                  <td className={`p-4 font-bold ${log.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {log.points > 0 ? `+${log.points}` : log.points}
                  </td>
                  <td className="p-4 text-gray-500">{log.servantName}</td>
                  <td className="p-4 text-gray-500 text-sm">{new Date(log.createdAt).toLocaleString('ar-EG')}</td>
                </tr>
              ))}
              {logs.length === 0 && <tr><td colSpan={5} className="text-center p-8 text-gray-500">لا توجد سجلات بعد</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
