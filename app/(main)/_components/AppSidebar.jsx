import React from 'react'
import Image from 'next/image'

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
import { HomeIcon, LucideFileVideo, Menu, Search, WalletCards } from 'lucide-react'
import Link from 'next/link'

const MenuItems=[
  {
    title:"Home",
    url:'/dashboard',
    icon: HomeIcon
  },
  {
    title:"Create New Video",
    url:'/#',
    icon: LucideFileVideo
  },
  {
    title:"Exflore",
    url:'/#',
    icon: Search
  }, 
  {
    title:"Billing",
    url:'/#',
    icon: WalletCards
  },
]

function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div>
          <div className='flex items-center gap-3 w-full justify-center mt-5'>
            <Image src={'/logo.svg'} alt='logo' width={40} height={40}/>
            <h2 className='font-bold text-2xl'>Video Gen</h2>
          </div>

          <h2 className='text-lg text-gray-400 text-center mt-3'>AI Short Video Generator</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <div className='mx-5 mt-10'>
              <Link href={'/create_new_video'}>
              <Button className="w-full">+ Create New Video</Button>
              </Link>
            </div>
            <SidebarMenu>
              {MenuItems.map((menu,index)=>(
                <SidebarMenuItem className="mt-3" key={index}>
                  <SidebarMenuButton className="p-5">
                    <Link href={menu.url} className='flex items-center gap-4 p-3'>
                      <menu.icon/>
                      <span>{menu?.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}

export default AppSidebar