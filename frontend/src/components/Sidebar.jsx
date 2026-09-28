/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Bell, BookOpen, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
export default function Sidebar({ currentUser, activeTab, setActiveTab, noticeCount }) {
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebar_collapsed');
        return saved === 'true';
    });
    useEffect(() => {
        localStorage.setItem('sidebar_collapsed', String(isCollapsed));
    }, [isCollapsed]);
    const menuItems = [
        { id: 'notices', label: 'Notices & Schedules', icon: Bell, badge: noticeCount },
        { id: 'resources', label: 'Resource Library', icon: BookOpen, badge: 0 },
    ];
    // Admin exclusive dashboard
    if (currentUser.role === 'admin') {
        menuItems.push({ id: 'admin', label: 'Admin Terminal', icon: Shield, badge: 0 });
    }
    return (<motion.aside animate={{ width: isCollapsed ? 80 : 256 }} transition={{ type: 'spring', stiffness: 350, damping: 32 }} className="bg-white border-r border-slate-200 flex flex-col justify-between h-full font-sans z-30 shrink-0 select-none overflow-hidden" id="sidebar-container">
      {/* Top Nav */}
      <div className="p-4 flex flex-col gap-6">
        <div className={`flex items-center w-full ${isCollapsed ? 'justify-center' : 'justify-end'} px-1 mt-2`}>
          {/* Toggle button inside sidebar when expanded */}
          {!isCollapsed && (<button onClick={() => setIsCollapsed(true)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer" title="Collapse Sidebar" id="btn-collapse-sidebar">
              <ChevronLeft size={14}/>
            </button>)}
        </div>

        {/* Dedicated expand button when collapsed */}
        {isCollapsed && (<button onClick={() => setIsCollapsed(false)} className="mx-auto p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-all flex items-center justify-center cursor-pointer shadow-sm border border-indigo-100 w-8 h-8" title="Expand Sidebar" id="btn-expand-sidebar">
            <ChevronRight size={14}/>
          </button>)}

        {/* Navigation Items */}
        <nav className="space-y-1.5 mt-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (<button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold tracking-tight transition-all text-left ${isActive
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100/50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'} ${isCollapsed ? 'justify-center px-0' : ''}`} title={isCollapsed ? item.label : undefined} id={`sidebar-tab-${item.id}`}>
                <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center w-full' : ''}`}>
                  <div className="relative flex items-center justify-center">
                    <IconComponent size={16} className={isActive ? 'text-indigo-700' : 'text-slate-400'}/>
                    {isCollapsed && item.badge > 0 && (<span className="absolute -top-1.5 -right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse"/>)}
                  </div>
                  {!isCollapsed && (<motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="whitespace-nowrap">
                      {item.label}
                    </motion.span>)}
                </div>
                {!isCollapsed && item.badge > 0 && (<span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500 text-white leading-none">
                    {item.badge}
                  </span>)}
              </button>);
        })}
        </nav>
      </div>

      {/* Footer */}
      <div className={`p-4 border-t border-slate-100 bg-slate-50/50 ${isCollapsed ? 'flex flex-col items-center gap-3' : ''}`}>
        {/* Little helpful branding notes */}
        {!isCollapsed && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[9px] text-center text-slate-400 font-mono tracking-tight px-2">
            <span>Active Session | UTC 2026</span>
          </motion.div>)}
      </div>
    </motion.aside>);
}
