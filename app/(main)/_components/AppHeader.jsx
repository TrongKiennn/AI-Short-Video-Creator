'use client';
import { useAuthContext } from '@/app/provider';
import { SidebarTrigger } from '@/components/ui/sidebar';
import React from 'react';
import Image from 'next/image';

function AppHeader() {
  const { user } = useAuthContext();
  return (
    <div className="p-3 space-y-3">
      <div className="flex justify-between items-center">
        <SidebarTrigger />
        <Image
          src={user?.photoURL || '/avatarDefault.svg'}
          alt="user"
          width={40}
          height={40}
          className="rounded-full"
        />
      </div>
    </div>
  );
}

export default AppHeader;
