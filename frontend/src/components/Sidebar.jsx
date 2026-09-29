/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { Bell, BookOpen, Shield, ArrowRight } from 'lucide-react';

export default function Sidebar({ currentUser, activeTab, setActiveTab, noticeCount }) {
    const cards = [
        { id: 'notices', label: 'Notices & Schedules', description: 'Campus bulletins, exam tables & timetables', icon: Bell, badge: noticeCount },
        { id: 'resources', label: 'Resource Library', description: 'Study materials, notes & uploads', icon: BookOpen, badge: 0 },
    ];
    // Admin exclusive dashboard
    if (currentUser.role === 'admin') {
        cards.push({ id: 'admin', label: 'Admin Terminal', description: 'Manage users, posts & notices', icon: Shield, badge: 0 });
    }
    return (<aside className="w-72 bg-slate-50 border-r border-slate-200 h-full font-sans z-30 shrink-0 select-none overflow-y-auto p-4 space-y-4" id="sidebar-container">
      {/* Navigation Cards */}
      {cards.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (<button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full text-left bg-white border rounded-3xl p-5 shadow-sm transition-all cursor-pointer group hover:shadow-md ${isActive
                    ? 'border-indigo-300 ring-2 ring-indigo-100'
                    : 'border-slate-200 hover:border-slate-300'}`} title={item.label} id={`sidebar-tab-${item.id}`}>
                <div className="flex items-start justify-between gap-3">
                  <span className={`p-2.5 rounded-2xl flex items-center justify-center shrink-0 ${isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600'} transition-colors`}>
                    <IconComponent size={18} />
                  </span>
                  {item.badge > 0 && (<span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500 text-white leading-none shrink-0">
                      {item.badge}
                    </span>)}
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-sm font-bold tracking-tight ${isActive ? 'text-indigo-700' : 'text-slate-900'}`}>
                      {item.label}
                    </span>
                    <ArrowRight size={14} className={`${isActive ? 'text-indigo-600' : 'text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5'} transition-all shrink-0`} />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                    {item.description}
                  </p>
                </div>
              </button>);
        })}
      </aside>);
}
