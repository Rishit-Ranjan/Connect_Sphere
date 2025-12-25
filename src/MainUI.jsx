import React, { useState, useMemo } from 'react';
import { Home, Megaphone, Folder, FileText, Trash2, MessageSquare, Users, User, LogOut, Moon, Sun, ShieldCheck, Search, ChevronLeft, ChevronRight, Heart, Send } from 'lucide-react'; // Assuming lucide-react for icons

// NOTE: These are placeholder components. You should replace them with your actual Post, PostForm, etc. components.
const Post = ({ post, currentUser, onDeletePost, onToggleLike, onAddComment }) => (
    <div className={`p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 mb-6 border ${post.isAnnouncement ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'}`}>
        <div className="flex justify-between items-start mb-4">
            <div className="flex items-center">
                <img src={post.author.avatar} alt={post.author.name} className="w-12 h-12 rounded-full mr-4 object-cover border-2 border-white dark:border-gray-700 shadow-sm" />
                <div>
                    <p className="font-bold text-gray-900 dark:text-gray-100 flex items-center text-lg">
                        {post.author.name}
                        {post.author.role === 'admin' && <ShieldCheck className="w-5 h-5 ml-1.5 text-blue-500" aria-label="Admin Badge" />}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{post.timestamp}</p>
                </div>
            </div>
            {post.isAnnouncement && (
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full dark:bg-blue-900 dark:text-blue-300 flex items-center border border-blue-200 dark:border-blue-800 shadow-sm">
                    <Megaphone className="w-3 h-3 mr-1.5" />
                    ANNOUNCEMENT
                </span>
            )}
        </div>
        <p className="text-gray-800 dark:text-gray-300 mb-4 leading-relaxed text-base whitespace-pre-wrap">{post.content}</p>
        {post.imageUrl && (
            <div className="mb-4 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700">
                <img src={post.imageUrl} alt="Post content" className="w-full h-auto object-cover max-h-[500px]" />
            </div>
        )}
        {/* Placeholder for likes, comments, delete button */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex space-x-6">
                <button onClick={() => onToggleLike(post.id)} className={`flex items-center space-x-2 text-sm font-medium transition-colors ${post.likedBy.includes(currentUser.id) ? 'text-red-500' : 'text-gray-500 dark:text-gray-400 hover:text-red-500'}`}>
                    <Heart className={`w-5 h-5 ${post.likedBy.includes(currentUser.id) ? 'fill-current' : ''}`} />
                    <span>{post.likedBy.length > 0 ? post.likedBy.length : 'Like'}</span>
                </button>
                <button className="flex items-center space-x-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors">
                    <MessageSquare className="w-5 h-5" />
                    <span>{post.comments.length > 0 ? `${post.comments.length} Comments` : 'Comment'}</span>
                </button>
            </div>
            {(currentUser.id === post.author.id || currentUser.role === 'admin') && (
                <button onClick={() => onDeletePost(post.id)} className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20" title="Delete Post">
                    <Trash2 size={18} />
                </button>
            )}
        </div>
    </div>
);

const PostForm = ({ onAddPost, currentUser }) => {
    const [content, setContent] = useState('');
    const [isAnnouncement, setIsAnnouncement] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!content.trim()) return;
        onAddPost({ content, isAnnouncement });
        setContent('');
        setIsAnnouncement(false);
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
            <form onSubmit={handleSubmit}>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full p-4 border-0 rounded-xl bg-gray-50 dark:bg-gray-700/50 dark:text-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-gray-700 transition-all resize-none text-base"
                    placeholder={`What's on your mind, ${currentUser.name}?`}
                    rows="3"
                />
                <div className="flex justify-between items-center mt-4 pt-2">
                    <div>
                        {currentUser.role === 'admin' && (
                            <label className="flex items-center space-x-2 cursor-pointer text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={isAnnouncement}
                                    onChange={(e) => setIsAnnouncement(e.target.checked)}
                                    className="rounded"
                                />
                                <span>Mark as Announcement</span>
                            </label>
                        )}
                    </div>
                    <button type="submit" disabled={!content.trim()} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm hover:shadow transition-all flex items-center">
                        <Send className="w-4 h-4 mr-2" />
                        Post
                    </button>
                </div>
            </form>
        </div>
    );
};

