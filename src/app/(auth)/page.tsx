// app/page.tsx  ← This is your root URL "/"
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WelcomeScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/login');
    }, 3000); // 3 seconds

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-indigo-600 to-purple-700 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="mb-8 flex justify-center">
          <div className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center text-7xl shadow-2xl">
            🚀
          </div>
        </div>
        <h1 className="text-6xl font-bold mb-4">Welcome to</h1>
        <h2 className="text-5xl font-semibold">Your CRM</h2>
        <p className="mt-6 text-xl text-white/70">Powerful Lead Management System</p>
      </div>
    </div>
  );
}