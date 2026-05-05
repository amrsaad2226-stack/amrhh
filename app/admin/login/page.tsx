'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { login } from '@/app/actions/auth'; // Import the server action

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = await login(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      // On successful login, the server action sets the cookie.
      // We just need to redirect the user.
      // Using router.replace to avoid adding the login page to the history stack.
      router.replace('/admin');
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans" dir="rtl">
      <form action={handleLogin} className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md text-center">
        <div className="bg-blue-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Lock className="text-blue-600" size={32} />
        </div>
        <h1 className="text-2xl font-black text-slate-800 mb-2">Admin Login</h1>
        <p className="text-slate-400 text-sm mb-8">Please enter the password to access the control panel</p>
        
        <input
          type="password"
          name="password" // The 'name' attribute is crucial for FormData
          placeholder="Password"
          required
          className="w-full p-4 border-2 border-slate-100 rounded-2xl text-center mb-4 focus:border-blue-500 outline-none transition-all"
        />
        
        {error && <p className="text-red-500 text-xs mb-4 font-bold">{error}</p>}

        <button 
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Verifying...' : 'Login'}
        </button>
      </form>
    </div>
  );
}