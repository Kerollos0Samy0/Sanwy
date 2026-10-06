"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function YouthProfile() {
  const params = useParams();
  const [youth, setYouth] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", grade: "", gender: "ولد", dateOfBirth: "", imageUrl: "" });

  const fetchYouth = () => {
    fetch(`/api/youth/${params.id}`).then(res => res.json()).then(data => {
      setYouth(data);
      setEditForm({
        name: data.name || "",
        grade: data.grade || "",
        gender: data.gender || "ولد",
        dateOfBirth: data.dateOfBirth || "",
        imageUrl: data.imageUrl || ""
      });
    });
  };

  useEffect(() => {
    if (params?.id) fetchYouth();
  }, [params?.id]);

  const handleSave = async () => {
    await fetch(`/api/youth/${params.id}`, {
      method: 'PUT',
      body: JSON.stringify(editForm)
    });
    setIsEditing(false);
    fetchYouth();
  };

  if (!youth) return <div dir="rtl" className="min-h-screen p-8 text-2xl font-bold text-center text-blue-900">جاري تحميل البروفايل... ⏳</div>;

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin" className="text-blue-600 font-bold hover:underline mb-6 inline-block text-lg">&larr; العودة للوحة الخدام</Link>
        
        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-10 border border-gray-100">
          <div className={`h-32 relative ${youth.gender === 'بنت' ? 'bg-gradient-to-r from-pink-600 to-pink-400' : 'bg-gradient-to-r from-blue-900 to-blue-600'}`}></div>
          <div className="px-6 md:px-10 pb-8 relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end -mt-16 mb-6 gap-4">
              {youth.imageUrl ? (
                <img 
                  src={youth.imageUrl} 
                  alt="Profile" 
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-xl bg-white object-cover"
                />
              ) : (
                <div className={`w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-xl flex items-center justify-center ${youth.gender === 'بنت' ? 'bg-pink-50' : 'bg-blue-50'}`}>
                  <svg className={`w-16 h-16 md:w-20 md:h-20 ${youth.gender === 'بنت' ? 'text-pink-300' : 'text-blue-300'}`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              )}
              <button onClick={() => setIsEditing(!isEditing)} className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-6 py-3 rounded-xl shadow-sm transition">
                {isEditing ? "إلغاء التعديل ❌" : "تعديل البيانات ✏️"}
              </button>
            </div>

            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-200">
                <div>
                  <label className="block text-gray-700 font-bold mb-2">الاسم</label>
                  <input className="w-full border-2 border-gray-300 p-3 rounded-xl focus:border-blue-500 focus:outline-none font-bold" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-2">المرحلة</label>
                  <select className="w-full border-2 border-gray-300 p-3 rounded-xl focus:border-blue-500 focus:outline-none font-bold" value={editForm.grade} onChange={e => setEditForm({...editForm, grade: e.target.value})}>
                    <option value="أولى ثانوي">أولى ثانوي</option>
                    <option value="تانية ثانوي">تانية ثانوي</option>
                    <option value="تالتة ثانوي">تالتة ثانوي</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-2">النوع</label>
                  <select className="w-full border-2 border-gray-300 p-3 rounded-xl focus:border-blue-500 focus:outline-none font-bold" value={editForm.gender} onChange={e => setEditForm({...editForm, gender: e.target.value})}>
                    <option value="ولد">ولد</option>
                    <option value="بنت">بنت</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-2">تاريخ الميلاد</label>
                  <input type="date" className="w-full border-2 border-gray-300 p-3 rounded-xl focus:border-blue-500 focus:outline-none font-bold text-gray-700" value={editForm.dateOfBirth} onChange={e => setEditForm({...editForm, dateOfBirth: e.target.value})} />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-2">رابط الصورة (URL)</label>
                  <input placeholder="https://..." className="w-full border-2 border-gray-300 p-3 rounded-xl focus:border-blue-500 focus:outline-none text-left font-mono" dir="ltr" value={editForm.imageUrl} onChange={e => setEditForm({...editForm, imageUrl: e.target.value})} />
                  <p className="text-xs text-gray-500 mt-1">حط رابط الصورة أونلاين عشان تتعرض</p>
                </div>
                <div className="md:col-span-2 text-left mt-2">
                  <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white font-bold px-10 py-3 rounded-xl shadow-md transition text-lg">حفظ التغييرات ✅</button>
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">{youth.name}</h1>
                <div className="flex flex-wrap gap-4 text-gray-700 font-bold text-lg mb-4">
                  <span className="bg-gray-100 px-4 py-2 rounded-xl flex items-center gap-2">🎓 {youth.grade}</span>
                  <span className="bg-gray-100 px-4 py-2 rounded-xl flex items-center gap-2">🎂 {
                    youth.dateOfBirth 
                      ? (youth.dateOfBirth.includes('/') ? youth.dateOfBirth : new Date(youth.dateOfBirth).toLocaleDateString('ar-EG')) 
                      : 'تاريخ الميلاد غير مسجل'
                  }</span>
                  <span className="bg-blue-100 text-blue-900 px-4 py-2 rounded-xl flex items-center gap-2">⭐ {youth.totalPoints} نقطة</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Timeline */}
        <h2 className="text-3xl font-black text-blue-900 mb-8 flex items-center gap-3">📍 خط السير والسجل </h2>
        <div className="bg-white rounded-3xl shadow-lg p-6 md:p-10 border border-gray-100 relative">
          {/* Vertical Line */}
          <div className="absolute right-[43px] md:right-[58px] top-12 bottom-12 w-1 bg-blue-100"></div>
          
          {youth.pointsLogs.length === 0 ? (
            <p className="text-gray-500 font-bold text-center text-xl py-10 relative z-10">لا يوجد أي نشاط مسجل في خط السير حتى الآن.</p>
          ) : (
            <ul className="space-y-8 relative z-10">
              {youth.pointsLogs.map((log: any, idx: number) => (
                <li key={log.id} className="flex items-center gap-6">
                  <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full text-white flex items-center justify-center font-black text-xl md:text-2xl shadow-lg border-4 border-white shrink-0 z-10 ${log.points > 0 ? 'bg-blue-500' : 'bg-red-500'}`}>
                    {log.points > 0 ? '+' : ''}{log.points}
                  </div>
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 flex-1 shadow-sm hover:shadow-md transition">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
                      <h3 className="text-2xl font-bold text-gray-800">{log.reason}</h3>
                      <span className="text-sm md:text-base font-bold text-gray-500 bg-gray-200 px-3 py-1 rounded-lg shrink-0" dir="ltr">
                        {new Date(log.createdAt).toLocaleString('en-GB')}
                      </span>
                    </div>
                    <p className="text-gray-600 text-base">تم التسجيل بواسطة الخادم: <strong className="text-gray-900">{log.servantName}</strong></p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
      </div>
    </div>
  );
}
