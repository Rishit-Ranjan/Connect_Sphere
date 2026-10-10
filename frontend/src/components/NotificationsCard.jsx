/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { Bell, CheckCheck } from 'lucide-react';

/**
 * Notifications card for the right sidebar.
 * Purely derived from props — no data fetching or side effects.
 */
export default function NotificationsCard({ notifications, unreadNotificationsCount, onMarkAllRead, onNavigateTab }) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm" id="notifications-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
          <Bell size={13} className="text-indigo-600" />
          Notifications
        </h3>
        {unreadNotificationsCount > 0 ? (
          <button
            onClick={onMarkAllRead}
            className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
            title="Mark all as read"
            id="notifications-card-mark-all-read-btn"
          >
            <CheckCheck size={12} />
            {unreadNotificationsCount} new
          </button>
        ) : (
          <span className="text-[10px] font-mono text-slate-400 font-medium">All caught up</span>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
          {notifications.slice(0, 5).map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-colors ${
                n.unread
                  ? 'bg-indigo-50/60 border-indigo-100'
                  : 'bg-slate-50 border-slate-100'
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-slate-700 leading-snug">
                  <span className="font-bold text-slate-900">{n.actor}</span> {n.text}
                </p>
                <p className="text-[9px] text-slate-400 font-mono mt-1">{n.time}</p>
              </div>
              {n.unread && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 border border-dashed border-slate-200 rounded-xl">
          <Bell size={18} className="mx-auto text-slate-300 mb-1.5" />
          <p className="text-[10px] text-slate-400 font-medium">No notifications yet!</p>
        </div>
      )}

      <button
        onClick={() => onNavigateTab('notices')}
        className="w-full mt-3 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 py-1.5 rounded-xl hover:bg-indigo-50 transition-all cursor-pointer"
        id="notifications-card-view-all-btn"
      >
        View all notices
      </button>
    </div>
  );
}
