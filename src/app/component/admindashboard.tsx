'use client';

import Link from 'next/link';

import {
  ArrowRight,
  LayoutDashboard,
  ShieldCheck,
  Users,
  Activity,
  Sparkles,
} from 'lucide-react';

import AdminCockpitView from './AdminCockpitView';
import AdminSwitchAccount from './AdminSwitchAccount';
import Header from './header';
import AddMemberDialog from './addmember';
import AddDepartmentDialog from './AddDepartmentDialog';
import AddCourseDialog from './AddCourseDialog';
import AddTeacherDialog from './AddTeacherDialog';
import DivisionManager from './Division';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div
          className="
            relative overflow-hidden
            rounded-[32px]
            border border-gray-200
            bg-white
            shadow-sm
            mb-8
          "
        >
          {/* Background Blur */}
          <div
            className="
              absolute top-0 right-0
              h-72 w-72
              bg-gray-100
              rounded-full
              blur-3xl
              opacity-60
            "
          />

          <div
            className="
              relative
              flex flex-col xl:flex-row
              xl:items-center xl:justify-between
              gap-8
              p-6 sm:p-8 lg:p-10
            "
          >
            {/* Left */}
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="
                    h-16 w-16
                    rounded-3xl
                    bg-black
                    text-white
                    flex items-center justify-center
                    shadow-lg
                  "
                >
                  <ShieldCheck size={30} />
                </div>

                <div>
                  <div
                    className="
                      inline-flex items-center gap-2
                      px-3 py-1
                      rounded-full
                      bg-gray-100
                      border border-gray-200
                      text-sm font-medium text-gray-700
                      mb-2
                    "
                  >
                    <Sparkles size={14} />
                    Admin Control Center
                  </div>

                  <h1
                    className="
                      text-3xl sm:text-4xl
                      font-bold
                      tracking-tight
                      text-gray-900
                    "
                  >
                    Admin Dashboard
                  </h1>
                </div>
              </div>

              <p
                className="
                  text-gray-600
                  text-base sm:text-lg
                  leading-relaxed
                  max-w-2xl
                "
              >
                Manage accounts, monitor cockpit activities, control team
                operations, and access your CRM management tools from one place.
              </p>

              {/* Quick Stats */}
              <div
                className="
                  grid grid-cols-1 sm:grid-cols-3
                  gap-4
                  mt-8
                "
              >
                <div
                  className="
                    rounded-2xl
                    border border-gray-200
                    bg-gray-50
                    p-4
                  "
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="
                        h-11 w-11
                        rounded-xl
                        bg-black
                        text-white
                        flex items-center justify-center
                      "
                    >
                      <Users size={20} />
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Team Control
                      </p>

                      <h3 className="font-semibold text-gray-900">
                        Account Access
                      </h3>
                    </div>
                  </div>
                </div>

                <div
                  className="
                    rounded-2xl
                    border border-gray-200
                    bg-gray-50
                    p-4
                  "
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="
                        h-11 w-11
                        rounded-xl
                        bg-black
                        text-white
                        flex items-center justify-center
                      "
                    >
                      <Activity size={20} />
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Monitoring
                      </p>

                      <h3 className="font-semibold text-gray-900">
                        Live Cockpit
                      </h3>
                    </div>
                  </div>
                </div>

                <div
                  className="
                    rounded-2xl
                    border border-gray-200
                    bg-gray-50
                    p-4
                  "
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="
                        h-11 w-11
                        rounded-xl
                        bg-black
                        text-white
                        flex items-center justify-center
                      "
                    >
                      <ShieldCheck size={20} />
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Security
                      </p>

                      <h3 className="font-semibold text-gray-900">
                        Admin Access
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Actions */}
            <div
              className="
                flex flex-col sm:flex-row xl:flex-col
                gap-4
                xl:min-w-[260px]
              "
            >
              <Link
                href="/cockpit"
                className="
                  inline-flex items-center justify-center gap-2
                  bg-black hover:bg-gray-800
                  text-white
                  px-6 py-4
                  rounded-2xl
                  font-semibold
                  transition-all duration-200
                  shadow-md hover:shadow-xl
                "
              >
                <LayoutDashboard size={20} />

                View Cockpit

                <ArrowRight size={18} />
              </Link>

              <div
                className="
                  rounded-2xl
                  border border-gray-200
                  bg-gray-50
                  p-3
                  
                "
              >
                <AddMemberDialog />
                
                <AddDepartmentDialog/>
                <AddCourseDialog/>
                <AddTeacherDialog/>
                 <DivisionManager/>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Switch Account */}
          <div className="xl:col-span-1">
            <div
              className="
                bg-white
                border border-gray-200
                rounded-[28px]
                shadow-sm
                p-6
                h-full
              "
            >
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="
                      h-12 w-12
                      rounded-2xl
                      bg-gray-100
                      flex items-center justify-center
                    "
                  >
                    <Users size={22} className="text-gray-700" />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Switch Account
                    </h2>

                    <p className="text-sm text-gray-500">
                      Access different admin profiles securely
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="
                  rounded-2xl
                  border border-gray-200
                  bg-gray-50
                  p-4
                "
              >
                <AdminSwitchAccount />
              </div>
            </div>
          </div>

          {/* Cockpit */}
          <div className="xl:col-span-2">
            <div
              className="
                bg-white
                border border-gray-200
                rounded-[28px]
                shadow-sm
                p-6
                h-full
              "
            >
              <div
                className="
                  flex flex-col sm:flex-row
                  sm:items-center sm:justify-between
                  gap-4
                  mb-6
                "
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="
                        h-12 w-12
                        rounded-2xl
                        bg-black
                        text-white
                        flex items-center justify-center
                      "
                    >
                      <LayoutDashboard size={22} />
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Cockpit Overview
                      </h2>

                      <p className="text-sm text-gray-500">
                        Monitor activities and CRM controls
                      </p>
                    </div>
                  </div>
                </div>

                <Link
                  href="/cockpit"
                  className="
                    inline-flex items-center gap-2
                    text-sm font-semibold
                    text-black
                    hover:text-gray-700
                    transition
                  "
                >
                  Open Full Cockpit

                  <ArrowRight size={16} />
                </Link>
              </div>

              <div
                className="
                  rounded-3xl
                  border border-dashed border-gray-300
                  bg-gradient-to-br
                  from-gray-50
                  to-white
                  p-5
                  min-h-[320px]
                "
              >
                <Link href='/overwrite' className='text-blue-600 hover:underline'>fee overwrite</Link>
                <br></br>
                <Link href="/investment" className='text-blue-600 hover:underline'>Investment Meca</Link>
                <AdminCockpitView />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}