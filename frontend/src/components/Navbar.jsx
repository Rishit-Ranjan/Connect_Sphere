/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { Home, MessageSquare, Shield, Sparkles, LogOut, Search, X, Users } from 'lucide-react';
import logo from '../assets/ConnectSphere.png';
import NotificationsDropdown from './NotificationsDropdown';

export default function Navbar({ currentUser, activeTab, setActiveTab, onLogout, unreadCount, notifications, unreadNotificationsCount, onMarkAllRead }) {
  const [searchQuery, setSearchQuery] = useState('');
  const isHomeActive = activeTab === 'feed';
  const isRoomsActive = activeTab === 'rooms';
  const isMessagesActive = activeTab === 'messages';
  const isProfileActive = activeTab === 'profile';

  return (
    <header
      id="navbar"
      className="h-16 bg-white border-b border-slate-200 flex items-center justify-between gap-2 px-3 sm:px-6 flex-shrink-0 sticky top-0 z-40 font-sans select-none"
    >
      {/* Left: project icon + name */}
      <button
        onClick={() => setActiveTab('feed')}
        className="flex items-center gap-2.5 cursor-pointer focus:outline-none group"
        title="ConnectSphere Home"
        id="navbar-brand-btn"
      >
        <img
          src={logo}
          alt="ConnectSphere Logo"
          className="w-9 h-9 rounded-full object-contain shrink-0 group-hover:scale-105 transition-transform"
        />
        <span className="font-display font-black text-slate-800 tracking-tight text-base leading-none group-hover:text-indigo-700 transition-colors">
          ConnectSphere
        </span>
      </button>

      {/* Middle: search bar */}
      <div className="hidden md:flex flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts, people, rooms..."
            className="w-full text-xs pl-9 pr-8 py-2 bg-slate-100 border border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-indigo-300 placeholder-slate-400 transition-all"
            id="navbar-search-input"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all cursor-pointer"
              title="Clear search"
              id="navbar-search-clear-btn"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Right: home + campus rooms + notifications + messages + profile section */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        <button
          onClick={() => setActiveTab('feed')}
          className={`relative flex items-center gap-2 px-2 sm:px-3 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all cursor-pointer border ${
            isHomeActive
              ? 'bg-indigo-50 text-indigo-700 border-indigo-100 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-transparent'
          }`}
          title="Home"
          id="navbar-home-btn"
        >
          <Home size={16} className={isHomeActive ? 'text-indigo-700' : 'text-slate-400'} />
          <span className="hidden sm:inline">Home</span>
        </button>

        <NotificationsDropdown
          notifications={notifications}
          unreadNotificationsCount={unreadNotificationsCount}
          onMarkAllRead={onMarkAllRead}
        />

        <button
          onClick={() => setActiveTab('rooms')}
          className={`relative flex items-center gap-2 px-2 sm:px-3 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all cursor-pointer border ${
            isRoomsActive
              ? 'bg-indigo-50 text-indigo-700 border-indigo-100 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-transparent'
          }`}
          title="Campus Rooms"
          id="navbar-rooms-btn"
        >
          <Users size={16} className={isRoomsActive ? 'text-indigo-700' : 'text-slate-400'} />
          <span className="hidden sm:inline">Campus Rooms</span>
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className={`relative flex items-center gap-2 px-2 sm:px-3 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all cursor-pointer border ${
            isMessagesActive
              ? 'bg-indigo-50 text-indigo-700 border-indigo-100 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-transparent'
          }`}
          title="Direct Messages"
          id="navbar-messages-btn"
        >
          <MessageSquare size={16} className={isMessagesActive ? 'text-indigo-700' : 'text-slate-400'} />
          <span className="hidden sm:inline">Messages</span>
          {unreadCount > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500 text-white leading-none">
              {unreadCount}
            </span>
          )}
        </button>

        <div className="w-px h-8 bg-slate-200 hidden sm:block" />

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2.5 pl-1.5 pr-2 sm:pr-3 py-1.5 rounded-xl transition-all cursor-pointer border group ${
            isProfileActive
              ? 'bg-indigo-50/60 border-indigo-200'
              : 'border-transparent hover:bg-slate-50 hover:border-slate-200'
          }`}
          title={currentUser.name ? `${currentUser.name} (View Profile)` : 'View Profile'}
          id="navbar-profile-btn"
        >
          <span className="relative shrink-0">
            <img
              src={currentUser.avatarUrl || null}
              alt={currentUser.name || 'User Avatar'}
              referrerPolicy="no-referrer"
              className="w-9 h-9 rounded-full object-cover border border-slate-200 group-hover:scale-105 transition-transform"
            />
            {currentUser.role === 'admin' ? (
              <span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-0.5 rounded-full border border-white shadow-sm">
                <Shield size={8} className="fill-current" />
              </span>
            ) : (
              <span className="absolute -bottom-1 -right-1 bg-indigo-600 text-white p-0.5 rounded-full border border-white shadow-sm">
                <Sparkles size={8} />
              </span>
            )}
          </span>
          <span className="text-left min-w-0 hidden sm:block">
            <span className="block text-xs font-bold text-slate-900 truncate tracking-tight leading-none">
              {currentUser.name}
            </span>
            <span className="block text-[10px] text-slate-500 truncate mt-0.5">@{currentUser.handle}</span>
          </span>
        </button>

        <button
          onClick={onLogout}
          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer border border-transparent hover:border-rose-100"
          title="Logout"
          id="navbar-logout-btn"
        >
          <LogOut size={15} />
        </button>
      </div>
    </header>
  );
}
