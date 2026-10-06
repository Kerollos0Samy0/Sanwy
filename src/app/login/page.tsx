"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    if (!password) return;
    
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password })
    });
    
    if (res.ok) {
      router.push('/dashboard');
    } else {
      setError('الرقم السري غير صحيح!');
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl max-w-sm w-full text-center border-t-8 border-blue-600">
        <img src="/logo.png" alt="Logo" className="w-32 h-32 mx-auto mb-6 drop-shadow-md rounded-full border-4 border-gray-50" />
        <h1 className="text-3xl font-black text-gray-900 mb-2">تسجيل الدخول</h1>
        <p className="text-gray-500 font-bold mb-8">خاص بخدام اجتماع شباب ثانوي</p>
        
        {error && (
          <div className="bg-red-50 text-red-600 font-bold p-3 rounded-xl mb-4 border border-red-200">
            {error}
          </div>
        )}

        <input 
          type="password" 
          placeholder="أدخل الرقم السري..." 
          className="w-full border-2 border-gray-300 p-4 rounded-xl text-center text-xl font-black mb-6 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900"
          value={password}
          onChange={e => { setPassword(e.target.value); setError(""); }}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
        />
        <button 
          onClick={handleLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl text-xl shadow-lg transition active:scale-95"
        >
          دخول للنظام 🚀
        </button>
      </div>
    </div>
  );
}
