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

  const handleDeleteLog = async (logId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا السجل نهائياً؟ سيتم تعديل إجمالي النقاط تلقائياً.")) return;
    try {
      const res = await fetch(`/api/points?logId=${logId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchYouth();
      } else {
        alert("فشل في حذف السجل");
      }
    } catch {
      alert("حدث خطأ أثناء الاتصال");
    }
  };

  if (!youth) return (
    <div dir="rtl" className="min-h-screen p-8 text-xl font-bold text-center text-blue-900 flex items-center justify-center">
      جاري تحميل البروفايل... ⏳
    </div>
  );

  return (
    <div dir="rtl" className="min-h-screen bg-slate-100 p-3 sm:p-6 md:p-8 text-gray-900">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin" className="text-blue-700 font-bold hover:underline mb-4 inline-flex items-center gap-1 text-sm sm:text-base">
          <span>&larr;</span> العودة للوحة الخدام
        </Link>
        
        {/* Profile Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden mb-6 sm:mb-8 border border-gray-200">
          <div className={`h-24 sm:h-32 relative ${youth.gender === 'بنت' ? 'bg-gradient-to-r from-pink-600 to-rose-400' : 'bg-gradient-to-r from-blue-900 to-blue-600'}`}></div>
          <div className="px-4 sm:px-8 pb-6 sm:pb-8 relative">
            <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end -mt-12 sm:-mt-16 mb-5 gap-3">
              {youth.imageUrl ? (
                <img 
                  src={youth.imageUrl} 
                  alt="Profile" 
                  className="w-24 h-24 sm:w-36 sm:h-36 rounded-full border-4 border-white shadow-md bg-white object-cover"
                />
              ) : (
                <div className={`w-24 h-24 sm:w-36 sm:h-36 rounded-full border-4 border-white shadow-md flex items-center justify-center ${youth.gender === 'بنت' ? 'bg-pink-50' : 'bg-blue-50'}`}>
                  <span className="text-4xl sm:text-6xl">{youth.gender === 'بنت' ? '👧' : '👦'}</span>
                </div>
              )}
              <button 
                onClick={() => setIsEditing(!isEditing)} 
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-black px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl shadow-xs transition text-xs sm:text-sm active:scale-95"
              >
                {isEditing ? "إلغاء التعديل ❌" : "تعديل البيانات ✏️"}
              </button>
            </div>

            {isEditing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-200">
                <div>
                  <label className="block text-gray-700 font-bold mb-1 text-xs sm:text-sm">الاسم</label>
                  <input className="w-full border border-gray-300 p-2.5 rounded-xl focus:border-blue-500 focus:outline-none font-bold text-gray-900 text-sm bg-white" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1 text-xs sm:text-sm">المرحلة</label>
                  <select className="w-full border border-gray-300 p-2.5 rounded-xl focus:border-blue-500 focus:outline-none font-bold text-gray-900 bg-white text-sm" value={editForm.grade} onChange={e => setEditForm({...editForm, grade: e.target.value})}>
                    <option value="أولى ثانوي">أولى ثانوي</option>
                    <option value="أولي ثانوي">أولي ثانوي</option>
                    <option value="ثانية ثانوي">ثانية ثانوي</option>
                    <option value="تانية ثانوي">تانية ثانوي</option>
                    <option value="ثالثة ثانوي">ثالثة ثانوي</option>
                    <option value="تالتة ثانوي">تالتة ثانوي</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1 text-xs sm:text-sm">النوع</label>
                  <select className="w-full border border-gray-300 p-2.5 rounded-xl focus:border-blue-500 focus:outline-none font-bold text-gray-900 bg-white text-sm" value={editForm.gender} onChange={e => setEditForm({...editForm, gender: e.target.value})}>
                    <option value="ولد">ولد</option>
                    <option value="بنت">بنت</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1 text-xs sm:text-sm">تاريخ الميلاد</label>
                  <input type="date" className="w-full border border-gray-300 p-2.5 rounded-xl focus:border-blue-500 focus:outline-none font-bold text-gray-900 bg-white text-sm" value={editForm.dateOfBirth} onChange={e => setEditForm({...editForm, dateOfBirth: e.target.value})} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-gray-700 font-bold mb-1 text-xs sm:text-sm">رفع صورة شخصية</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    className="w-full border border-gray-300 p-2 rounded-xl focus:border-blue-500 focus:outline-none font-bold text-gray-900 bg-white text-xs sm:text-sm"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const img = new Image();
                        img.onload = () => {
                          const canvas = document.createElement('canvas');
                          const MAX_WIDTH = 400;
                          const MAX_HEIGHT = 400;
                          let width = img.width;
                          let height = img.height;
                          if (width > height) {
                            if (width > MAX_WIDTH) {
                              height *= MAX_WIDTH / width;
                              width = MAX_WIDTH;
                            }
                          } else {
                            if (height > MAX_HEIGHT) {
                              width *= MAX_HEIGHT / height;
                              height = MAX_HEIGHT;
                            }
                          }
                          canvas.width = width;
                          canvas.height = height;
                          const ctx = canvas.getContext('2d');
                          ctx?.drawImage(img, 0, 0, width, height);
                          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                          setEditForm({...editForm, imageUrl: compressedBase64});
                        };
                        img.src = event.target?.result as string;
                      };
                      reader.readAsDataURL(file);
                    }} 
                  />
                </div>
                <div className="sm:col-span-2 text-left mt-2 flex items-center justify-end gap-3">
                  {editForm.imageUrl && editForm.imageUrl.startsWith('data:image') && (
                    <span className="text-green-600 font-bold text-xs">تم تجهيز الصورة بنجاح ✅</span>
                  )}
                  <button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-2.5 rounded-xl shadow-xs transition text-sm">
                    حفظ التغييرات ✅
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-2xl sm:text-4xl font-black text-gray-900 mb-2 sm:mb-3 text-center sm:text-right">{youth.name}</h1>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start text-xs sm:text-base font-bold text-gray-700">
                  <span className="bg-gray-100 px-3 py-1.5 rounded-xl">🎓 {youth.grade}</span>
                  <span className="bg-gray-100 px-3 py-1.5 rounded-xl">🎂 {
                    youth.dateOfBirth 
                      ? (youth.dateOfBirth.includes('/') ? youth.dateOfBirth : new Date(youth.dateOfBirth).toLocaleDateString('ar-EG')) 
                      : 'تاريخ الميلاد غير مسجل'
                  }</span>
                  <span className="bg-blue-100 text-blue-900 px-3 py-1.5 rounded-xl font-black">⭐ {youth.totalPoints} نقطة</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl sm:text-2xl font-black text-blue-900 flex items-center gap-2">
            <span>📍</span> خط السير وسجل النقاط
          </h2>
          <span className="text-xs sm:text-sm font-bold text-gray-500">
            {youth.pointsLogs.length} حركة
          </span>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm p-3.5 sm:p-6 border border-gray-200">
          {youth.pointsLogs.length === 0 ? (
            <p className="text-gray-400 font-bold text-center text-base py-10">لا يوجد أي نشاط مسجل في خط السير حتى الآن.</p>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {youth.pointsLogs.map((log: any) => (
                <div key={log.id} className="flex items-start gap-2.5 sm:gap-4 p-3 sm:p-4 rounded-xl border border-gray-100 bg-gray-50/70 hover:bg-gray-50 transition">
                  {/* Points Badge */}
                  <div className={`w-11 h-11 sm:w-13 sm:h-13 rounded-xl text-white flex items-center justify-center font-black text-sm sm:text-base shrink-0 shadow-xs ${log.points > 0 ? 'bg-blue-600' : 'bg-red-500'}`}>
                    {log.points > 0 ? '+' : ''}{log.points}
                  </div>

                  {/* Log Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-base sm:text-lg font-black text-gray-900 truncate">{log.reason}</h3>
                      <button 
                        onClick={() => handleDeleteLog(log.id)}
                        className="bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 px-2 py-0.5 rounded-lg text-xs font-bold transition shrink-0 active:scale-95"
                        title="حذف هذا السجل نهائياً"
                      >
                        🗑️ حذف
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-1 mt-1 text-xs text-gray-500 font-bold">
                      <span>الخادم: <strong className="text-gray-800">{log.servantName || 'أدمن'}</strong></span>
                      <span dir="ltr" className="bg-gray-200/80 px-2 py-0.5 rounded text-[11px] font-mono">
                        {new Date(log.createdAt).toLocaleString('en-GB')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