const ResourceItem = ({ resource, currentUser, onDeleteResource }) => (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-4 flex justify-between items-center hover:shadow-md transition-shadow">
        <div className="flex items-center">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mr-4">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
                <a href={resource.fileUrl} download={resource.fileName} className="font-bold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-lg">
                    {resource.fileName}
                </a>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Uploaded by {resource.author.name} &bull; {new Date(resource.id).toLocaleDateString()}
                </p>
            </div>
        </div>
        {(currentUser.id === resource.author.id || currentUser.role === 'admin') && (
            <button onClick={() => onDeleteResource(resource)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20">
                <Trash2 size={18} />
            </button>
        )}
    </div>
);

const UserItem = ({ user, currentUser, onDeleteUser, onToggleUserStatus }) => (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-4 flex justify-between items-center hover:shadow-md transition-all">
        <div className="flex items-center">
            <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full mr-4 object-cover border-2 border-gray-100 dark:border-gray-700" />
            <div>
                <p className="font-bold text-gray-900 dark:text-gray-100 text-lg">{user.name} {user.id === currentUser.id && <span className="text-sm font-normal text-gray-500 ml-2">(You)</span>}</p>
                <div className="flex items-center mt-1 space-x-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium uppercase ${user.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>{user.role}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium uppercase ${user.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>{user.status}</span>
                </div>
            </div>
        </div>
        {currentUser.role === 'admin' && user.id !== currentUser.id && (
            <div className="flex items-center space-x-2">
                <button onClick={() => onToggleUserStatus(user.id)} className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors shadow-sm ${user.status === 'active' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800' : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'}`}>
                    {user.status === 'active' ? 'Suspend' : 'Activate'}
                </button>
                <button onClick={() => onDeleteUser(user.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors" title="Delete User">
                    <Trash2 size={18} />
                </button>
            </div>
        )}
    </div>
);

const MainUI = ({
    currentUser,
    users,
    posts,
    resources, // New prop
    onAddPost,
    onDeletePost,
    onDeleteResource, // New prop
    onDeleteUser,
    onToggleUserStatus,
    onToggleLike,
    onAddComment,
    onLogout,
    theme,
    onToggleTheme
    // ... other props
}) => {
    const [activeTab, setActiveTab] = useState('feed'); // 'feed', 'notices', 'resources'
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
                    <div>
                        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Notices & Announcements</h2>
                        {announcements.length > 0 ? (
                            announcements.map(post => <Post key={post.id} post={post} currentUser={currentUser} onDeletePost={onDeletePost} onToggleLike={onToggleLike} onAddComment={onAddComment} />)
                        ) : (
                            <p className="text-center text-gray-500 dark:text-gray-400 mt-8">No announcements right now.</p>
                        )}
                    </div>
                );
            case 'resources':
                return (
                    <div>
                        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Resource Hub</h2>
                        {/* A form to upload resources could go here */}
                        {sortedResources.length > 0 ? (
                            sortedResources.map(resource => <ResourceItem key={resource.id} resource={resource} currentUser={currentUser} onDeleteResource={onDeleteResource} />)
                        ) : (
                            <p className="text-center text-gray-500 dark:text-gray-400 mt-8">No resources have been uploaded yet.</p>
                        )}
                    </div>
                );
            case 'users':
                return (
                    <div>
                        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">User Directory</h2>
                        
                        {/* Search Bar */}
                        <div className="relative mb-6">
                            <input
                                type="text"
                                placeholder="Search users by name or email..."
                                value={userSearchTerm}
                                onChange={(e) => { setUserSearchTerm(e.target.value); setUserPage(1); }}
                                className="w-full p-4 pl-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none shadow-sm transition-all"
                            />
                            <Search className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
                        </div>

                        {paginatedUsers.length > 0 ? (
                            paginatedUsers.map(user => <UserItem key={user.id} user={user} currentUser={currentUser} onDeleteUser={onDeleteUser} onToggleUserStatus={onToggleUserStatus} />)
                        ) : (
                            <p className="text-center text-gray-500 dark:text-gray-400 mt-8">No users found matching "{userSearchTerm}".</p>
                        )}

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center mt-6 space-x-4">
                                <button onClick={() => setUserPage(p => Math.max(1, p - 1))} disabled={userPage === 1} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <span className="text-gray-600 dark:text-gray-400">Page {userPage} of {totalPages}</span>
                                <button onClick={() => setUserPage(p => Math.min(totalPages, p + 1))} disabled={userPage === totalPages} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>
                );
            case 'feed':
            default:
                return (
                    <div>
                        <PostForm onAddPost={onAddPost} currentUser={currentUser} />
                        {regularPosts.map(post => <Post key={post.id} post={post} currentUser={currentUser} onDeletePost={onDeletePost} onToggleLike={onToggleLike} onAddComment={onAddComment} />)}
                    </div>
                );
        }
    };

    const TabButton = ({ tabName, icon: Icon, label }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`flex items-center w-full text-left px-4 py-3 rounded-xl transition-all duration-200 mb-1 ${activeTab === tabName ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400 font-medium'}`}
        >
            <Icon className="w-5 h-5 mr-3" />
            <span className="font-medium">{label}</span>
        </button>
    );

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
            {/* Left Sidebar */}
            <aside className="w-72 bg-white dark:bg-gray-800 p-6 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-sm z-10">
                <div className="flex items-center mb-10 px-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg mr-3 flex items-center justify-center">
                        <span className="text-white font-bold text-xl">C</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">ConnectSphere</h1>
                </div>
                <nav className="flex flex-col space-y-2">
                    <TabButton tabName="feed" icon={Home} label="Feed" />
                    <TabButton tabName="notices" icon={Megaphone} label="Notices" />
                    <TabButton tabName="resources" icon={Folder} label="Resources" />
                    <TabButton tabName="messages" icon={MessageSquare} label="Messages" />
                    <TabButton tabName="users" icon={Users} label="Users" />
                </nav>
                <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 mb-4">
                        <img src={currentUser.avatar} alt={currentUser.name} className="w-10 h-10 rounded-full mr-3 border border-gray-200 dark:border-gray-600" />
                        <div className="overflow-hidden">
                            <p className="font-bold text-sm truncate">{currentUser.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{currentUser.email}</p>
                        </div>
                    </div>
                    <button onClick={onToggleTheme} className="w-full flex items-center px-4 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors text-sm font-medium">
                        {theme === 'light' ? <Moon className="w-5 h-5 mr-3" /> : <Sun className="w-5 h-5 mr-3" />}
                        <span>Toggle Theme</span>
                    </button>
                    <button onClick={onLogout} className="w-full flex items-center mt-1 px-4 py-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors text-sm font-medium">
                        <LogOut className="w-5 h-5 mr-3" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                <div className="max-w-4xl mx-auto">
                {renderContent()}
                </div>
            </main>

            {/* Right Panel (for chats, etc. - kept simple) */}
            <aside className="w-80 bg-white dark:bg-gray-800 p-6 border-l border-gray-200 dark:border-gray-700 hidden xl:block">
                <h2 className="font-bold text-lg">Online Users</h2>
                {/* Placeholder for online users list */}
            </aside>
        </div>
    );
};

export default MainUI;
