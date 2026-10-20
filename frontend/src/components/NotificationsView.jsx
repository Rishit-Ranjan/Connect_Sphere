/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { Bell, CheckCheck, Heart, Megaphone, MessageCircle, X } from 'lucide-react';

const iconForType = (type) => {
  if (type === 'like') return <Heart size={17} className="text-rose-500" />;
  if (type === 'comment') return <MessageCircle size={17} className="text-indigo-500" />;
  return <Megaphone size={17} className="text-amber-500" />;
};

export default function NotificationsView({
  notifications,
  unreadNotificationsCount,
  onMarkAllRead,
  onNotificationClick,
  onDismissNotification
}) {
  return (
    <section className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full font-sans">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 sm:p-7 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Bell size={20} />
            </span>
            <div>
              <h1 className="font-display font-bold text-xl text-slate-900">Notifications</h1>
              <p className="text-xs text-slate-500 mt-1">
                Stay up to date with your campus community.
              </p>
            </div>
          </div>
          {unreadNotificationsCount > 0 && (
            <button
              type="button"
              onClick={onMarkAllRead}
              className="inline-flex items-center justify-center gap-2 self-start sm:self-auto px-3 py-2 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              <CheckCheck size={15} />
              Mark all as read
            </button>
          )}
        </header>

        {notifications.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-3 sm:gap-4 p-4 sm:px-7 sm:py-5 transition-colors ${
                  notification.unread ? 'bg-indigo-50/40' : 'bg-white'
                }`}
              >
                <span className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                  {iconForType(notification.type)}
                </span>
                <button
                  type="button"
                  onClick={() => onNotificationClick(notification)}
                  className="min-w-0 flex-1 text-left rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  aria-label={`${notification.actor} ${notification.text}. Open notification`}
                >
                  <p className="text-sm text-slate-700 leading-relaxed">
                    <span className="font-bold text-slate-900">{notification.actor}</span>{' '}
                    {notification.text}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono mt-1.5">{notification.time}</p>
                </button>
                <div className="flex items-center gap-3 shrink-0">
                  {notification.unread && (
                    <span className="w-2 h-2 rounded-full bg-indigo-500" aria-label="Unread" />
                  )}
                  <button
                    type="button"
                    onClick={() => onDismissNotification(notification)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    aria-label={`Dismiss notification from ${notification.actor}`}
                    title="Dismiss notification"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="m-5 sm:m-7 py-10 sm:py-14 border border-dashed border-slate-200 rounded-2xl text-center">
            <span className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Bell size={21} />
            </span>
            <h2 className="text-sm font-semibold text-slate-700">No notifications yet!</h2>
            <p className="text-xs text-slate-400 mt-1">You&apos;re all caught up.</p>
          </div>
        )}
      </div>
    </section>
  );
}
