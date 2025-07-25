'use client';
import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/configs/firebaseConfig';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      console.log('Logging out user and clearing YouTube connection');
      await signOut(auth);
      // Clear any session storage
      sessionStorage.removeItem('pendingYouTubeAuth');
      // Clear any local storage that might affect state
      localStorage.removeItem('youtubeConnected');
      // Redirect to home page
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-4 p-3 w-full text-left hover:bg-purple-100 rounded transition-colors cursor-pointer"
    >
      <LogOut className="w-5 h-5" />
      <span className='text-black'>Log Out</span>
    </button>
  );
}

export default LogoutButton;
