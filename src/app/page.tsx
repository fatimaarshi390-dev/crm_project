'use client';
import { useEffect, useState } from 'react';

export default function Home() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/test-db')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStatus('success');
          setMessage(data.message);
        } else {
          setStatus('error');
          setMessage(data.message || 'Connection failed');
        }
      })
      .catch(err => {
        setStatus('error');
        setMessage('Failed to connect to server');
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full text-center">
        <div className="text-6xl mb-6">
          {status === 'loading' && '🔄'}
          {status === 'success' && '✅'}
          {status === 'error' && '❌'}
        </div>

        <h1 className="text-3xl font-bold mb-4">
          MongoDB Connection Test
        </h1>

        <div className={`p-4 rounded-xl text-lg font-medium ${
          status === 'success' ? 'bg-green-100 text-green-700' : 
          status === 'error' ? 'bg-red-100 text-red-700' : 
          'bg-gray-100 text-gray-600'
        }`}>
          {message || 'Checking connection...'}
        </div>

        {status === 'success' && (
          <p className="text-green-600 mt-6 text-sm">
            Your MongoDB is connected successfully!
          </p>
        )}
      </div>
    </div>
  );
}