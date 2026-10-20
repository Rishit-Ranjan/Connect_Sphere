/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect, useRef, useState } from 'react';
import { API_URL, resolveApiAssetUrl } from '../config/api';
import {
  Heart,
  MessageCircle,
  Image as ImageIcon,
  Paperclip,
  Send,
  Trash2,
  Search,
  FileText,
  X,
  Pencil
} from 'lucide-react';

function PostImage({ imageUrl }) {
  const [imageSrc, setImageSrc] = useState('');

  useEffect(() => {
    setImageSrc('');
    if (!imageUrl?.startsWith('/api/posts/images/')) {
      setImageSrc(resolveApiAssetUrl(imageUrl));
      return undefined;
    }

    const controller = new AbortController();
    let objectUrl;
    let cancelled = false;
    const token = localStorage.getItem('token');

    fetch(resolveApiAssetUrl(imageUrl), {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load post image (${response.status}).`);
        }
        return response.blob();
      })
      .then((imageBlob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(imageBlob);
        setImageSrc(objectUrl);
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          console.error('Error loading post image:', error);
        }
      });

    return () => {
      cancelled = true;
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [imageUrl]);

  if (!imageSrc) return null;
  return (
    <img
      src={imageSrc}
      alt="Post attachment"
      className="w-full h-full object-cover"
      referrerPolicy="no-referrer"
    />
  );
}

export default function FeedView({
  currentUser,
  posts,
  onAddPost,
  onDeletePost,
  onEditPost,
  onLikePost,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onViewProfile,
  notificationTarget
}) {
  const fileInputRef = useRef(null);
  const attachmentInputRef = useRef(null);

  const [searchText, setSearchText] = useState('');
  const [newPostText, setNewPostText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [postError, setPostError] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [editingPostId, setEditingPostId] = useState(null);
  const [editPostText, setEditPostText] = useState('');
  const [highlightedCommentId, setHighlightedCommentId] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [commentActionError, setCommentActionError] = useState('');

  useEffect(() => {
    if (!selectedImage) {
      setImagePreview('');
      return undefined;
    }

    const previewUrl = URL.createObjectURL(selectedImage);
    setImagePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [selectedImage]);

  useEffect(() => {
    if (notificationTarget?.type === 'comment' && notificationTarget.postId) {
      setExpandedComments((previous) => ({
        ...previous,
        [notificationTarget.postId]: true,
      }));
    }
  }, [notificationTarget]);

  useEffect(() => {
    if (!notificationTarget?.postId) return;
    if (
      notificationTarget.type === 'comment' &&
      !expandedComments[notificationTarget.postId]
    ) {
      return;
    }

    const targetId =
      notificationTarget.type === 'comment' && notificationTarget.commentId
        ? `feed-comment-${notificationTarget.commentId}`
        : `feed-post-${notificationTarget.postId}`;
    const targetElement = document.getElementById(targetId);
    targetElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    if (notificationTarget.commentId) {
      setHighlightedCommentId(notificationTarget.commentId);
      const timeoutId = window.setTimeout(() => {
        setHighlightedCommentId(null);
      }, 2500);
      return () => window.clearTimeout(timeoutId);
    }
  }, [notificationTarget, expandedComments]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setPostError('');
    if (!newPostText.trim()) {
      setPostError('Post text is required.');
      return;
    }

    setIsPosting(true);
    try {
      await onAddPost({
        text: newPostText,
        image: selectedImage
      });

      setNewPostText('');
      setSelectedImage(null);
      setShowImagePicker(false);
      setAttachedFile(null);
    } catch (error) {
      setPostError(error.message || 'Failed to create post.');
    } finally {
      setIsPosting(false);
    }
  };

  const handleAttachmentSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAttachedFile(file);
    }
    event.target.value = '';
  };

  const handlePostComment = (postId) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    onAddComment(postId, text);
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    setExpandedComments((prev) => ({ ...prev, [postId]: true }));
  };

  const handleSaveComment = async (postId, commentId) => {
    const text = editCommentText.trim();
    if (!text) {
      setCommentActionError('Comment cannot be empty.');
      return;
    }

    setCommentActionError('');
    try {
      await onEditComment(postId, commentId, text);
      setEditingComment(null);
      setEditCommentText('');
    } catch (error) {
      setCommentActionError(error.message || 'Failed to edit comment.');
    }
  };

  const handleRemoveComment = async (postId, commentId) => {
    setCommentActionError('');
    try {
      await onDeleteComment(postId, commentId);
    } catch (error) {
      setCommentActionError(error.message || 'Failed to delete comment.');
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    setPostError('');
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setPostError('Choose a JPG, PNG, or WebP image.');
      } else if (file.size > 5 * 1024 * 1024) {
        setPostError('Choose an image no larger than 5 MB.');
      } else {
        setSelectedImage(file);
      }
    }
    event.target.value = '';
  };

  const canManagePost = (post) =>
    currentUser?.role === 'admin' || currentUser?.id === post.author?.id;

  const handleStartEdit = (post) => {
    setEditingPostId(post.id);
    setEditPostText(post.text);
  };

  const handleSaveEdit = (postId) => {
    if (!editPostText.trim()) return;
    onEditPost(postId, editPostText.trim());
    setEditingPostId(null);
    setEditPostText('');
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditPostText('');
  };

  const filteredPosts = posts.filter((post) => {
    const searchLower = searchText.toLowerCase();
    return (
      post.text.toLowerCase().includes(searchLower) ||
      post.author.name.toLowerCase().includes(searchLower) ||
      post.author.handle.toLowerCase().includes(searchLower) ||
      (post.fileName && post.fileName.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="flex-1 p-4 sm:p-6 space-y-6 max-w-2xl mx-auto font-sans">
      <div className="pb-4 border-b border-slate-200">
        <div>
          <h1 className="font-display font-extrabold text-slate-900 text-2xl tracking-tight">Home</h1>
          <p className="text-slate-500 text-xs">Share projects, thoughts, announcements, and campus updates.</p>
        </div>
        <div className="relative mt-3">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder="Search feed..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-650"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <form onSubmit={handleCreatePost}>
          <div className="flex gap-3 items-start">
            <img
              src={currentUser.avatarUrl || null}
              alt={currentUser.name || 'User Avatar'}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover border border-slate-100 shrink-0"
            />
            <div className="flex-1">
              <textarea
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                placeholder={`What's on your mind, ${currentUser.name.split(' ')[0]}?`}
                rows={3}
                className="w-full text-xs text-slate-800 placeholder-slate-400 resize-none border-0 focus:ring-0 focus:outline-none py-1.5"
              />

              {selectedImage && (
                <div className="relative mt-3 rounded-2xl overflow-hidden border border-slate-100 group max-h-[220px]">
                  <img src={imagePreview} alt="Attachment Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImage(null);
                      setPostError('');
                    }}
                    className="absolute top-2 right-2 bg-slate-900/80 hover:bg-slate-900 text-white p-1 rounded-full cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              {postError && (
                <p role="alert" className="mt-2 text-xs text-rose-600">{postError}</p>
              )}

              {attachedFile && (
                <div className="flex items-center justify-between mt-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs">
                  <div className="flex items-center gap-2 text-slate-700 font-medium">
                    <FileText size={14} className="text-slate-400" />
                    <span className="truncate max-w-[180px]">{attachedFile.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ({(attachedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAttachedFile(null)}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 mt-4 pt-3">
            <div className="flex items-center gap-1">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
              />
              <input
                type="file"
                ref={attachmentInputRef}
                onChange={handleAttachmentSelect}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => {
                  fileInputRef.current?.click();
                }}
                className={`p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${selectedImage ? 'text-indigo-600 bg-indigo-50' : ''}`}
              >
                <ImageIcon size={14} />
                <span>Upload Image</span>
              </button>

              <button
                type="button"
                onClick={() => attachmentInputRef.current?.click()}
                className={`p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${attachedFile ? 'text-indigo-600 bg-indigo-50' : ''}`}
              >
                <Paperclip size={14} />
                <span>Attach File</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={isPosting || (!newPostText.trim() && !selectedImage && !attachedFile)}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-45 disabled:pointer-events-none text-white font-semibold text-xs py-2 px-5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <span>{isPosting ? 'Posting…' : 'Broadcast'}</span>
              <Send size={12} />
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => {
            const isCommentsExpanded = !!expandedComments[post.id];
            const hasLiked = !!post.likedByMe;

            return (
              <div id={`feed-post-${post.id}`} key={post.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onViewProfile?.(post.author)}
                      className="shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                      aria-label={`View ${post.author.name}'s profile`}
                    >
                      <img
                        src={post.author.avatarUrl || null}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 rounded-full object-cover border border-slate-100"
                      />
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onViewProfile?.(post.author)}
                          className="truncate text-left text-xs font-extrabold text-slate-900 hover:text-indigo-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                        >
                          {post.author.name}
                        </button>
                        {post.author.role === 'admin' && (
                          <span className="text-[8px] font-mono font-bold bg-amber-50 text-amber-700 px-1 py-0.2 rounded border border-amber-200">
                            Admin
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                        @{post.author.handle} • {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {canManagePost(post) && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(post)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                        title="Edit post"
                      >
                        <Pencil size={13} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeletePost(post.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50/50 transition-colors cursor-pointer"
                        title="Remove post"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>

                {editingPostId === post.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editPostText}
                      onChange={(e) => setEditPostText(e.target.value)}
                      rows={3}
                      className="w-full text-xs text-slate-700 resize-none border border-slate-200 rounded-2xl px-3 py-2 focus:outline-none focus:border-indigo-500"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(post.id)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold px-3 py-1.5 rounded-xl cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold px-3 py-1.5 rounded-xl cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{post.text}</p>
                )}

                {post.imageUrl && (
                  <div className="rounded-2xl overflow-hidden border border-slate-100 max-h-[350px]">
                    <PostImage imageUrl={post.imageUrl} />
                  </div>
                )}

                {post.fileName && (
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-indigo-600 font-bold text-xs shadow-sm">
                        {post.fileName.split('.').pop()?.toUpperCase() || 'FILE'}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-850 truncate">{post.fileName}</h4>
                        <p className="text-[10px] text-slate-400">Mock Document • Click to Download</p>
                      </div>
                    </div>
                    <button
                      onClick={() => alert(`Simulated downloading resource file: ${post.fileName}`)}
                      className="text-[10px] text-slate-600 hover:text-indigo-600 border border-slate-200 hover:border-indigo-400 px-3 py-1 rounded-xl bg-white font-semibold transition-colors cursor-pointer"
                    >
                      Download
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-4 pt-3 border-t border-slate-100 text-slate-400">
                  <button
                    onClick={() => onLikePost(post.id)}
                    className={`flex items-center gap-1 text-[11px] font-bold cursor-pointer transition-colors ${hasLiked ? 'text-rose-600' : 'hover:text-rose-600'}`}
                  >
                    <Heart size={14} fill={hasLiked ? 'currentColor' : 'none'} className={hasLiked ? 'scale-110 animate-bounce' : ''} />
                    <span>{post.likesCount} Like{post.likesCount !== 1 ? 's' : ''}</span>
                  </button>

                  <button
                    onClick={() => setExpandedComments((prev) => ({ ...prev, [post.id]: !isCommentsExpanded }))}
                    className="flex items-center gap-1 text-[11px] font-bold hover:text-slate-800 cursor-pointer"
                  >
                    <MessageCircle size={14} />
                    <span>{post.comments.length} Comment{post.comments.length !== 1 ? 's' : ''}</span>
                  </button>
                </div>

                {isCommentsExpanded && (
                  <div className="space-y-3.5 pt-3.5 border-t border-slate-100 bg-slate-50/40 p-4 rounded-2xl">
                    {post.comments.length > 0 && (
                      <div className="space-y-3">
                        {post.comments.map((comment) => (
                          <div
                            id={`feed-comment-${comment.id}`}
                            key={comment.id}
                            className={`flex gap-2.5 items-start rounded-xl transition-colors ${
                              highlightedCommentId === comment.id
                                ? 'bg-indigo-50 ring-2 ring-indigo-300'
                                : ''
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => onViewProfile?.(comment.author)}
                              className="shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                              aria-label={`View ${comment.author.name}'s profile`}
                            >
                              <img
                                src={comment.author.avatarUrl || null}
                                alt=""
                                className="w-7 h-7 rounded-full object-cover border border-slate-100"
                              />
                            </button>
                            <div className="bg-white border border-slate-200/80 rounded-2xl p-3 flex-1 shadow-sm">
                              <div className="flex items-center justify-between gap-2">
                                <button
                                  type="button"
                                  onClick={() => onViewProfile?.(comment.author)}
                                  className="truncate rounded text-left text-[10px] font-bold text-slate-950 hover:text-indigo-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                >
                                  {comment.author.name}
                                </button>
                                <div className="flex shrink-0 items-center gap-2">
                                  <span className="text-[9px] text-slate-400 font-mono">
                                    {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  {String(comment.author.id || comment.author._id) ===
                                    String(currentUser.id || currentUser._id) && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingComment({ postId: post.id, commentId: comment.id });
                                          setEditCommentText(comment.text);
                                          setCommentActionError('');
                                        }}
                                        className="rounded p-1 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"
                                        aria-label="Edit your comment"
                                        title="Edit comment"
                                      >
                                        <Pencil size={12} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveComment(post.id, comment.id)}
                                        className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                                        aria-label="Delete your comment"
                                        title="Delete comment"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                              {editingComment?.commentId === comment.id ? (
                                <div className="mt-2 space-y-2">
                                  <textarea
                                    value={editCommentText}
                                    onChange={(event) => setEditCommentText(event.target.value)}
                                    rows={2}
                                    maxLength={1000}
                                    aria-label="Edit comment text"
                                    className="w-full resize-y rounded-lg border border-slate-200 px-2.5 py-2 text-xs text-slate-700 focus:border-indigo-400 focus:outline-none"
                                  />
                                  <div className="flex justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingComment(null);
                                        setEditCommentText('');
                                        setCommentActionError('');
                                      }}
                                      className="rounded-lg px-2.5 py-1 text-[10px] font-semibold text-slate-500 hover:bg-slate-100"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleSaveComment(post.id, comment.id)}
                                      className="rounded-lg bg-indigo-600 px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-indigo-700"
                                    >
                                      Save
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-[10px] text-slate-600 leading-normal mt-0.5 whitespace-pre-wrap">
                                  {comment.text}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {commentActionError && (
                      <p role="alert" className="text-xs font-medium text-rose-600">
                        {commentActionError}
                      </p>
                    )}

                    <div className="flex gap-2 items-center">
                      <img
                        src={currentUser.avatarUrl || null}
                        alt={currentUser.name || 'User Avatar'}
                        className="w-7 h-7 rounded-full object-cover border border-slate-100 shrink-0"
                      />
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        value={commentInputs[post.id] || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCommentInputs((prev) => ({ ...prev, [post.id]: val }));
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handlePostComment(post.id);
                        }}
                        className="flex-1 text-[11px] px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 placeholder-slate-400 shadow-inner"
                      />
                      <button
                        onClick={() => handlePostComment(post.id)}
                        className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                      >
                        <Send size={11} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-white border border-slate-200 rounded-3xl">
            <p className="text-xs text-slate-400 font-medium">No posts matched your query. Broadcast something!</p>
          </div>
        )}
      </div>
    </div>
  );
}