import React, { useState, useMemo } from 'react';
import { Home, Megaphone, Folder, FileText, Trash2, MessageSquare, Users, User, LogOut, Moon, Sun, ShieldCheck, Search, ChevronLeft, ChevronRight, Heart, Send, Settings, Loader2, Sparkles, Clock, TrendingUp } from 'lucide-react';

// Enhanced Post Component using custom color scheme
const Post = ({ post, currentUser, onDeletePost, onToggleLike, onAddComment }) => (
    <div className={`group p-6 rounded-xl transition-all duration-300 mb-6 border hover:scale-[1.01] ${
        post.isAnnouncement 
            ? 'bg-gradient-to-br from-dark-alt/40 to-primary/20 border-primary/40 shadow-glass-sm hover:shadow-glass' 
            : 'bg-secondary/60 border-secondary/50 hover:border-primary/40 shadow-md hover:shadow-lg'
    }`}>
        <div className="flex justify-between items-start mb-4">
            <div className="flex items-center">
                <div className="relative group-hover:scale-105 transition-transform duration-300">
                    <img 
                        src={post.author.avatar} 
                        alt={post.author.name} 
                        className="w-12 h-12 rounded-full mr-4 object-cover border-2 border-secondary shadow-lg" 
                    />
                    <div className="absolute -bottom-1 -right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-dark"></div>
                </div>
                <div>
                    <p className="font-bold text-light flex items-center text-base">
                        {post.author.name}
                        {post.author.role === 'admin' && (
                            <span className="ml-2 flex items-center bg-primary/20 px-2 py-0.5 rounded-full border border-primary/30">
                                <ShieldCheck className="w-3.5 h-3.5 text-primary" aria-label="Admin Badge" />
                                <span className="text-xs font-bold text-primary ml-1">ADMIN</span>
                            </span>
                        )}
                    </p>
                    <p className="text-xs text-slate-400 font-medium flex items-center mt-0.5">
                        <Clock className="w-3 h-3 mr-1" />
                        {post.timestamp}
                    </p>
                </div>
            </div>
            {post.isAnnouncement && (
                <span className="bg-gradient-to-r from-primary to-accent text-white text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-lg animate-pulse-slow">
                    <Megaphone className="w-3 h-3 mr-1.5" />
                    ANNOUNCEMENT
                </span>
            )}
        </div>
        
        <p className="text-slate-200 mb-4 leading-relaxed text-sm whitespace-pre-wrap">{post.content}</p>
        
        {post.imageUrl && (
            <div className="mb-4 rounded-lg overflow-hidden shadow-lg border border-secondary">
                <img src={post.imageUrl} alt="Post content" className="w-full h-auto object-cover max-h-[500px]" />
            </div>
        )}
        
        <div className="flex justify-between items-center pt-4 border-t border-secondary/50">
            <div className="flex space-x-6">
                <button 
                    onClick={() => onToggleLike(post.id)} 
                    className={`flex items-center space-x-2 text-xs font-semibold transition-all active:scale-95 px-3 py-1.5 rounded-lg ${
                        post.likedBy.includes(currentUser.id) 
                            ? 'text-red-400 bg-red-500/10' 
                            : 'text-slate-400 hover:text-red-400 hover:bg-red-500/10'
                    }`}
                >
                    <Heart className={`w-4 h-4 ${post.likedBy.includes(currentUser.id) ? 'fill-current' : ''}`} />
                    <span>{post.likedBy.length > 0 ? post.likedBy.length : 'Like'}</span>
                </button>
                <button className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-primary hover:bg-primary/10 transition-all active:scale-95 px-3 py-1.5 rounded-lg">
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.comments.length > 0 ? `${post.comments.length}` : 'Comment'}</span>
                </button>
            </div>
            {(currentUser.id === post.author.id || currentUser.role === 'admin') && (
                <button 
                    onClick={() => onDeletePost(post.id)} 
                    className="text-slate-500 hover:text-red-400 transition-all active:scale-95 p-2 rounded-lg hover:bg-red-500/10 opacity-0 group-hover:opacity-100" 
                    title="Delete Post"
                >
                    <Trash2 size={16} />
                </button>
            )}
        </div>
    </div>
);

