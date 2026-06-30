/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Home, Bell, BookOpen, MessageSquare, Shield, Users, LogOut, Sparkles, UserCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import logo from '../assets/ConnectSphere.png';
export default function Sidebar({ currentUser, activeTab, setActiveTab, onLogout, unreadCount, noticeCount }) {
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebar_collapsed');
        return saved === 'true';
    });
    useEffect(() => {
        localStorage.setItem('sidebar_collapsed', String(isCollapsed));
    }, [isCollapsed]);
    const menuItems = [
        { id: 'feed', label: 'Home', icon: Home, badge: 0 },
        { id: 'notices', label: 'Notices & Schedules', icon: Bell, badge: noticeCount },
        { id: 'resources', label: 'Resource Library', icon: BookOpen, badge: 0 },
        { id: 'rooms', label: 'Campus Rooms', icon: Users, badge: 0 },
        { id: 'messages', label: 'Direct Messages', icon: MessageSquare, badge: unreadCount },
        { id: 'profile', label: 'My Profile', icon: UserCircle, badge: 0 },
    ];
    // Admin exclusive dashboard
    if (currentUser.role === 'admin') {
        menuItems.push({ id: 'admin', label: 'Admin Terminal', icon: Shield, badge: 0 });
    }
    return (<motion.aside animate={{ width: isCollapsed ? 80 : 256 }} transition={{ type: 'spring', stiffness: 350, damping: 32 }} className="bg-white border-r border-slate-200 flex flex-col justify-between h-full sticky top-0 font-sans z-35 shrink-0 select-none overflow-hidden" id="sidebar-container">
      {/* Branding and Top Nav */}
      <div className="p-4 flex flex-col gap-6">
        <div className={`flex items-center w-full ${isCollapsed ? 'justify-center' : 'justify-between'} px-1 mt-2`}>
          {/* Logo Icon and Text */}
          <div className={`flex overflow-hidden ${isCollapsed ? 'justify-center' : 'flex-col items-center gap-2 w-full'}`}>
            <img src={logo} alt="ConnectSphere Logo" className="w-40 h-22 shrink-0" />
            {!isCollapsed && (<motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.15 }} className="whitespace-nowrap">
                <span className="font-display font-black text-slate-800 tracking-tight block text-base leading-none">
                  ConnectSphere
                </span>
              </motion.div>)}
          </div>

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

      {/* User Information Profile Card & Actions at bottom */}
      <div className={`p-4 border-t border-slate-100 bg-slate-50/50 ${isCollapsed ? 'flex flex-col items-center gap-3' : ''}`}>
        {isCollapsed ? (<div className="flex flex-col items-center gap-3 py-2">
            <button onClick={() => setActiveTab('profile')} className="relative group cursor-pointer focus:outline-none" title={currentUser.name ? `${currentUser.name} (View Profile)` : 'View Profile'} id="sidebar-collapsed-profile-btn">
              <img src={currentUser.avatarUrl || null} alt={currentUser.name || 'User Avatar'} referrerPolicy="no-referrer" className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-slate-200 group-hover:ring-indigo-500 group-hover:scale-105 transition-all"/>
              {currentUser.role === 'admin' ? (<span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-0.5 rounded-full border border-white shadow-sm">
                  <Shield size={8} className="fill-current"/>
                </span>) : (<span className="absolute -bottom-1 -right-1 bg-indigo-600 text-white p-0.5 rounded-full border border-white shadow-sm">
                  <Sparkles size={8}/>
                </span>)}
            </button>

            <button onClick={onLogout} className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer flex items-center justify-center border border-slate-100" title="Logout" id="sidebar-collapsed-logout-btn">
              <LogOut size={13}/>
            </button>
          </div>) : (<div onClick={() => setActiveTab('profile')} className="bg-white border border-slate-200 p-4 rounded-2xl mb-3 shadow-sm cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/10 transition-all group" id="sidebar-expanded-profile-card">
            <div className="flex items-center gap-2.5 mb-2.5">
              <img src={currentUser.avatarUrl || null} alt={currentUser.name || 'User Avatar'} referrerPolicy="no-referrer" className="w-10 h-10 rounded-full object-cover border border-slate-100 group-hover:scale-105 transition-transform"/>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-900 truncate tracking-tight group-hover:text-indigo-600 transition-colors">
                  {currentUser.name}
                </h4>
                <p className="text-[10px] text-slate-500 truncate">@{currentUser.handle}</p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 mt-2.5">
              {currentUser.role === 'admin' ? (<div className="flex items-center gap-1 text-[9px] font-mono bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200 font-bold">
                  <Shield size={10}/>
                  ADMIN PANEL
                </div>) : (<div className="flex items-center gap-1 text-[9px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100 font-medium">
                  <Sparkles size={10} className="text-indigo-500 animate-pulse"/>
                  STUDENT
                </div>)}

              <button onClick={(e) => {
                e.stopPropagation();
                onLogout();
            }} className="text-[9px] font-mono font-bold text-slate-500 hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer" title="Logout" id="sidebar-expanded-logout-btn">
                <LogOut size={11}/>
                Logout
              </button>
            </div>
          </div>)}

        {/* Little helpful branding notes */}
        {!isCollapsed && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[9px] text-center text-slate-400 font-mono tracking-tight px-2">
            <span>Active Session | UTC 2026</span>
          </motion.div>)}
      </div>
    </motion.aside>);
}
