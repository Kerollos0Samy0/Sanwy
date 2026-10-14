"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!password) return;
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      
      if (res.ok) {
        router.push('/dashboard');
      } else {
        setError('الرقم السري غير صحيح!');
      }
    } catch {
      setError('حدث خطأ في الاتصال!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-100 flex items-center justify-center p-3 sm:p-6 text-gray-900">
      <div className="bg-white p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl shadow-lg max-w-sm w-full text-center border-t-6 sm:border-t-8 border-blue-600 border border-gray-200">
        <img src="/logo.png" alt="Logo" className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 sm:mb-6 rounded-full border-2 border-gray-100 shadow-sm object-cover" />
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-1">تسجيل الدخول</h1>
        <p className="text-gray-500 font-bold text-xs sm:text-sm mb-6">خدام اجتماع شباب ثانوي</p>
        
        {error && (
          <div className="bg-red-50 text-red-600 font-bold p-3 rounded-xl mb-4 border border-red-200 text-xs sm:text-sm">
            {error}
          </div>
        )}

        <input 
          type="password" 
          placeholder="أدخل الرقم السري..." 
          className="w-full border-2 border-gray-200 p-3.5 rounded-xl text-center text-lg sm:text-xl font-black mb-4 sm:mb-5 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 bg-white"
          value={password}
          onChange={e => { setPassword(e.target.value); setError(""); }}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
        />
        <button 
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 sm:py-4 rounded-xl text-base sm:text-lg shadow-md transition active:scale-95 disabled:opacity-50"
        >
          {loading ? "جاري الدخول..." : "دخول للنظام 🚀"}
        </button>
      </div>
    </div>
  );
}
