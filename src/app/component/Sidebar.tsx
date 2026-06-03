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
  FileText,
  Menu,
  X,
} from 'lucide-react';
import { TbFileSettings } from 'react-icons/tb';
import { FaRegThumbsDown, FaRegThumbsUp } from 'react-icons/fa';
import AddFingerprintDialog from './AddFingerprintDialog';
import LogoutButton from './logout';
import ResetPasswordDialog from './resetpassworddialog';

type SidebarProps = {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const { user } = useUser();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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
      icon: <FaRegThumbsUp size={18} />,
      href: '/positive',
    },
    {
      name: 'Negative',
      icon: <FaRegThumbsDown size={18} />,
      href: '/negative',
    },
  ];

  const handleLinkClick = () => {
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* 1. MOBILE TOP NAVIGATION BAR */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-40 flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-md shadow-md shadow-blue-500/20">
            C
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-sm tracking-tight">
              CRM System
            </h1>
          </div>
        </div>
        
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition active:scale-95"
          aria-label="Open Navigation Menu"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* 2. MOBILE BACKDROP OVERLAY */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* 3. RESPONSIVE SIDEBAR DRAWER */}
      <div
        className={`
          fixed top-0 bottom-0 z-50
          h-screen flex flex-col justify-between
          border-r border-gray-200/80 bg-white/90
          backdrop-blur-xl
          shadow-[4px_0_24px_rgba(0,0,0,0.02)]
          transition-all duration-300 ease-in-out

          /* Desktop Structure */
          lg:left-0 lg:flex
          ${collapsed ? 'lg:w-[88px]' : 'lg:w-[270px]'}

          /* Mobile Structure */
          w-[270px]
          ${isMobileOpen ? 'left-0' : '-left-[270px] lg:left-0'}
        `}
      >
        {/* Top Scrollable Content Section */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-7 custom-scrollbar">
          
          {/* Sidebar Header Section */}
          <div 
            className={`
              flex items-center justify-between 
              ${collapsed ? 'lg:flex-col lg:gap-4 lg:justify-center' : ''}
            `}
          >
            {/* Logo Configuration */}
            <div className={`items-center gap-3 pl-1 ${collapsed ? 'lg:hidden flex' : 'flex'}`}>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-lg shadow-md shadow-blue-500/20">
                C
              </div>
              <div className="leading-tight">
                <h1 className="font-bold text-gray-900 text-sm tracking-tight leading-none">
                  CRM System
                </h1>
                <span className="text-[11px] text-gray-400 font-medium">v2.0.0</span>
              </div>
            </div>

            {/* Action Toggles Container */}
            <div className="flex items-center">
              {/* Mobile Close Button */}
              <button
                onClick={() => setIsMobileOpen(false)}
                className="lg:hidden h-9 w-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                aria-label="Close Navigation Menu"
              >
                <X size={16} />
              </button>

              {/* Desktop Desktop Toggle Action Button */}
              <button
                onClick={() => setCollapsed(!collapsed)}
                className={`
                  hidden lg:flex h-9 w-9 rounded-xl border border-gray-200 bg-white items-center justify-center
                  shadow-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 active:scale-95 transition-all duration-200
                  ${collapsed ? 'mx-auto' : ''}
                `}
              >
                {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
            </div>
          </div>

          {/* Profile Details Container Card */}
          <div 
            className={`
              rounded-2xl border border-gray-100/80 bg-gray-50/50 transition-all duration-200 
              ${collapsed ? 'lg:p-2 p-3.5' : 'p-3.5'}
            `}
          >
            <div className={`flex items-center ${collapsed ? 'lg:justify-center gap-3 lg:gap-0' : 'gap-3'}`}>
              <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 text-white flex items-center justify-center font-semibold text-sm shadow-sm">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>

              <div className={`overflow-hidden leading-tight ${collapsed ? 'lg:hidden block' : 'block'}`}>
                <p className="font-semibold text-gray-900 text-sm truncate">
                  {user?.name || 'User Profile'}
                </p>
                <p className="text-xs text-blue-600 font-medium capitalize mt-0.5 truncate">
                  {user?.role ? `Dept: ${user.role}` : 'Access Granted'}
                </p>
              </div>
            </div>
          </div>

          {/* Core Navigation List Wrapper */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={`
                    group relative flex items-center rounded-xl transition-all duration-200
                    ${collapsed ? 'lg:justify-center lg:p-3 px-4 py-3 gap-3' : 'gap-3 px-4 py-3'}
                    ${
                      isActive
                        ? 'bg-blue-50/70 text-blue-600 font-semibold'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  {/* Left Column Active Segment Anchor Pillar */}
                  {isActive && (!collapsed || isMobileOpen) && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-full" />
                  )}

                  <span 
                    className={`
                      transition-transform duration-200 group-hover:scale-105
                      ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-700'} 
                    `}
                  >
                    {item.icon}
                  </span>

                  <span className={`text-sm tracking-wide ${collapsed ? 'lg:hidden block' : 'block'}`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Fingerprint & Static Utility Records Split View */}
          {(!collapsed || isMobileOpen) && (
            <div className="pt-2 border-t border-gray-100 space-y-2">
              <div className="px-1">
                <AddFingerprintDialog />
              </div>
              <Link 
                href="/record"
                onClick={handleLinkClick}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all"
              >
                <FileText size={18} className="text-gray-400" />
                <span>Record Archives</span>
              </Link>
            </div>
          )}
        </div>

        {/* Core Actions Footer Section */}
        <div className="border-t border-gray-100 bg-white/80 p-4 space-y-2.5">
          {(!collapsed || isMobileOpen) && (
            <div className="px-1">
              <ResetPasswordDialog />
            </div>
          )}

          <div
            className={`
              group flex items-center rounded-xl text-red-600 font-medium hover:bg-red-50/60 transition-all duration-200 cursor-pointer
              ${collapsed ? 'lg:justify-center lg:p-3 px-4 py-3 gap-3' : 'gap-3 px-4 py-3'}
            `}
          >
            <LogOut size={18} className="text-red-500 group-hover:text-red-600 transition-colors" />
            <span className={`text-sm tracking-wide ${collapsed ? 'lg:hidden block' : 'block'}`}>
              <LogoutButton />
            </span>
          </div>
        </div>
      </div>
    </>
  );
}