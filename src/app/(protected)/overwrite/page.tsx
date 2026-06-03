'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/component/context/user-context';
import AdmissionForm from '@/app/component/AdmissionForm';

export default function OverwritePage() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user?.role !== 'admin') {
      router.push('/dashboard/admin');   // or wherever you want to redirect
    }
  }, [user, loading, router]);

  if (loading) return <p className="text-center py-20">Loading...</p>;
  if (user?.role !== 'admin') return <p className="text-center py-20 text-red-500">Access Denied</p>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-4xl font-bold mb-8">Admin Admission Fee Override</h1>
        <AdmissionForm />
      </div>
    </div>
  );
}