/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { Heart, MessageCircle, Image as ImageIcon, Paperclip, Send, Trash2, Search, FileText, X } from 'lucide-react';
export default function FeedView({ currentUser, posts, onAddPost, onDeletePost, onLikePost, onAddComment }) {
    const [searchText, setSearchText] = useState('');
    const [newPostText, setNewPostText] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [showImagePicker, setShowImagePicker] = useState(false);
    // Custom uploaded file simulation state
    const [attachedFileName, setAttachedFileName] = useState(null);
    const [showFileAttach, setShowFileAttach] = useState(false);
    const [tempFileName, setTempFileName] = useState('');
    // Individual post's comment inputs state: postId -> text
    const [commentInputs, setCommentInputs] = useState({});
    // Expanded comment sections state: postId -> boolean
    const [expandedComments, setExpandedComments] = useState({});
    const handleCreatePost = (e) => {
        e.preventDefault();
        if (!newPostText.trim() && !selectedImage && !attachedFileName)
            return;
        const newPost = {
            id: `post-${Date.now()}`,
            author: currentUser,
            text: newPostText,
            imageUrl: selectedImage || undefined,
            fileUrl: attachedFileName ? '#' : undefined,
            fileName: attachedFileName || undefined,
            createdAt: new Date().toISOString(),
            likesCount: 0,
            likedByMe: false,
            comments: []
        };
        onAddPost(newPost);
        setNewPostText('');
        setSelectedImage(null);
        setShowImagePicker(false);
        setAttachedFileName(null);
        setShowFileAttach(false);
        setTempFileName('');
    };
    const handleAttachFile = (e) => {
        e.preventDefault();
        if (tempFileName.trim()) {
            setAttachedFileName(tempFileName.trim());
            setShowFileAttach(false);
        }
    };
    const handlePostComment = (postId) => {
        const text = commentInputs[postId];
        if (!text || !text.trim())
            return;
        onAddComment(postId, text);
        setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
        // Ensure comments expand on submitting
        setExpandedComments((prev) => ({ ...prev, [postId]: true }));
    };
    const filteredPosts = posts.filter((post) => {
        const searchLower = searchText.toLowerCase();
        return (post.text.toLowerCase().includes(searchLower) ||
            post.author.name.toLowerCase().includes(searchLower) ||
            post.author.handle.toLowerCase().includes(searchLower) ||
            (post.fileName && post.fileName.toLowerCase().includes(searchLower)));
    });
    return (<div className="flex-1 p-6 space-y-6 max-w-2xl mx-auto font-sans">
      {/* Editorial Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="font-display font-extrabold text-slate-900 text-2xl tracking-tight">Home</h1>
          <p className="text-slate-500 text-xs">Share projects, thoughts, announcements, and campus updates.</p>
        </div>
        <div className="relative w-48 sm:w-64">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
            <Search size={14}/>
          </span>
          <input type="text" placeholder="Search feed..." value={searchText} onChange={(e) => setSearchText(e.target.value)} className="w-full text-xs pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-650"/>
        </div>
      </div>

      {/* Post Composer Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <form onSubmit={handleCreatePost}>
          <div className="flex gap-3 items-start">
            <img src={currentUser.avatarUrl} alt={currentUser.name} referrerPolicy="no-referrer" className="w-10 h-10 rounded-full object-cover border border-slate-100 shrink-0"/>
            <div className="flex-1">
              <textarea value={newPostText} onChange={(e) => setNewPostText(e.target.value)} placeholder={`What's on your mind, ${currentUser.name.split(' ')[0]}?`} rows={3} className="w-full text-xs text-slate-800 placeholder-slate-400 resize-none border-0 focus:ring-0 focus:outline-none py-1.5"/>

              {/* Show attached image preview */}
              {selectedImage && (<div className="relative mt-3 rounded-2xl overflow-hidden border border-slate-100 group max-h-[220px]">
                  <img src={selectedImage} alt="Attachment Preview" className="w-full h-full object-cover"/>
                  <button type="button" onClick={() => setSelectedImage(null)} className="absolute top-2 right-2 bg-slate-900/80 hover:bg-slate-900 text-white p-1 rounded-full cursor-pointer">
                    <X size={12}/>
                  </button>
                </div>)}

              {/* Show attached file preview */}
              {attachedFileName && (<div className="flex items-center justify-between mt-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs">
                  <div className="flex items-center gap-2 text-slate-700 font-medium">
                    <FileText size={14} className="text-slate-400"/>
                    <span className="truncate max-w-[180px]">{attachedFileName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">(Simulation File)</span>
                  </div>
                  <button type="button" onClick={() => setAttachedFileName(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                    <X size={13}/>
                  </button>
                </div>)}
            </div>
          </div>

          {/* Inline toggles/popups */}
          {showImagePicker && (<div className="mt-4 border-t border-slate-100 pt-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Select a theme photography preset</p>
              <div className="flex gap-2 overflow-x-auto pb-1.5">
                {IMAGE_PRESETS.map((p) => (<button key={p.name} type="button" onClick={() => {
                    setSelectedImage(p.url);
                    setShowImagePicker(false);
                }} className="relative rounded-lg overflow-hidden border border-slate-200 w-24 h-16 shrink-0 group hover:border-slate-500 transition-all cursor-pointer">
                    <img src={p.url} alt={p.name} className="w-full h-full object-cover"/>
                    <div className="absolute inset-0 bg-black/40 flex items-end p-1">
                      <span className="text-[8px] font-bold text-white truncate w-full">{p.name}</span>
                    </div>
                  </button>))}
              </div>
            </div>)}

          {showFileAttach && (<div className="mt-4 border-t border-slate-100 pt-3 flex gap-2">
              <input type="text" placeholder="filename.pdf or syllabus.zip" value={tempFileName} onChange={(e) => setTempFileName(e.target.value)} className="flex-1 text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"/>
              <button type="button" onClick={handleAttachFile} className="bg-indigo-600 text-white text-xs px-4 py-2 rounded-xl hover:bg-indigo-700 font-semibold cursor-pointer">
                Attach
              </button>
            </div>)}

          {/* Action Row */}
          <div className="flex items-center justify-between border-t border-slate-100 mt-4 pt-3">
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => {
            setShowImagePicker(!showImagePicker);
            setShowFileAttach(false);
        }} className={`p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${selectedImage ? 'text-indigo-600 bg-indigo-50' : ''}`}>
                <ImageIcon size={14}/>
                <span>Photo Preset</span>
              </button>
              <button type="button" onClick={() => {
            setShowFileAttach(!showFileAttach);
            setShowImagePicker(false);
        }} className={`p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${attachedFileName ? 'text-indigo-600 bg-indigo-50' : ''}`}>
                <Paperclip size={14}/>
                <span>Attach File</span>
              </button>
            </div>

            <button type="submit" disabled={!newPostText.trim() && !selectedImage && !attachedFileName} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-45 disabled:pointer-events-none text-white font-semibold text-xs py-2 px-5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer">
              <span>Broadcast</span>
              <Send size={12}/>
            </button>
          </div>
        </form>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {filteredPosts.length > 0 ? (filteredPosts.map((post) => {
            const isCommentsExpanded = !!expandedComments[post.id];
            const hasLiked = !!post.likedByMe;
            return (<div key={post.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                {/* Author row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={post.author.avatarUrl} alt={post.author.name} referrerPolicy="no-referrer" className="w-9 h-9 rounded-full object-cover border border-slate-100"/>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-extrabold text-slate-900">{post.author.name}</span>
                        {post.author.role === 'admin' && (<span className="text-[8px] font-mono font-bold bg-amber-50 text-amber-700 px-1 py-0.2 rounded border border-amber-200">Admin</span>)}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                        @{post.author.handle} • {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Delete option for administrators */}
                  {currentUser.role === 'admin' && (<button onClick={() => onDeletePost(post.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50/50 transition-colors cursor-pointer" title="Remove post">
                      <Trash2 size={13}/>
                    </button>)}
                </div>

                {/* Text block */}
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {post.text}
                </p>

                {/* Image block */}
                {post.imageUrl && (<div className="rounded-2xl overflow-hidden border border-slate-100 max-h-[350px]">
                    <img src={post.imageUrl} alt="Post attachment" className="w-full h-full object-cover" referrerPolicy="no-referrer"/>
                  </div>)}

                {/* Simulated file attachments */}
                {post.fileName && (<div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-indigo-600 font-bold text-xs shadow-sm">
                        {post.fileName.split('.').pop()?.toUpperCase() || 'FILE'}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-850 truncate">{post.fileName}</h4>
                        <p className="text-[10px] text-slate-400">Mock Document • Click to Download</p>
                      </div>
                    </div>
                    <button onClick={() => alert(`Simulated downloading resource file: ${post.fileName}`)} className="text-[10px] text-slate-600 hover:text-indigo-600 border border-slate-200 hover:border-indigo-400 px-3 py-1 rounded-xl bg-white font-semibold transition-colors cursor-pointer">
                      Download
                    </button>
                  </div>)}

                {/* Interactions Row */}
                <div className="flex items-center gap-4 pt-3 border-t border-slate-100 text-slate-400">
                  <button onClick={() => onLikePost(post.id)} className={`flex items-center gap-1 text-[11px] font-bold cursor-pointer transition-colors ${hasLiked ? 'text-rose-600' : 'hover:text-rose-600'}`}>
                    <Heart size={14} fill={hasLiked ? 'currentColor' : 'none'} className={hasLiked ? 'scale-110 animate-bounce' : ''}/>
                    <span>{post.likesCount} Like{post.likesCount !== 1 ? 's' : ''}</span>
                  </button>

                  <button onClick={() => setExpandedComments((prev) => ({ ...prev, [post.id]: !isCommentsExpanded }))} className="flex items-center gap-1 text-[11px] font-bold hover:text-slate-800 cursor-pointer">
                    <MessageCircle size={14}/>
                    <span>{post.comments.length} Comment{post.comments.length !== 1 ? 's' : ''}</span>
                  </button>
                </div>

                {/* Comments block */}
                {isCommentsExpanded && (<div className="space-y-3.5 pt-3.5 border-t border-slate-100 bg-slate-50/40 p-4 rounded-2xl">
                    {post.comments.length > 0 && (<div className="space-y-3">
                        {post.comments.map((comment) => (<div key={comment.id} className="flex gap-2.5 items-start">
                            <img src={comment.author.avatarUrl} alt={comment.author.name} className="w-7 h-7 rounded-full object-cover border border-slate-100 shrink-0"/>
                            <div className="bg-white border border-slate-200/80 rounded-2xl p-3 flex-1 shadow-sm">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-950">{comment.author.name}</span>
                                <span className="text-[9px] text-slate-400 font-mono">
                                  {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-600 leading-normal mt-0.5 whitespace-pre-wrap">
                                {comment.text}
                              </p>
                            </div>
                          </div>))}
                      </div>)}

                    {/* Compose comment block */}
                    <div className="flex gap-2 items-center">
                      <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-7 h-7 rounded-full object-cover border border-slate-100 shrink-0"/>
                      <input type="text" placeholder="Write a comment..." value={commentInputs[post.id] || ''} onChange={(e) => {
                        const val = e.target.value;
                        setCommentInputs((prev) => ({ ...prev, [post.id]: val }));
                    }} onKeyDown={(e) => {
                        if (e.key === 'Enter')
                            handlePostComment(post.id);
                    }} className="flex-1 text-[11px] px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 placeholder-slate-400 shadow-inner"/>
                      <button onClick={() => handlePostComment(post.id)} className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer">
                        <Send size={11}/>
                      </button>
                    </div>
                  </div>)}
              </div>);
        })) : (<div className="text-center py-12 bg-white border border-slate-200 rounded-3xl">
            <p className="text-xs text-slate-400 font-medium">No posts matched your query. Broadcast something!</p>
          </div>)}
      </div>
    </div>);
}
