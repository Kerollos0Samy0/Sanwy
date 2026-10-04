"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function YouthProfile() {
  const params = useParams();
  const [youth, setYouth] = useState<any>(null);

  useEffect(() => {
    if (params.id) {
      fetch(`/api/youth/${params.id}`).then(res => res.json()).then(setYouth);
    }
  }, [params.id]);

  if (!youth) return <div className="p-8 text-center text-xl" dir="rtl">جاري التحميل...</div>;

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h1 className="text-4xl font-bold text-blue-900">سجل المخدوم: {youth.name}</h1>
          <Link href="/admin" className="text-blue-600 font-bold hover:underline">العودة للوحة الخدام &rarr;</Link>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-8">
          <div className="text-2xl">إجمالي النقاط الحالية: <span className="font-bold text-blue-600">{youth.totalPoints} نقطة</span></div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">تفاصيل النقاط</h2>
          <table className="w-full text-right">
            <thead>
              <tr className="bg-gray-100 text-gray-600">
                <th className="p-4 rounded-tr-lg">السبب/النشاط</th>
                <th className="p-4">النقاط</th>
                <th className="p-4">الخادم</th>
                <th className="p-4 rounded-tl-lg">الوقت والتاريخ</th>
              </tr>
            </thead>
            <tbody>
              {youth.pointsLogs?.map((log: any) => (
                <tr key={log.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-bold">{log.reason}</td>
                  <td className={`p-4 font-bold ${log.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {log.points > 0 ? `+${log.points}` : log.points}
                  </td>
                  <td className="p-4 text-gray-500">{log.servantName}</td>
                  <td className="p-4 text-gray-500 text-sm">{new Date(log.createdAt).toLocaleString('ar-EG')}</td>
                </tr>
              ))}
              {youth.pointsLogs?.length === 0 && <tr><td colSpan={4} className="text-center p-8 text-gray-500">لا توجد سجلات بعد</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
