'use client';

import { TfiPalette } from "react-icons/tfi";
import {
  Avatar,
  Box,
  Flex,
  Text,
  DropdownMenu,
} from "@radix-ui/themes";

import { useUser } from "../component/context/user-context";
import { ChevronDown, LogOut } from "lucide-react";
import Image from "next/image";
import LogoutButton from "./logout";
import ProfileDialog from "./ProfileDialog";
import { useTheme } from "next-themes";
import NotificationBell from "./NotificationBell";

export default function Header() {
  const { user } = useUser();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-slate-200 dark:border-zinc-800 transition-colors duration-200">
      <div className="mx-auto flex h-16 items-center justify-between px-6">
        
        {/* Left Side: Brand Logo & Title */}
        <div className="flex items-center gap-3.5 group cursor-pointer">
          <div className="relative h-9 w-9 rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 shadow-sm transition-transform duration-200 group-hover:scale-105">
            <Image
              fill
              src="https://static.wingify.com/gcp/uploads/sites/18/2023/08/CRM.png"
              alt="CRM Logo"
              className="object-cover"
              priority
            />
          </div>

          <Text
            size="4"
            weight="bold"
            className="tracking-tight text-slate-900 dark:text-zinc-50 font-semibold"
          >
            CRM Digital System
          </Text>
        </div>

        {/* Right Side: Quick Actions & Profile Dropdown */}
        <Flex gap="4" align="center">
          {user?.role === 'sales' && (
            <div className="flex items-center justify-center rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors duration-200">
              <NotificationBell />
            </div>
          )}
          
          {/* Dropdown Action Wrapper */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <button className="group flex items-center gap-3 rounded-xl p-1.5 pr-3 text-left outline-none hover:bg-slate-100 dark:hover:bg-zinc-900 transition-all duration-200 border border-transparent hover:border-slate-200 dark:hover:border-zinc-800">
                <Avatar
                  size="2"
                  src=""
                  radius="medium"
                  fallback={user?.name?.charAt(0).toUpperCase() || "U"}
                  className="shadow-sm font-semibold bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300"
                />

                <Box className="hidden sm:block max-w-[120px]">
                  <Text
                    as="div"
                    size="2"
                    weight="bold"
                    className="truncate text-slate-800 dark:text-zinc-200 leading-tight"
                  >
                    {user?.name || "User"}
                  </Text>
                  <Text
                    as="div"
                    size="1"
                    className="capitalize text-slate-500 dark:text-zinc-400 text-[11px] leading-none mt-0.5"
                  >
                    {user?.role || "staff"}
                  </Text>
                </Box>

                <ChevronDown
                  size={14}
                  className="text-slate-400 dark:text-zinc-500 transition-transform duration-200 group-data-[state=open]:rotate-180"
                />
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Content
              variant="soft"
              className="min-w-[200px] mt-1 p-1.5 rounded-xl shadow-xl border border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-950"
            >
              <DropdownMenu.Item asChild className="rounded-lg">
                <ProfileDialog />
              </DropdownMenu.Item>

              <DropdownMenu.Item 
                onClick={toggleTheme}
                className="rounded-lg flex items-center gap-2 px-2.5 py-2 text-sm text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900 cursor-pointer"
              >
                <TfiPalette size={14} className="text-slate-500 dark:text-zinc-400" />
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </DropdownMenu.Item>
            
              <DropdownMenu.Separator className="my-1 border-slate-100 dark:border-zinc-900" />

              <DropdownMenu.Item 
                color="red"
                className="rounded-lg flex items-center gap-2 px-2.5 py-2 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
              >
                <LogOut size={14} />
                <LogoutButton />
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Flex>

      </div>
    </header>
  );
}