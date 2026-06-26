/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { Shield, Users, FileText, Bell, Download, Trash2, Activity, CheckCircle } from 'lucide-react';
export default function AdminDashboard({ currentUser, users, posts, notices, resources, onRemoveUser, onUpdateUserRole, onDeletePost }) {
    const [searchUserQuery, setSearchUserQuery] = useState('');
    // Real audit logs should be generated from actual user actions
    // Simulated audit logs removed to eliminate hardcoded placeholder data
    // Statistics calculation
    const totalDownloads = resources.reduce((acc, curr) => acc + curr.downloadCount, 0);
    const filteredUsers = users.filter((u) => {
        return (u.name.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
            u.handle.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
            (u.department && u.department.toLowerCase().includes(searchUserQuery.toLowerCase())));
    });
    return (<div className="flex-1 p-6 space-y-6 max-w-5xl mx-auto font-sans">
      
      {/* Page Editorial Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="font-display font-extrabold text-slate-900 text-2xl tracking-tight flex items-center gap-2">
          <Shield className="text-indigo-600 animate-pulse" size={22}/>
          ConnectSphere System Administration
        </h1>
        <p className="text-slate-500 text-xs mt-0.5">Manage system directories, view live audit trails, promote participants, and moderate campus posts.</p>
      </div>

      {/* Grid of Statistics Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Members</span>
            <Users size={16} className="text-slate-500"/>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-slate-900">{users.length}</span>
            <span className="text-[9px] font-mono text-emerald-600 font-bold">Active</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Active Broadcasts</span>
            <Bell size={16} className="text-slate-500"/>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-slate-900">{posts.length}</span>
            <span className="text-[9px] font-mono text-indigo-600 font-bold">Feeds</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Academic Bulletins</span>
            <FileText size={16} className="text-slate-500"/>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-slate-900">{notices.length}</span>
            <span className="text-[9px] font-mono text-amber-600 font-bold">Notices</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Material Downloads</span>
            <Download size={16} className="text-slate-500"/>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-slate-900">{totalDownloads}</span>
            <span className="text-[9px] font-mono text-slate-500 font-medium">Times</span>
          </div>
        </div>

      </div>

      {/* Main Panel Content: Directory & Audit logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* User Management Directory (Takes 2/3 of grid width) */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm lg:col-span-2 overflow-hidden">
          
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="font-display font-extrabold text-slate-900 text-sm">Participant Directory</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Change moderation roles or ban unauthorized student profiles.</p>
            </div>

            <input type="text" placeholder="Search directory..." value={searchUserQuery} onChange={(e) => setSearchUserQuery(e.target.value)} className="text-xs px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50/50"/>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                  <th className="p-4">User Details</th>
                  <th className="p-4">Department / Branch</th>
                  <th className="p-4">Role Status</th>
                  <th className="p-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
            const isSelf = u.id === currentUser.id;
            return (<tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={u.avatarUrl} alt={u.name} className="w-8.5 h-8.5 rounded-full object-cover border border-slate-100" referrerPolicy="no-referrer"/>
                          <div className="min-w-0">
                            <span className="block font-extrabold text-slate-900 truncate leading-snug">{u.name}</span>
                            <span className="block text-[9px] text-slate-400 truncate mt-0.5">@{u.handle}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-stone-600 truncate max-w-[120px]">
                        {u.department || 'General Community'}
                      </td>

                      <td className="p-4">
                        {u.role === 'admin' ? (<span className="text-[9px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded">
                            ADMIN
                          </span>) : (<span className="text-[9px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded">
                            STUDENT
                          </span>)}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Role toggler */}
                          {!isSelf && (<button onClick={() => onUpdateUserRole(u.id, u.role === 'admin' ? 'participant' : 'admin')} className="px-2 py-1 border border-slate-200 hover:border-slate-400 rounded text-[9px] font-mono font-bold text-slate-600 transition-colors cursor-pointer" title="Toggle admin role">
                              {u.role === 'admin' ? 'DEMOTE' : 'PROMOTE'}
                            </button>)}

                          {/* Delete/Ban User */}
                          {!isSelf && (<button onClick={() => {
                        if (confirm(`Are you sure you want to ban and remove ${u.name} from ConnectSphere?`)) {
                            onRemoveUser(u.id);
                        }
                    }} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50/50 transition-all cursor-pointer" title="Ban member">
                              <Trash2 size={13}/>
                            </button>)}

                          {isSelf && (<span className="text-[9px] font-mono font-bold text-slate-400 px-2 italic">You</span>)}
                        </div>
                      </td>

                    </tr>);
        })}
              </tbody>
            </table>
          </div>

        </div>

        {/* Live Activity Audit Trail (Takes 1/3 grid width) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-display font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
              <Activity size={14} className="text-indigo-600 animate-pulse"/>
              Live Audit Trails
            </h3>
            <span className="text-[9px] font-mono text-slate-400">LOGS</span>
          </div>

          <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
            {auditLogs.map((log) => (<div key={log.id} className="border-b border-slate-100 last:border-0 pb-3 last:pb-0 space-y-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="font-bold text-slate-800">{log.action}</span>
                  <span className="text-slate-400">{log.time}</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  {log.details}
                </p>
                <p className="text-[9px] text-slate-400 font-mono italic">
                  Operator: {log.user}
                </p>
              </div>))}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] font-mono text-slate-400">
            <span>Server: Operational</span>
            <div className="flex items-center gap-1">
              <CheckCircle size={10} className="text-emerald-500"/>
              <span>TLS Secure</span>
            </div>
          </div>
        </div>

      </div>

      {/* Post Moderation Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mt-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Post Moderation</h2>

        <div className="space-y-4">
          {posts.slice(0, 8).map((post) => (
            <div
              key={post.id}
              className="flex items-start justify-between gap-4 border border-slate-200 rounded-xl p-4"
            >
              <div className="min-w-0">
                <p className="font-medium text-slate-900">
                  {post.author?.name || 'Unknown User'}
                </p>
                <p className="text-sm text-slate-600 break-words">
                  {post.text || 'No text content'}
                </p>
              </div>

              <button
                onClick={() => onDeletePost(post.id)}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                <Trash2 size={16} />
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>);
}
