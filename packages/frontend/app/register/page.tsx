'use client';

import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

export default function RegisterPage() {
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (isSignedIn) {
      window.location.href = '/dashboard';
    } else {
      window.location.href = '/sign-up';
    }
  }, [isSignedIn]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p>Redirecting to sign up...</p>
      </div>
    </div>
  );
}