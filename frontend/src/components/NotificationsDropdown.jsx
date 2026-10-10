/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect, useRef, useState } from 'react';
import { Bell, Heart, MessageCircle, Megaphone, X, CheckCheck } from 'lucide-react';

/**
 * Notifications dropdown for the navbar.
 * Renders a bell with unread badge + a dropdown panel.
 * Purely derived from props — no data fetching or side effects.
 */
export default function NotificationsDropdown({ notifications, unreadNotificationsCount, onMarkAllRead }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown on outside click / Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const iconForType = (type) => {
    if (type === 'like') return <Heart size={13} className="text-rose-500 fill-current shrink-0" />;
    if (type === 'comment') return <MessageCircle size={13} className="text-indigo-500 shrink-0" />;
    return <Megaphone size={13} className="text-amber-600 shrink-0" />;
  };

  return (
    <div className="relative" ref={containerRef} id="navbar-notifications-container">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`relative flex flex-col items-center justify-center gap-0.5 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-semibold tracking-tight transition-all cursor-pointer border ${
          isOpen || unreadNotificationsCount > 0
            ? 'bg-indigo-50 text-indigo-700 border-indigo-100 shadow-sm'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-transparent'
        }`}
        title="Notifications"
        id="navbar-notifications-btn"
      >
        <Bell size={16} className={isOpen || unreadNotificationsCount > 0 ? 'text-indigo-700' : 'text-slate-400'} />
        <span className="hidden sm:inline">Notifications</span>
        {unreadNotificationsCount > 0 && (
          <span className="absolute -top-1 -right-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500 text-white leading-none">
            {unreadNotificationsCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50"
          id="navbar-notifications-dropdown"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-900 tracking-tight">Notifications</span>
            <div className="flex items-center gap-1">
              {unreadNotificationsCount > 0 && (
                <button
                  onClick={onMarkAllRead}
                  className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded-lg hover:bg-indigo-50 transition-all cursor-pointer"
                  title="Mark all as read"
                  id="navbar-notifications-mark-all-read-btn"
                >
                  <CheckCheck size={12} />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                title="Close"
                id="navbar-notifications-close-btn"
              >
                <X size={13} />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.slice(0, 20).map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-2.5 px-4 py-3 border-b border-slate-50 last:border-0 ${
                    n.unread ? 'bg-indigo-50/40' : ''
                  }`}
                >
                  <span className="mt-0.5 p-1.5 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    {iconForType(n.type)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-700 leading-snug">
                      <span className="font-bold text-slate-900">{n.actor}</span> {n.text}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">{n.time}</p>
                  </div>
                  {n.unread && <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1.5" />}
                </div>
              ))
            ) : (
              <div className="text-center py-8 px-4">
                <Bell size={20} className="mx-auto text-slate-300 mb-2" />
                <p className="text-xs text-slate-400 font-medium">You&apos;re all caught up!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
