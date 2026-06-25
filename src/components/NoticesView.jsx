/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { Bell, Plus, Trash2, Calendar, CheckSquare, ListFilter, Sparkles, AlertCircle } from 'lucide-react';
export default function NoticesView({ currentUser, notices, onAddNotice, onDeleteNotice }) {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [isUrgent, setIsUrgent] = useState(false);
    const categories = ['All', 'Placements', 'Academics', 'Schedules', 'General'];
    const handleSubmitNotice = (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim())
            return;
        const newNotice = {
            id: `notice-${Date.now()}`,
            title,
            content,
            category,
            createdAt: new Date().toISOString(),
            authorName: `${currentUser.name} (${currentUser.role === 'admin' ? 'Admin' : 'Faculty'})`,
            isUrgent
        };
        onAddNotice(newNotice);
        setTitle('');
        setContent('');
        setCategory('');
        setIsUrgent(false);
        setShowCreateForm(false);
    };
    const filteredNotices = notices.filter((notice) => {
        if (selectedCategory === 'All')
            return true;
        return notice.category === selectedCategory;
    });
    return (<div className="flex-1 p-6 space-y-6 max-w-4xl mx-auto font-sans">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 className="font-display font-extrabold text-slate-900 text-2xl tracking-tight flex items-center gap-2">
            <Bell className="text-indigo-600 animate-pulse" size={22}/>
            Notices & Academic Schedules
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">Campus placement directories, exam tables, and course curriculum syllabus bulletins.</p>
        </div>

        {/* Notice Publisher Trigger for Admins */}
        {currentUser.role === 'admin' && (<button onClick={() => setShowCreateForm(!showCreateForm)} className="self-start sm:self-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-sm transition-all shrink-0 cursor-pointer">
            <Plus size={14}/>
            <span>Publish Notice</span>
          </button>)}
      </div>

      {/* Admin Creator Drawer */}
      {showCreateForm && currentUser.role === 'admin' && (<div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md space-y-4 animate-fadeIn">
          <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs uppercase tracking-wider">
            <Sparkles size={14} className="text-amber-500 animate-spin"/>
            <span>New Academic Announcement Builder</span>
          </div>

          <form onSubmit={handleSubmitNotice} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Announcement Title</label>
                <input type="text" required placeholder="e.g. Advanced AI Seminar Postponement" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-slate-50/50"/>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white">
                    <option value="Placements">Placements</option>
                    <option value="Academics">Academics</option>
                    <option value="Schedules">Schedules</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div className="flex items-center pl-2 pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input type="checkbox" checked={isUrgent} onChange={(e) => setIsUrgent(e.target.checked)} className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"/>
                    <span className="text-[11px] text-rose-600 font-extrabold uppercase tracking-wide">Mark as Urgent</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Notice Description / Content</label>
              <textarea required placeholder="Include eligibility criteria, contact points, exact subject codes, and scheduled halls..." value={content} onChange={(e) => setContent(e.target.value)} rows={4} className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-slate-50/50"/>
            </div>

            <div className="flex justify-end gap-2.5">
              <button type="button" onClick={() => setShowCreateForm(false)} className="px-4 py-2 border border-slate-200 hover:border-slate-400 text-xs font-bold rounded-lg transition-colors cursor-pointer">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer">
                Publish Broadcast
              </button>
            </div>
          </form>
        </div>)}

      {/* Categories Horizontal Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-100">
        <span className="text-slate-400 mr-2 text-xs flex items-center gap-1 shrink-0 font-medium">
          <ListFilter size={12}/>
          Filter Board:
        </span>
        {categories.map((cat) => (<button key={cat} onClick={() => setSelectedCategory(cat)} className={`text-xs px-3.5 py-1.5 rounded-full font-semibold transition-all shrink-0 cursor-pointer ${selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200/65 text-slate-600'}`}>
            {cat}
          </button>))}
      </div>

      {/* Notices Stream */}
      <div className="space-y-4">
        {filteredNotices.length > 0 ? (filteredNotices.map((notice) => {
            return (<div key={notice.id} className={`border rounded-3xl p-6 shadow-sm bg-white hover:shadow-md transition-all relative overflow-hidden ${notice.isUrgent ? 'border-rose-200/90 hover:border-rose-300' : 'border-slate-200 hover:border-slate-300'}`}>
                {/* Urgent indicator stripe */}
                {notice.isUrgent && (<div className="absolute top-0 left-0 right-0 h-1 bg-rose-500 animate-pulse"/>)}

                {/* Card header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${notice.category === 'Placements'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : notice.category === 'Schedules'
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : notice.category === 'Academics'
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                        {notice.category}
                      </span>
                      {notice.isUrgent && (<span className="flex items-center gap-1 text-[9px] font-mono font-black uppercase bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-200 animate-pulse">
                          <AlertCircle size={9}/>
                          Urgent Broadcast
                        </span>)}
                    </div>

                    <h2 className="font-display font-extrabold text-slate-900 text-base leading-snug pt-1">
                      {notice.title}
                    </h2>
                  </div>

                  {/* Delete notice trigger for admin users */}
                  {currentUser.role === 'admin' && (<button onClick={() => onDeleteNotice(notice.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50/50 transition-colors shrink-0 cursor-pointer" title="Delete notice">
                      <Trash2 size={13}/>
                    </button>)}
                </div>

                {/* Content body */}
                <p className="text-xs text-slate-650 leading-relaxed pt-3 whitespace-pre-wrap">
                  {notice.content}
                </p>

                {/* Meta details footer */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
                  <span className="font-semibold text-slate-500">By {notice.authorName}</span>
                  <span className="flex items-center gap-1">
                    <Calendar size={11}/>
                    {new Date(notice.createdAt).toLocaleDateString([], {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                })}
                  </span>
                </div>
              </div>);
        })) : (<div className="text-center py-16 border border-slate-200 rounded-3xl bg-white">
            <CheckSquare size={24} className="mx-auto text-slate-350 mb-2"/>
            <p className="text-xs text-slate-400 font-medium">All clear! No announcements in this category.</p>
          </div>)}
      </div>
    </div>);
}
