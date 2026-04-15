"use client";
import { useState } from "react";
import { Lock } from "lucide-react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // We will use a professional way to store the session in cookies
    if (password === "saad101") { // We will convert this to a Server Action later for security
       document.cookie = `admin_session=authenticated; path=/; max-age=3600`;
       window.location.href = "/admin";
    } else {
      setError("Incorrect password ❌");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans" dir="rtl">
      <form onSubmit={handleLogin} className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md text-center">
        <div className="bg-blue-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Lock className="text-blue-600" size={32} />
        </div>
        <h1 className="text-2xl font-black text-slate-800 mb-2">Admin Login</h1>
        <p className="text-slate-400 text-sm mb-8">Please enter the password to access the control panel</p>
        
        <input
          type="password"
          placeholder="Password"
          className="w-full p-4 border-2 border-slate-100 rounded-2xl text-center mb-4 focus:border-blue-500 outline-none transition-all"
          onChange={(e) => setPassword(e.target.value)}
        />
        
        {error && <p className="text-red-500 text-xs mb-4 font-bold">{error}</p>}

        <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all">
          Login
        </button>
      </form>
    </div>
  );
}