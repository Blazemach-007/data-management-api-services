'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Correct import for App Router

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Automatically route to the login folder
    router.push('/login');
  }, [router]);

  // Show a loading state while redirecting
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-gray-500">Redirecting to Login Page...</p>
    </div>
  );
}