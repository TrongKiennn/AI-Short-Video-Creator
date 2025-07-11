"use client";

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from '@/components/ui/button'
import { HomeIcon, LucideAreaChart, LucideAudioLines, LucideFileVideo, Search } from 'lucide-react'
import YouTubeSignInButton from '@/app/_components/YouTubeSignInButton';
import YouTubeStatusIndicator from '@/app/_components/YouTubeStatusIndicator';
import { useAuthContext } from '@/app/provider';
import LogoutButton from '@/app/_components/LogoutButton';

const MenuItems = [
  {
    title: "Home",
    url: '/dashboard',
    icon: HomeIcon
  },
  {
    title: "Create New Video",
    url: '/create_new_video',
    icon: LucideFileVideo
  },
  {
    title: "Text to Speech",
    url: '/texttospeech',
    icon: LucideAudioLines
  },
  {
    title: "Explore",
    url: '#',
    icon: Search
  },
  {
    title: 'Video Performance Statistics',
    url: '/video-stats',
    icon: LucideAreaChart,
  },
];

function AppSidebar() {
  const pathname = usePathname();
  const { youtubeConnected } = useAuthContext();

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href={'/dashboard'}>
          <div>
            <div className='flex items-center gap-3 w-full justify-center mt-5'>
              <Image src={'/logo.svg'} alt='logo' width={40} height={40} />
              <h2 className='font-bold text-2xl bg-gradient-to-r from-purple-500 to-pink-400 bg-clip-text text-transparent drop-shadow'>Video Gen</h2>
            </div>
            <h2 className='text-lg text-gray-500 text-center mt-3 font-medium'>AI Short Video Generator</h2>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="mx-5 mt-10">
              <Link href={'/create_new_video'}>
                <Button 
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold shadow-lg hover:from-purple-500 hover:to-pink-500 transition-all"
                >
                  + Create New Video
                </Button>
              </Link>
            </div>
            <SidebarMenu>
              {MenuItems.map((menu, index) => {
                const isActive = pathname === menu.url;
                return (
                  <SidebarMenuItem className="mt-3" key={index}>
                    <SidebarMenuButton
                      isActive={isActive}
                      asChild
                      className={`
                        flex w-full items-center rounded-xl px-3 py-2 transition-all
                        ${isActive
                          ? "bg-gradient-to-r from-purple-400 to-pink-400 text-white shadow-md"
                          : "hover:bg-purple-50 hover:text-purple-700 text-gray-700"
                        }
                      `}
                    >
                      <Link href={menu.url} className='flex w-full items-center gap-3'>
                        <menu.icon className={`shrink-0 ${isActive ? "text-white" : "text-purple-400"}`} />
                        <span className="truncate font-medium">{menu.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="text-xs text-gray-400 text-center py-2">
          © {new Date().getFullYear()} Video Gen
        </div>
        <style jsx global>{`
          [data-slot="sidebar-wrapper"] {
            background: linear-gradient(135deg, #f8fafc 0%, #f3e8ff 100%);
            box-shadow: 2px 0 24px 0 rgba(120, 72, 232, 0.08);
            border-right: 1px solid #e9d5ff;
          }
        `}</style>
        <div className="p-3 space-y-2">
          <YouTubeStatusIndicator />
          <YouTubeSignInButton />
          <LogoutButton />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
