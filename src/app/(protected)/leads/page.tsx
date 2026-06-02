'use client';

import { useState, useEffect } from 'react';
import { Suspense } from 'react'; 
import { useUser } from '../../component/context/user-context';
import { useSearchParams } from 'next/navigation';
import DemoDayLeadsTable from '@/app/component/DemoLeadsTable';
import Sidebar from '@/app/component/Sidebar';
import EnquiryTable from '../../component/EnquiryTable';
import ApproachedLeadsTable from '@/app/component/ApproachedLeadsTable';
import OrganicLeadForm from '@/app/component/OrganicLeadForm';
import AdmissionForm from '@/app/component/AdmissionForm';
import WeeklyTargetDashboard from '@/app/component/WeeklyTargetDashboard';
import PostDemoLeadsTable from '@/app/component/PostDemoLeadsTable';

import {
  Tabs,
  Box,
} from '@radix-ui/themes';

import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  GraduationCap,
  Sparkles,
  IndianRupee,
} from 'lucide-react';
import NotificationBell from '@/app/component/NotificationBell';
import Header from '@/app/component/header';
import { FaRupeeSign } from 'react-icons/fa';


 function LeadsDashboard() {
  const { user } = useUser();

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
const [activeTab, setActiveTab] = useState(
  searchParams.get('tab') || 'Fresh Leads'
);
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchLeads = async (statusFilter = '') => {
    setLoading(true);

    try {
      const url = statusFilter
        ? `/api/leads?status=${statusFilter}`
        : '/api/leads';

      const res = await fetch(url);

      const data = await res.json();

      if (data.success) {
        setLeads(data.data || []);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'Fresh Leads') {
      fetchLeads('fresh');
    } else if (activeTab === 'per-demo-followups') {
      fetchLeads('pre-demo');
    } else if (activeTab === 'demo-day-followups') {
      fetchLeads('demo-day');
    } else if (activeTab === 'post-demo-followups') {
      fetchLeads('post-demo');
    } else if (activeTab === 'addmission') {
      fetchLeads('admission');
    }
  }, [activeTab]);
useEffect(() => {
  const tab = searchParams.get('tab');
  if (tab) {
    setActiveTab(tab);
  }
}, [searchParams]);
  const tabs = [
    {
      value: 'Fresh Leads',
      label: 'Fresh Leads',
      icon: <Sparkles size={16} />,
    },
    {
      value: 'per-demo-followups',
      label: 'follow-up',
      icon: <Users size={16} />,
    },
    {
      value: 'demo-day-followups',
      label: 'Demo Day',
      icon: <LayoutDashboard size={16} />,
    },
    {
      value: 'post-demo-followups',
      label: 'Post-Demo follow-up',
      icon: <Users size={16} />,
    },
    {
      value: 'addmission',
      label: 'Installment Form',
      icon: <IndianRupee size={16} />,
    },
    {
      value: 'organic-leads',
      label: 'Organic Leads',
      icon: <Sparkles size={16} />,
    },
  ];

return (
  <div className="min-h-screen bg-[#f8fafc]">
    
    {/* HEADER */}
    <div
      className={`
        fixed top-0 right-0 z-40
        transition-all duration-300
        ${
          collapsed
            ? 'lg:left-[92px]'
            : 'lg:left-[280px]'
        }
        left-0
      `}
    >
      <Header />
    </div>

    {/* MOBILE MENU BUTTON */}
    {/* <button
      onClick={() => setSidebarOpen(true)}
      className="
        lg:hidden
        fixed top-4 left-4 z-50
        h-11 w-11
        rounded-2xl
       
        text-white
        shadow-xl
        flex items-center justify-center
      "
    >
      <Menu size={20} />
    </button> */}

    {/* MOBILE SIDEBAR */}
    {sidebarOpen && (
      <div className="lg:hidden fixed inset-0 z-50">
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />

        {/* Sidebar */}
        <div
          className="
            relative z-50
            h-full
            w-[290px]
            bg-white
            shadow-2xl
            animate-in
            slide-in-from-left
            duration-300
          "
        >
          {/* Close */}
          <div className="flex justify-end p-4">
            <button
              onClick={() => setSidebarOpen(false)}
              className="
                h-10
                w-10
                rounded-xl
                bg-gray-100
                flex items-center justify-center
              "
            >
              <X size={18} />
            </button>
          </div>

          <Sidebar />
        </div>
      </div>
    )}

    {/* DESKTOP SIDEBAR */}
    <Sidebar
      collapsed={collapsed}
      setCollapsed={setCollapsed}
    />

    {/* MAIN CONTENT */}
    <main
      className={`
        transition-all duration-300
        pt-[95px]
        min-h-screen

        ${
          collapsed
            ? 'lg:ml-[92px]'
            : 'lg:ml-[280px]'
        }
      `}
    >
      <div className="p-3 sm:p-5 lg:p-7">
        
        {/* HERO */}
        <div
          className="
            relative overflow-hidden
            rounded-[36px]
            border border-white/60
            bg-white
            shadow-[0_10px_40px_rgba(0,0,0,0.05)]
            p-5 sm:p-7 lg:p-9
            mb-6
          "
        >
          {/* Background Blur */}
          <div className="absolute top-0 right-0 h-72 w-72 bg-blue-100 rounded-full blur-3xl opacity-40" />

          <div className="relative flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">
            
            {/* LEFT */}
            <div>
              <div
                className="
                  inline-flex items-center gap-2
                  rounded-full
                  bg-blue-50
                  border border-blue-100
                  px-4 py-2
                  text-sm font-semibold text-blue-700
                  mb-5
                "
              >
                <Sparkles size={15} />

                CRM Leads Management
              </div>

              <h1
                className="
                  text-3xl sm:text-5xl
                  font-black
                  tracking-tight
                  text-gray-900
                "
              >
                Leads Dashboard
              </h1>

              <p
                className="
                  text-gray-600
                  mt-4
                  max-w-2xl
                  text-sm sm:text-base
                  leading-relaxed
                "
              >
                Manage fresh leads, follow-ups,
                admissions and organic enquiries
                using a modern responsive CRM panel.
              </p>
            </div>
          </div>
        </div>

        {/* WEEKLY DASHBOARD */}
        <div className="mb-6">
          <WeeklyTargetDashboard />
        </div>

        {/* TABS SECTION */}
        <div
          className="
            rounded-[36px]
            border border-white/70
            bg-white
            shadow-[0_10px_40px_rgba(0,0,0,0.05)]
            overflow-hidden
          "
        >
          <Tabs.Root
  value={activeTab}
  defaultValue="Fresh Leads"
  onValueChange={setActiveTab}
>
            {/* TAB HEADER */}
            <div
              className="
                border-b border-gray-100
                bg-gradient-to-r
                from-white
                to-slate-50
              "
            >
              <div className="overflow-x-auto scrollbar-hide">
                <Tabs.List
                  className="
                    flex w-max min-w-full
                    gap-2
                    px-4 sm:px-6
                    pt-5 pb-4
                  "
                >
                  {tabs.map((tab) => (
                    <Tabs.Trigger
                      key={tab.value}
                      value={tab.value}
                      className="
                        flex items-center gap-2
                        whitespace-nowrap
                        rounded-2xl
                        px-5 py-3
                        text-sm font-semibold
                        text-gray-600
                        transition-all duration-300

                        hover:bg-gray-100

                        data-[state=active]:bg-black
                        data-[state=active]:text-white
                        data-[state=active]:shadow-lg
                      "
                    >
                      {tab.icon}

                      {tab.label}
                    </Tabs.Trigger>
                  ))}
                </Tabs.List>
              </div>
            </div>

            {/* TAB CONTENT */}
            <Box className="p-3 sm:p-5 lg:p-7">
              <Tabs.Content value="Fresh Leads">
                {loading ? (
                  <div className="flex items-center justify-center py-24">
                    <div
                      className="
                        h-14 w-14
                        rounded-full
                        border-4 border-gray-200
                        border-t-black
                        animate-spin
                      "
                    />
                  </div>
                ) : (
                  <EnquiryTable
                    data={leads}
                    onRefresh={() =>
                      fetchLeads('fresh')
                    }
                  />
                )}
              </Tabs.Content>

              <Tabs.Content value="per-demo-followups">
                <ApproachedLeadsTable tabType="pre-demo" />
              </Tabs.Content>

              <Tabs.Content value="demo-day-followups">
                <DemoDayLeadsTable />
              </Tabs.Content>

              <Tabs.Content value="post-demo-followups">
                <PostDemoLeadsTable />
              </Tabs.Content>

              <Tabs.Content value="addmission">
                {loading ? (
                  <div className="py-16 text-center text-gray-500">
                    Loading Admissions...
                  </div>
                ) : (
                  <AdmissionForm
                    leads={leads}
                    onRefresh={fetchLeads}
                  />
                )}
              </Tabs.Content>

              <Tabs.Content value="organic-leads">
                <OrganicLeadForm />
              </Tabs.Content>
            </Box>
          </Tabs.Root>
        </div>
      </div>
    </main>
  </div>
);
}
export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LeadsDashboard />
    </Suspense>
  );
}