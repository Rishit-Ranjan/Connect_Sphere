/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { UserPlus, CheckCircle, Bell, ArrowRight, MessageSquare } from 'lucide-react';
export default function RightSidebar({ currentUser, users, onConnect, onFollow, urgentNotices, onStartDirectMessage }) {
    // Find candidates for the "Who to Connect With" section (excluding current user and already connected ones)
    const connectCandidates = users
        .filter((u) => u.id !== currentUser.id && !u.connected)
        .slice(0, 3);
    // Online active users list
    const onlineUsers = users.filter((u) => u.id !== currentUser.id);
    return (<aside className="w-80 bg-slate-50 border-l border-slate-200 p-6 space-y-6 overflow-y-auto h-full sticky top-0 font-sans z-10 shrink-0">
      
      {/* 1. Curated Campus Notices Carousel/Banner */}
      {urgentNotices.length > 0 && (<div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
          {/* Subtle design element */}
          <div className="absolute top-[-20%] right-[-10%] w-24 h-24 bg-amber-100 rounded-full opacity-50 blur-xl"/>
          
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs tracking-tight mb-3">
            <Bell size={13} className="text-amber-700 animate-bounce"/>
            <span>CRITICAL ALERT</span>
          </div>

          <div className="space-y-3 relative z-10">
            {urgentNotices.slice(0, 2).map((notice) => (<div key={notice.id} className="border-b border-amber-200/50 last:border-0 pb-2.5 last:pb-0">
                <h4 className="text-xs font-bold text-slate-900 leading-tight mb-1 hover:underline cursor-pointer">
                  {notice.title}
                </h4>
                <p className="text-[10px] text-slate-600 line-clamp-2 leading-relaxed">
                  {notice.content}
                </p>
                <div className="flex items-center justify-between mt-1.5 text-[9px] text-slate-400 font-mono">
                  <span>{notice.authorName}</span>
                  <span>Urgent</span>
                </div>
              </div>))}
          </div>
        </div>)}

      {/* 2. Who to Connect With */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-slate-900 text-xs uppercase tracking-wider">Discover People</h3>
          <span className="text-[10px] font-mono text-slate-400 font-medium">{connectCandidates.length} Suggestion(s)</span>
        </div>

        {connectCandidates.length > 0 ? (<div className="space-y-3">
            {connectCandidates.map((user) => (<div key={user.id} className="flex items-center justify-between gap-2 p-2 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img src={user.avatarUrl} alt={user.name} referrerPolicy="no-referrer" className="w-9 h-9 rounded-full object-cover border border-slate-100"/>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate leading-snug">{user.name}</h4>
                    <p className="text-[9px] text-slate-500 truncate mt-0.5">{user.department || 'Student'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Follow Button */}
                  <button onClick={() => onFollow(user.id)} className={`px-2 py-1 text-[9px] font-bold rounded-lg transition-all border flex items-center justify-center cursor-pointer ${user.following
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-indigo-50 border-indigo-100 text-indigo-700 hover:bg-indigo-600 hover:text-white hover:border-indigo-600'}`} title={user.following ? 'Unfollow' : 'Follow'}>
                    {user.following ? 'Following' : 'Follow'}
                  </button>

                  {/* Connect Button */}
                  <button onClick={() => onConnect(user.id)} className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-400 hover:bg-white transition-all flex items-center justify-center cursor-pointer" title="Connect">
                    <UserPlus size={12}/>
                  </button>
                </div>
              </div>))}
          </div>) : (<div className="text-center py-4 border border-dashed border-slate-200 rounded-xl">
            <CheckCircle size={18} className="mx-auto text-slate-300 mb-1.5"/>
            <p className="text-[10px] text-slate-400 font-medium">You are connected with everyone!</p>
          </div>)}
      </div>

      {/* 3. Live Active Members & Instant Messenger Link */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-slate-900 text-xs uppercase tracking-wider">Online Contacts</h3>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"/>
            <span className="text-[9px] font-mono text-emerald-600 font-bold">LIVE</span>
          </div>
        </div>

        <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
          {onlineUsers.map((user) => (<div key={user.id} className="flex items-center justify-between group cursor-pointer p-1.5 rounded-xl hover:bg-slate-50 transition-colors" onClick={() => onStartDirectMessage(user)}>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative">
                  <img src={user.avatarUrl} alt={user.name} referrerPolicy="no-referrer" className="w-8 h-8 rounded-full object-cover border border-slate-100"/>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"/>
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate leading-snug group-hover:underline">{user.name}</h4>
                  <p className="text-[9px] text-slate-400 truncate mt-0.5">@{user.handle}</p>
                </div>
              </div>

              <div className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 flex items-center gap-1 pr-1">
                <span className="text-[8px] font-bold font-mono text-indigo-600">CHAT</span>
                <MessageSquare size={10} className="text-indigo-600"/>
              </div>
            </div>))}
        </div>
      </div>

      {/* Helpful small instructions card - Bento Indigo Style */}
      <div className="bg-indigo-900 text-white p-6 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="absolute top-[-50%] left-[-20%] w-20 h-20 bg-indigo-500/20 rounded-full blur-xl opacity-80"/>
        <h4 className="text-xs font-display font-bold mb-1 relative z-10">Campus Placement Drive</h4>
        <p className="text-[10px] text-indigo-200 leading-relaxed mb-3 relative z-10">
          Make sure your portfolio links and digital CV are uploaded under the Resource Library to be visible to external evaluators.
        </p>
        <div className="flex items-center gap-1 text-[9px] font-mono text-white hover:underline cursor-pointer relative z-10">
          <span>Read Placement FAQ</span>
          <ArrowRight size={10}/>
        </div>
      </div>
    </aside>);
}