// Enhanced PostForm using custom color scheme
const PostForm = ({ onAddPost, currentUser }) => {
    const [content, setContent] = useState('');
    const [isAnnouncement, setIsAnnouncement] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim() || isSubmitting) return;
        
        setIsSubmitting(true);
        try {
            await onAddPost({ content, isAnnouncement });
            setContent('');
            setIsAnnouncement(false);
        } catch (error) {
            console.error("Error creating post:", error);
            alert("Failed to create post. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`bg-secondary/60 p-6 rounded-xl border mb-8 transition-all duration-300 ${
            isFocused 
                ? 'border-primary/50 shadow-glass' 
                : 'border-secondary/50 shadow-md hover:border-primary/30'
        }`}>
            <div className="flex items-center mb-4">
                <img 
                    src={currentUser.avatar} 
                    alt={currentUser.name} 
                    className="w-10 h-10 rounded-full mr-3 object-cover border-2 border-secondary shadow-md" 
                />
                <span className="text-sm font-medium text-slate-400">
                    What's on your mind, {currentUser.name}?
                </span>
            </div>
            
            <form onSubmit={handleSubmit}>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="w-full p-4 border border-secondary rounded-lg bg-dark/50 text-slate-200 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all resize-none text-sm placeholder:text-slate-500"
                    placeholder="Share your thoughts..."
                    rows="3"
                />
                <div className="flex justify-between items-center mt-4">
                    <div>
                        {currentUser.role === 'admin' && (
                            <label className="flex items-center space-x-2 cursor-pointer text-xs font-medium text-slate-400 hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-primary/10">
                                <input
                                    type="checkbox"
                                    checked={isAnnouncement}
                                    onChange={(e) => setIsAnnouncement(e.target.checked)}
                                    className="rounded border-secondary text-primary focus:ring-2 focus:ring-primary"
                                />
                                <Megaphone className="w-4 h-4" />
                                <span>Mark as Announcement</span>
                            </label>
                        )}
                    </div>
                    <button 
                        type="submit" 
                        disabled={!content.trim() || isSubmitting} 
                        className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all active:scale-95 flex items-center text-sm"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Posting...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4 mr-2" />
                                Post
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

// Enhanced ResourceItem
const ResourceItem = ({ resource, currentUser, onDeleteResource }) => (
    <div className="group bg-secondary/60 p-4 rounded-xl shadow-md border border-secondary/50 mb-4 flex justify-between items-center hover:shadow-lg hover:scale-[1.01] hover:border-primary/40 transition-all duration-300">
        <div className="flex items-center">
            <div className="p-3 bg-primary/10 rounded-lg mr-4 group-hover:bg-primary/20 transition-colors border border-primary/20">
                <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
                <a 
                    href={resource.fileUrl} 
                    download={resource.fileName} 
                    className="font-semibold text-slate-200 hover:text-primary transition-colors text-sm flex items-center"
                >
                    {resource.fileName}
                    <TrendingUp className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
                <p className="text-xs text-slate-500 mt-1">
                    Uploaded by <span className="font-medium text-slate-400">{resource.author.name}</span> • {new Date(resource.id).toLocaleDateString()}
                </p>
            </div>
        </div>
        {(currentUser.id === resource.author.id || currentUser.role === 'admin') && (
            <button 
                onClick={() => onDeleteResource(resource)} 
                className="text-slate-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-all active:scale-95 opacity-0 group-hover:opacity-100"
            >
                <Trash2 size={16} />
            </button>
        )}
    </div>
);

// Enhanced UserItem
const UserItem = ({ user, currentUser, onDeleteUser, onToggleUserStatus }) => (
    <div className="group bg-secondary/60 p-4 rounded-xl shadow-md border border-secondary/50 mb-4 flex justify-between items-center hover:shadow-lg hover:scale-[1.01] hover:border-primary/40 transition-all duration-300">
        <div className="flex items-center">
            <div className="relative group-hover:scale-105 transition-transform duration-300">
                <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-12 h-12 rounded-full mr-4 object-cover border-2 border-secondary shadow-lg" 
                />
                <div className={`absolute -bottom-1 -right-2 w-3 h-3 ${user.status === 'active' ? 'bg-green-500' : 'bg-gray-500'} rounded-full border-2 border-dark`}></div>
            </div>
            <div>
                <p className="font-semibold text-slate-200 text-sm">
                    {user.name} 
                    {user.id === currentUser.id && (
                        <span className="text-xs font-normal text-primary ml-2 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">(You)</span>
                    )}
                </p>
                <div className="flex items-center mt-1 space-x-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold uppercase ${
                        user.role === 'admin' 
                            ? 'bg-primary/20 text-primary border border-primary/30' 
                            : 'bg-secondary text-slate-400'
                    }`}>
                        {user.role}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold uppercase ${
                        user.status === 'active' 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                        {user.status}
                    </span>
                </div>
            </div>
        </div>
        {currentUser.role === 'admin' && user.id !== currentUser.id && (
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button 
                    onClick={() => onToggleUserStatus(user.id)} 
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
                        user.status === 'active' 
                            ? 'bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30' 
                            : 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                    }`}
                >
                    {user.status === 'active' ? 'Suspend' : 'Activate'}
                </button>
                <button 
                    onClick={() => onDeleteUser(user.id)} 
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all active:scale-95" 
                    title="Delete User"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        )}
    </div>
);

const MainUI = ({
    currentUser,
    users,
    posts,
    resources,
    onAddPost,
    onDeletePost,
    onDeleteResource,
    onDeleteUser,
    onToggleUserStatus,
    onToggleLike,
    onAddComment,
    onLogout,
    theme,
    onToggleTheme,
    onOpenSettingsModal
}) => {
    const [activeTab, setActiveTab] = useState('feed');
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [userPage, setUserPage] = useState(1);
    const usersPerPage = 10;

    const { announcements, regularPosts } = useMemo(() => {
        const announcements = posts.filter(p => p.isAnnouncement).sort((a, b) => b.id - a.id);
        const regularPosts = posts.filter(p => !p.isAnnouncement).sort((a, b) => b.id - a.id);
        return { announcements, regularPosts };
    }, [posts]);

    const sortedResources = useMemo(() => {
        return [...resources].sort((a, b) => b.id - a.id);
    }, [resources]);

    const { paginatedUsers, totalPages } = useMemo(() => {
        if (!users) return { paginatedUsers: [], totalPages: 0 };
        
        const filtered = users.filter(user => 
            user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
            (user.email && user.email.toLowerCase().includes(userSearchTerm.toLowerCase()))
        );
        
        const total = Math.ceil(filtered.length / usersPerPage);
        const paginated = filtered.slice((userPage - 1) * usersPerPage, userPage * usersPerPage);
        return { paginatedUsers: paginated, totalPages: total };
    }, [users, userSearchTerm, userPage]);

    const renderContent = () => {
        switch (activeTab) {
            case 'notices':
                return (
                    <div className="animate-fade-in">
                        <div className="flex items-center mb-6">
                            <div className="p-2.5 bg-primary/20 rounded-lg mr-3 border border-primary/30">
                                <Megaphone className="w-5 h-5 text-primary" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-200">
                                Notices & Announcements
                            </h2>
                        </div>
                        {announcements.length > 0 ? (
                            announcements.map(post => <Post key={post.id} post={post} currentUser={currentUser} onDeletePost={onDeletePost} onToggleLike={onToggleLike} onAddComment={onAddComment} />)
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center bg-secondary/40 rounded-xl border border-dashed border-secondary">
                                <div className="bg-primary/10 p-5 rounded-xl mb-4 border border-primary/20">
                                    <Megaphone className="w-10 h-10 text-primary" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-300 mb-1">No announcements yet</h3>
                                <p className="text-slate-500 max-w-xs text-sm">Stay tuned! Important updates will appear here.</p>
                            </div>
                        )}
                    </div>
                );
            case 'resources':
                return (
                    <div className="animate-fade-in">
                        <div className="flex items-center mb-6">
                            <div className="p-2.5 bg-accent/20 rounded-lg mr-3 border border-accent/30">
                                <Folder className="w-5 h-5 text-accent" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-200">
                                Resource Hub
                            </h2>
                        </div>
                        {sortedResources.length > 0 ? (
                            sortedResources.map(resource => <ResourceItem key={resource.id} resource={resource} currentUser={currentUser} onDeleteResource={onDeleteResource} />)
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center bg-secondary/40 rounded-xl border border-dashed border-secondary">
                                <div className="bg-accent/10 p-5 rounded-xl mb-4 border border-accent/20">
                                    <Folder className="w-10 h-10 text-accent" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-300 mb-1">Resource Hub is empty</h3>
                                <p className="text-slate-500 max-w-xs text-sm">Share documents and files with your team.</p>
                            </div>
                        )}
                    </div>
                );
            case 'users':
                return (
                    <div className="animate-fade-in">
                        <div className="flex items-center mb-6">
                            <div className="p-2.5 bg-primary/20 rounded-lg mr-3 border border-primary/30">
                                <Users className="w-5 h-5 text-primary" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-200">
                                User Directory
                            </h2>
                        </div>
                        
                        {/* Search Bar */}
                        <div className="relative mb-6">
                            <input
                                type="text"
                                placeholder="Search users by name or email..."
                                value={userSearchTerm}
                                onChange={(e) => { setUserSearchTerm(e.target.value); setUserPage(1); }}
                                className="w-full p-4 pl-12 rounded-lg border border-secondary bg-secondary/60 text-slate-200 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all text-sm placeholder:text-slate-500"
                            />
                            <Search className="absolute left-4 top-4 text-slate-500 w-5 h-5" />
                        </div>

                        {paginatedUsers.length > 0 ? (
                            paginatedUsers.map(user => <UserItem key={user.id} user={user} currentUser={currentUser} onDeleteUser={onDeleteUser} onToggleUserStatus={onToggleUserStatus} />)
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center bg-secondary/40 rounded-xl border border-dashed border-secondary">
                                <div className="bg-secondary/50 p-5 rounded-xl mb-4">
                                    <Search className="w-10 h-10 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-300 mb-1">No users found</h3>
                                <p className="text-slate-500 text-sm mb-3">No matches for "<span className="font-semibold">{userSearchTerm}</span>"</p>
                                <button 
                                    onClick={() => setUserSearchTerm('')} 
                                    className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-all active:scale-95 text-sm"
                                >
                                    Clear search
                                </button>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center mt-6 space-x-4 bg-secondary/60 p-3 rounded-lg border border-secondary/50">
                                <button 
                                    onClick={() => setUserPage(p => Math.max(1, p - 1))} 
                                    disabled={userPage === 1} 
                                    className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 border border-primary/20"
                                >
                                    <ChevronLeft className="w-4 h-4 text-primary" />
                                </button>
                                <span className="text-slate-400 font-medium text-sm px-3">
                                    Page <span className="text-primary font-bold">{userPage}</span> of {totalPages}
                                </span>
                                <button 
                                    onClick={() => setUserPage(p => Math.min(totalPages, p + 1))} 
                                    disabled={userPage === totalPages} 
                                    className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 border border-primary/20"
                                >
                                    <ChevronRight className="w-4 h-4 text-primary" />
                                </button>
                            </div>
                        )}
                    </div>
                );
            case 'feed':
            default:
                return (
                    <div className="animate-fade-in">
                        <PostForm onAddPost={onAddPost} currentUser={currentUser} />
                        {regularPosts.length > 0 ? (
                            regularPosts.map(post => <Post key={post.id} post={post} currentUser={currentUser} onDeletePost={onDeletePost} onToggleLike={onToggleLike} onAddComment={onAddComment} />)
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center bg-secondary/40 rounded-xl border border-dashed border-secondary">
                                <div className="bg-primary/10 p-5 rounded-xl mb-4 border border-primary/20">
                                    <MessageSquare className="w-10 h-10 text-primary" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-300 mb-1">No posts yet</h3>
                                <p className="text-slate-500 max-w-xs text-sm">Be the first to share something!</p>
                            </div>
                        )}
                    </div>
                );
        }
    };

    const TabButton = ({ tabName, icon: Icon, label }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`flex items-center w-full text-left px-4 py-3 rounded-lg transition-all duration-200 mb-1 active:scale-95 ${
                activeTab === tabName 
                    ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                    : 'hover:bg-secondary/50 text-slate-400 font-medium hover:text-slate-300'
            }`}
        >
            <Icon className="w-5 h-5 mr-3" />
            <span className="font-semibold text-sm">{label}</span>
        </button>
    );

    return (
        <div className="flex h-screen bg-dark text-slate-100 font-sans overflow-hidden">
            {/* Left Sidebar */}
            <aside className="w-72 bg-dark-alt p-6 border-r border-secondary/50 flex flex-col">
                <div className="flex items-center mb-10 px-2">
                    <div className="w-8 h-8 bg-primary rounded-lg mr-3 flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-lg">C</span>
                    </div>
                    <h1 className="text-xl font-bold text-slate-200 tracking-tight">ConnectSphere</h1>
                </div>
                
                <nav className="flex flex-col space-y-1">
                    <TabButton tabName="feed" icon={Home} label="Home" />
                    <TabButton tabName="notices" icon={Megaphone} label="Notices" />
                    <TabButton tabName="resources" icon={Folder} label="Resources" />
                    <TabButton tabName="messages" icon={MessageSquare} label="Messages" />
                    <TabButton tabName="users" icon={Users} label="Users" />
                </nav>
                
                <div className="mt-auto pt-6 border-t border-secondary/50">
                    <div className="flex items-center p-3 rounded-lg bg-secondary/40 mb-4 border border-secondary/50 hover:bg-secondary/60 transition-all cursor-pointer">
                        <img 
                            src={currentUser.avatar} 
                            alt={currentUser.name} 
                            className="w-10 h-10 rounded-full mr-3 border border-secondary object-cover" 
                        />
                        <div className="overflow-hidden">
                            <p className="font-semibold text-sm truncate text-slate-200">{currentUser.name}</p>
                            <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={onOpenSettingsModal} 
                        className="w-full flex items-center px-4 py-2.5 rounded-lg hover:bg-secondary/40 text-slate-400 transition-all active:scale-95 text-sm font-medium mb-1"
                    >
                        <Settings className="w-5 h-5 mr-3" />
                        <span>Settings</span>
                    </button>
                    
                    <button 
                        onClick={onToggleTheme} 
                        className="w-full flex items-center px-4 py-2.5 rounded-lg hover:bg-secondary/40 text-slate-400 transition-all active:scale-95 text-sm font-medium mb-1"
                    >
                        {theme === 'light' ? (
                            <>
                                <Moon className="w-5 h-5 mr-3" />
                                <span>Light Mode</span>
                            </>
                        ) : (
                            <>
                                <Sun className="w-5 h-5 mr-3" />
                                <span>Light Mode</span>
                            </>
                        )}
                    </button>
                    
                    <button 
                        onClick={onLogout} 
                        className="w-full flex items-center px-4 py-2.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all active:scale-95 text-sm font-medium"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-secondary scrollbar-track-transparent">
                <div className="max-w-4xl mx-auto" key={activeTab}>
                    {renderContent()}
                </div>
            </main>

            {/* Right Panel */}
            <aside className="w-80 bg-dark-alt p-6 border-l border-secondary/50 hidden xl:block">
                <h2 className="font-bold text-base text-slate-300 mb-4">Online Users</h2>
                <p className="text-slate-500 text-sm">Coming soon...</p>
            </aside>

            {/* Custom CSS */}
            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out;
                }
            `}</style>
        </div>
    );
};

export default MainUI;