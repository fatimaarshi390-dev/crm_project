'use client';

import { useState } from 'react';

import { useUser } from './context/user-context';

import { usePathname } from 'next/navigation';

import Link from 'next/link';

import {
  LayoutDashboard,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { TbFileSettings } from 'react-icons/tb';

import {
  FaRegThumbsDown,
  FaRegThumbsUp,
} from 'react-icons/fa';

import AddFingerprintDialog from './AddFingerprintDialog';

import LogoutButton from './logout';

import ResetPasswordDialog from './resetpassworddialog';


export default function Sidebar({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { user } = useUser();
  
  const pathname = usePathname();

  //const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      name: 'FMS',
      icon: <LayoutDashboard size={20} />,
      href: '/FMS',
    },
    {
      name: 'MeCA',
      icon: <TbFileSettings size={20} />,
      href: '/MeCA',
    },
    {
      name: 'Positive',
      icon: <FaRegThumbsUp size={20} />,
      href: '/positive',
    },
    {
      name: 'Negative',
      icon: <FaRegThumbsDown size={20} />,
      href: '/negative',
    },
  ];

  return (
    <div
      className={`
        hidden lg:flex
        fixed left-0 top-0 z-40
        h-screen
        flex-col justify-between
        border-r border-white/20
        bg-white/80
        backdrop-blur-2xl
        shadow-[0_10px_50px_rgba(0,0,0,0.08)]
        transition-all duration-300

        ${collapsed ? 'w-[92px]' : 'w-[280px]'}
      `}
    >
      {/* Top */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Header */}
        <div
          className={`
            flex items-center
            ${collapsed ? 'justify-center' : 'justify-between'}
            mb-8
          `}
        >
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div
                className="
                  h-12 w-12
                  rounded-2xl
                  bg-gradient-to-br
                  from-blue-600
                  to-indigo-600
                  text-white
                  flex items-center justify-center
                  font-bold text-lg
                  shadow-lg
                "
              >
                C
              </div>

              <div>
                <h1 className="font-black text-gray-900 text-lg">
                  CRM System
                </h1>

                <p className="text-xs text-gray-500">
                   
                </p>
              </div>
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="
              h-11 w-11
              rounded-2xl
              border border-gray-200
              bg-white
              flex items-center justify-center
              shadow-sm
              hover:bg-gray-50
              transition-all
            "
          >
            {collapsed ? (
              <ChevronRight size={18} />
            ) : (
              <ChevronLeft size={18} />
            )}
          </button>
        </div>

        {/* Profile */}
        <div
          className={`
            rounded-3xl
            border border-gray-100
            bg-gradient-to-br from-white to-slate-50
            shadow-sm
            mb-6

            ${collapsed ? 'p-3' : 'p-4'}
          `}
        >
          <div
            className={`
              flex items-center
              ${collapsed ? 'justify-center' : 'gap-3'}
            `}
          >
            <div
              className="
                h-12 w-12
                rounded-2xl
                bg-gradient-to-br
                from-blue-500
                to-indigo-600
                text-white
                flex items-center justify-center
                font-bold
                shadow-lg
              "
            >
              {user?.name?.charAt(0) || 'U'}
            </div>

            {!collapsed && (
              <div className="overflow-hidden">
                <p className="font-bold text-gray-900 truncate">
                  {user?.name || 'User'}
                </p>

                <p className="text-sm text-blue-600 capitalize">
                  Dept : {user?.role || 'Role'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group relative
                  flex items-center
                  rounded-2xl
                  transition-all duration-300

                  ${
                    collapsed
                      ? 'justify-center px-3 py-4'
                      : 'gap-3 px-4 py-4'
                  }

                  ${
                    isActive
                      ? `
                        bg-gradient-to-r
                        from-blue-600
                        to-indigo-600
                        text-white
                        shadow-lg shadow-blue-200
                      `
                      : `
                        text-gray-600
                        hover:bg-gray-100
                        hover:text-gray-900
                      `
                  }
                `}
              >
                <span
                  className={`
                    transition-transform duration-300
                    group-hover:scale-110
                  `}
                >
                  {item.icon}
                </span>

                {!collapsed && (
                  <span className="font-semibold text-sm">
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Fingerprint */}
        {!collapsed && (
          <div className="mt-5">
            <AddFingerprintDialog />
            <Link href='/record'> Record</Link>
             
          </div>
          
        )}
      </div>

      {/* Bottom */}
      <div
        className="
          border-t border-gray-100
          bg-white/70
          backdrop-blur-xl
          p-4
          space-y-3
        "
      >
        {!collapsed && <ResetPasswordDialog />}

        <div
          className={`
            flex items-center
            rounded-2xl
            text-red-600
            hover:bg-red-50
            transition-all
            cursor-pointer

            ${collapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'}
          `}
        >
          <LogOut size={18} />

          {!collapsed && (
            <span className="font-semibold text-sm">
              <LogoutButton />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}