import React, { useState } from 'react';
import { TrashIcon, HeartIcon, CommentIcon, PaperclipIcon, SendIcon, SpinnerIcon } from '../Icons';
import UserAvatar from './UserAvatar';

const PostCard = ({ post, currentUser, onDeletePost, onViewProfile, onToggleLike, onAddComment }) => {
    const [showComments, setShowComments] = useState(false);
    const [comment, setComment] = useState('');
    const [isLiking, setIsLiking] = useState(false);
    const [isCommenting, setIsCommenting] = useState(false);
    const hasLiked = post.likedBy.includes(currentUser.id);

    const handleToggleLike = async () => {
        if (isLiking) return;
        setIsLiking(true);
        try {
            await onToggleLike(post.id);
        } finally {
            setIsLiking(false);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (comment.trim() && !isCommenting) {
            setIsCommenting(true);
            try {
                await onAddComment(post.id, comment);
                setComment('');
            } finally {
                setIsCommenting(false);
            }
        }
    };

    return (
        <div className="bg-white/80 dark:bg-secondary/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 overflow-hidden transition-all hover:shadow-2xl hover:bg-white/90 dark:hover:bg-secondary/90">
            <div className="p-5">
                <div className="flex items-start justify-between">
                    <button onClick={() => onViewProfile(post.author)} className="flex items-center space-x-3 group">
                        <div className="ring-2 ring-transparent group-hover:ring-primary/50 rounded-full transition-all">
                            <UserAvatar user={post.author} />
                        </div>
                        <div>
                            <p className="font-bold text-gray-800 dark:text-white group-hover:text-primary transition-colors text-left">{post.author.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{post.timestamp}</p>
                        </div>
                    </button>
                    {(currentUser.role === 'admin' || currentUser.id === post.author.id) && (
                        <button onClick={() => onDeletePost(post.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all">
                            <TrashIcon className="h-5 w-5" />
                        </button>
                    )}
                </div>

                <p className="my-4 text-gray-700 dark:text-gray-200 leading-relaxed text-[15px]">{post.content}</p>
            </div>

            {post.fileName && post.fileUrl && (
                <div className="px-5 pb-4">
                    <a href={post.fileUrl} download={post.fileName} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group">
                        <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                            <PaperclipIcon className="h-5 w-5 text-primary flex-shrink-0" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{post.fileName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Click to download</p>
                        </div>
                    </a>
                </div>
            )}

            {post.imageUrl && (
                <div className="w-full bg-gray-100 dark:bg-gray-800">
                    <img src={post.imageUrl} alt="Post content" className="w-full object-cover max-h-[500px]" />
                </div>
            )}

            <div className="flex justify-between items-center px-5 py-3 text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30">
                <div className="flex space-x-6">
                    <button onClick={handleToggleLike} disabled={isLiking} className={`flex items-center space-x-2 transition-all group disabled:opacity-50 disabled:cursor-not-allowed ${hasLiked ? 'text-red-500' : 'hover:text-red-500'}`}>
                        <div className={`p-1.5 rounded-full transition-colors ${hasLiked ? 'bg-red-50 dark:bg-red-900/20' : 'group-hover:bg-red-50 dark:group-hover:bg-red-900/20'}`}>
                            <HeartIcon className={`w-5 h-5 ${hasLiked ? 'fill-current' : 'fill-none stroke-current'}`} />
                        </div>
                        <span className="font-medium text-sm">{post.likedBy.length}</span>
                    </button>
                    <button onClick={() => setShowComments(!showComments)} className="flex items-center space-x-2 hover:text-primary transition-all group">
                        <div className="p-1.5 rounded-full group-hover:bg-primary/10 transition-colors">
                            <CommentIcon className="w-5 h-5" />
                        </div>
                        <span className="font-medium text-sm">{post.comments.length}</span>
                    </button>
                </div>
                <button className="flex items-center space-x-2 hover:text-primary transition-all group">
                    <div className="p-1.5 rounded-full group-hover:bg-primary/10 transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"></path></svg>
                    </div>
                    <span className="text-sm font-medium">Share</span>
                </button>
            </div>

            {showComments && (
                <div className="p-5 border-t border-gray-100 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/50 backdrop-blur-sm">
                    <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {post.comments.map(c => (
                            <div key={c.id} className="flex items-start space-x-3 group animate-fade-in">
                                <button onClick={() => onViewProfile(c.author)} className="flex-shrink-0">
                                    <UserAvatar user={c.author} className="h-8 w-8 ring-2 ring-white dark:ring-gray-700" />
                                </button>
                                <div className="flex-1 bg-white dark:bg-gray-700 rounded-2xl rounded-tl-none p-3 shadow-sm border border-gray-100 dark:border-gray-600">
                                    <p className="text-xs font-bold text-gray-800 dark:text-white mb-1">{c.author.name}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{c.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <form onSubmit={handleCommentSubmit} className="mt-4 flex items-center space-x-3">
                        <UserAvatar user={currentUser} className="h-8 w-8 flex-shrink-0" />
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Write a comment..."
                                className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-full focus:outline-none transition-all shadow-sm disabled:opacity-50 placeholder:text-gray-400"
                                disabled={isCommenting}
                            />
                            <button
                                type="submit"
                                className="absolute right-1.5 top-1.5 p-1.5 rounded-full bg-primary text-white hover:bg-indigo-600 disabled:opacity-50 disabled:hover:bg-primary transition-all shadow-md hover:shadow-lg transform active:scale-95"
                                disabled={!comment.trim() || isCommenting}
                            >
                                {isCommenting ? <SpinnerIcon className="animate-spin h-4 w-4" /> : <SendIcon className="h-4 w-4" />}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default PostCard;
