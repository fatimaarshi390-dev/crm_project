'use client';
import { TfiPalette } from "react-icons/tfi";
import {
  Avatar,
  Box,
  Card,
  Flex,
  Text,
  DropdownMenu,
} from "@radix-ui/themes";

import { useUser } from "../component/context/user-context";

import {
  ChevronDown,
  User,
  
  LogOut,
} from "lucide-react";
import Image from "next/image";
import LogoutButton from "./logout";
import AddMember from "./addmember";
import ResetPasswordDialog from "./resetpassworddialog";
import ProfileDialog from "./ProfileDialog";
import { useTheme } from "next-themes";
import NotificationBell from "./NotificationBell";

export default function Header() {
  const { user } = useUser();
  const { theme , setTheme} = useTheme();
const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };
  return (
    <header className="sticky top-0 z-50 bg-white flex justify-between items-center px-6 py-3 border-b shadow-md">
      
      {/* Left Side */}
      <div className="flex items-center gap-3">
        <div className="relative h-10 w-10 rounded-full overflow-hidden border border-gray-200">
          <Image
            fill
            src="https://static.wingify.com/gcp/uploads/sites/18/2023/08/CRM.png"
            alt="Hotel Logo"
            className="object-cover"
          />
        </div>

        <Text
          size="5"
          weight="bold"
          className="tracking-tight text-gray-800"
        >
          CRM Digital System
        </Text> 
      </div>

     

      {/* Right Side */}
      <Flex gap="4" align="center">
         {/* Add Member Button - Only Visible to Admin */}
      {user?.role === 'sales' && (
        <NotificationBell/>
      )}
       
        <Card
          className="cursor-pointer transition-all duration-200 hover:shadow-lg"
          variant="surface"
        >
          <Flex gap="3" align="center" px="3" py="2">
            
            <Avatar
              size="3"
              src=""
              radius="full"
              fallback={user?.name?.charAt(0) || "U"}
            />

            {/* Dropdown */}
            <DropdownMenu.Root>

              <DropdownMenu.Trigger>
                <button className="outline-none">
                  <Flex
                    align="center"
                    gap="2"
                    className="
                      px-2 py-1 rounded-xl
                      hover:bg-gray-100
                      transition
                    "
                  >
                    <Box>
                      <Text
                        as="div"
                        size="2"
                        weight="bold"
                        className="truncate text-gray-800"
                      >
                        {user?.name || "User"}
                      </Text>

                      <Text
                        as="div"
                        size="1"
                        color="gray"
                        className="capitalize text-gray-500"
                      >
                        {user?.role || "staff"}
                      </Text>
                    </Box>

                    <ChevronDown
                      size={18}
                      className="text-gray-500"
                    />
                  </Flex>
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Content
                variant="soft"
                className="min-w-[180px]"
              >
                <DropdownMenu.Item asChild>
  <ProfileDialog />
</DropdownMenu.Item>

               <DropdownMenu.Item onClick={toggleTheme}>
                  <TfiPalette size={16} className="mr-2" />
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </DropdownMenu.Item>
              
                <DropdownMenu.Separator />

                <DropdownMenu.Item color="red">
                  <LogOut size={16} />
                  <LogoutButton />
                </DropdownMenu.Item>
              </DropdownMenu.Content>

            </DropdownMenu.Root>
          </Flex>
        </Card>
      </Flex>
    </header>
  );
}