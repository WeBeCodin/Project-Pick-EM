'use client';

import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

export default function LoginPage() {
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (isSignedIn) {
      window.location.href = '/dashboard';
    } else {
      window.location.href = '/sign-in';
    }
  }, [isSignedIn]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p>Redirecting to sign in...</p>
      </div>
    </div>
  );
}
