/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useMemo, useState } from 'react';
import { MessageCircle, Search, UserPlus, Users, UserRoundCheck, UserRoundMinus } from 'lucide-react';

const getUserId = (user) => String(user.id || user._id || '');

export default function NetworkView({
  currentUser,
  users,
  relationshipError,
  onConnect,
  onFollow,
  onStartDirectMessage,
  onViewProfile
}) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const people = useMemo(() => {
    const currentUserId = getUserId(currentUser);
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      if (getUserId(user) === currentUserId) return false;
      if (filter === 'following' && !user.following) return false;
      if (filter === 'connections' && !user.connected) return false;
      if (!query) return true;

      return [user.name, user.handle, user.department, user.bio]
        .some((value) => value?.toLowerCase().includes(query));
    });
  }, [currentUser, filter, search, users]);

  const totalFollowing = users.filter((user) =>
    getUserId(user) !== getUserId(currentUser) && user.following
  ).length;
  const totalConnections = users.filter((user) =>
    getUserId(user) !== getUserId(currentUser) && user.connected
  ).length;

  const filters = [
    { id: 'all', label: 'Discover', count: users.length - 1 },
    { id: 'connections', label: 'My contacts', count: totalConnections },
    { id: 'following', label: 'Following', count: totalFollowing }
  ];

  return (
    <section className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full font-sans">
      <div className="rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600 text-white p-5 sm:p-8 shadow-lg shadow-indigo-900/10 overflow-hidden relative">
        <div className="absolute -right-12 -top-20 w-64 h-64 rounded-full border border-white/10" />
        <div className="absolute right-10 -bottom-32 w-72 h-72 rounded-full border border-white/10" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
          <div>
            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-100">
              <Users size={14} />
              Your campus community
            </span>
            <h1 className="font-display font-bold text-2xl sm:text-3xl tracking-tight mt-2">
              My Network
            </h1>
            <p className="text-sm text-indigo-100 mt-2 max-w-xl">
              Find classmates, keep up with people you follow, and build your campus circle.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="min-w-28 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <span className="block text-xl font-bold">{totalConnections}</span>
              <span className="text-[10px] text-indigo-100">Contacts</span>
            </div>
            <div className="min-w-28 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <span className="block text-xl font-bold">{totalFollowing}</span>
              <span className="text-[10px] text-indigo-100">Following</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-1 overflow-x-auto" role="tablist" aria-label="Filter network">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={filter === item.id}
              onClick={() => setFilter(item.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                filter === item.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-200 hover:text-indigo-700'
              }`}
            >
              {item.label}
              <span className={`text-[10px] ${filter === item.id ? 'text-indigo-100' : 'text-slate-400'}`}>
                {item.count}
              </span>
            </button>
          ))}
        </div>

        <label className="relative block w-full sm:max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search people..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
          />
        </label>
      </div>

      {relationshipError && (
        <p role="alert" className="mt-4 text-xs font-medium text-rose-600">{relationshipError}</p>
      )}

      {people.length > 0 ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-5">
          {people.map((user) => (
            <article
              key={getUserId(user)}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all"
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => onViewProfile(user)}
                  className="shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  aria-label={`View ${user.name}'s profile`}
                >
                  <img
                    src={user.avatarUrl || null}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover border border-slate-100 bg-slate-50"
                  />
                </button>
                <div className="min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => onViewProfile(user)}
                    className="block max-w-full truncate text-left text-sm font-bold text-slate-900 hover:text-indigo-700 focus:outline-none focus-visible:underline"
                  >
                    {user.name}
                  </button>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">@{user.handle}</p>
                  <p className="text-[10px] text-slate-400 truncate mt-1">
                    {user.department || (user.role === 'admin' ? 'Administrator' : 'Campus member')}
                  </p>
                </div>
                {user.connected && (
                  <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-1 whitespace-nowrap">
                    In contacts
                  </span>
                )}
              </div>

              {user.bio && (
                <p className="text-xs text-slate-600 leading-relaxed mt-3 line-clamp-2">{user.bio}</p>
              )}

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => onFollow(user.id)}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                    user.following
                      ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      : 'bg-indigo-50 border-indigo-100 text-indigo-700 hover:bg-indigo-100'
                  }`}
                >
                  {user.following ? <UserRoundMinus size={13} /> : <UserPlus size={13} />}
                  {user.following ? 'Following' : 'Follow'}
                </button>
                <button
                  type="button"
                  onClick={() => onConnect(user.id, !user.connected)}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                    user.connected
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-rose-50 hover:border-rose-100 hover:text-rose-700'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-200 hover:text-indigo-700'
                  }`}
                >
                  {user.connected ? <UserRoundCheck size={13} /> : <UserPlus size={13} />}
                  {user.connected ? 'Contact added' : 'Add contact'}
                </button>
                <button
                  type="button"
                  onClick={() => onStartDirectMessage(user)}
                  className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:border-indigo-200 hover:text-indigo-700 transition-colors cursor-pointer"
                  title={`Message ${user.name}`}
                  aria-label={`Message ${user.name}`}
                >
                  <MessageCircle size={14} />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-5 bg-white border border-dashed border-slate-200 rounded-2xl px-5 py-12 text-center">
          <Users size={22} className="mx-auto text-slate-300 mb-3" />
          <h2 className="text-sm font-semibold text-slate-700">
            {search ? 'No people match your search' : filter === 'all' ? 'No members to show yet' : `No ${filters.find((item) => item.id === filter)?.label.toLowerCase()} yet`}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {search ? 'Try another name, handle, or department.' : 'Your campus community will show up here.'}
          </p>
        </div>
      )}
    </section>
  );
}
