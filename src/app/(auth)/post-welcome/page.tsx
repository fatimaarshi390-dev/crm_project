// app/post-welcome/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../../component/context/user-context';
import { CheckCircle2 } from 'lucide-react';

export default function PostLoginWelcome() {
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const timer = setTimeout(() => {
      if (user.role === 'admin') router.push('/dashboard/admin');
      else if (user.role === 'sales'|| user.role==='Sales') router.push('/dashboard/sales');
      else if (user.role === 'marketing' || user.role === 'Marketing') {
        router.push('/dashboard/marketing');
      } else {
        router.push('/dashboard');
      }
    }, 2800);

    return () => clearTimeout(timer);
  }, [user, router]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 45%, #ddd6fe 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Circle 1 */}
      <div
        style={{
          position: 'absolute',
          width: '320px',
          height: '320px',
          background: 'rgba(255,255,255,0.4)',
          borderRadius: '50%',
          top: '-100px',
          left: '-100px',
          filter: 'blur(30px)',
        }}
      />

      {/* Background Circle 2 */}
      <div
        style={{
          position: 'absolute',
          width: '280px',
          height: '280px',
          background: 'rgba(255,255,255,0.35)',
          borderRadius: '50%',
          bottom: '-80px',
          right: '-80px',
          filter: 'blur(30px)',
        }}
      />

      {/* Welcome Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '500px',
          background: 'rgba(255,255,255,0.55)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          border: '1px solid rgba(148,163,184,0.18)',
          borderRadius: '32px',
          padding: '45px 30px',
          textAlign: 'center',
          boxShadow: '0 20px 50px rgba(0,0,0,0.08)',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: '95px',
            height: '95px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 28px',
            border: '2px solid rgba(255,255,255,0.7)',
            boxShadow: '0 10px 25px rgba(37,99,235,0.08)',
          }}
        >
          <CheckCircle2 size={50} color="#2563eb" />
        </div>

        {/* Welcome Text */}
        <h1
          style={{
            color: '#1e293b',
            fontSize: 'clamp(30px, 5vw, 42px)',
            fontWeight: '700',
            marginBottom: '12px',
            lineHeight: '1.2',
          }}
        >
          Welcome Back
        </h1>

        <h2
          style={{
            color: '#334155',
            fontSize: 'clamp(22px, 4vw, 30px)',
            fontWeight: '600',
            marginBottom: '18px',
            wordBreak: 'break-word',
          }}
        >
          {user?.name}
        </h2>

        <p
          style={{
            color: '#475569',
            fontSize: '16px',
            lineHeight: '1.7',
            marginBottom: '32px',
          }}
        >
          Login successful. Redirecting you to your dashboard...
        </p>

        {/* Progress Bar */}
        <div
          style={{
            width: '100%',
            height: '10px',
            background: 'rgba(148,163,184,0.2)',
            borderRadius: '999px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: '70%',
              height: '100%',
              background:
                'linear-gradient(to right, #2563eb, #4f46e5)',
              borderRadius: '999px',
              animation: 'loading 2.5s ease-in-out forwards',
            }}
          />
        </div>

        {/* Role Badge */}
        <div
          style={{
            marginTop: '26px',
            display: 'inline-block',
            padding: '9px 18px',
            borderRadius: '999px',
            background: 'rgba(255,255,255,0.75)',
            color: '#1e293b',
            fontSize: '14px',
            fontWeight: '600',
            textTransform: 'capitalize',
            border: '1px solid rgba(148,163,184,0.2)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
          }}
        >
          {user?.role}
        </div>
      </div>

      {/* Animation */}
      <style jsx>{`
        @keyframes loading {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}