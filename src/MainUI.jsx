import React, { useState, useMemo } from 'react';
import { Home, Megaphone, Folder, FileText, Trash2, MessageSquare, Users, User, LogOut, Moon, Sun, ShieldCheck } from 'lucide-react'; // Assuming lucide-react for icons

// NOTE: These are placeholder components. You should replace them with your actual Post, PostForm, etc. components.
const Post = ({ post, currentUser, onDeletePost, onToggleLike, onAddComment }) => (
    <div className={`p-4 rounded-lg shadow mb-4 ${post.isAnnouncement ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-500/50' : 'bg-white dark:bg-gray-800'}`}>
        <div className="flex items-center mb-2">
            <img src={post.author.avatar} alt={post.author.name} className="w-10 h-10 rounded-full mr-3" />
            <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                    {post.author.name}
                    {post.author.role === 'admin' && <ShieldCheck className="w-4 h-4 ml-1 text-blue-500" aria-label="Admin Badge" />}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{post.timestamp}</p>
            </div>
        </div>
        {post.isAnnouncement && (
            <div className="flex items-center text-blue-600 dark:text-blue-400 mb-2">
                <Megaphone className="w-4 h-4 mr-2" />
                <span className="font-bold text-sm">ANNOUNCEMENT</span>
            </div>
        )}
        <p className="text-gray-800 dark:text-gray-300 mb-3">{post.content}</p>
        {post.imageUrl && <img src={post.imageUrl} alt="Post content" className="rounded-lg max-w-full h-auto mb-3" />}
        {/* Placeholder for likes, comments, delete button */}
        <div className="flex justify-between items-center text-gray-500 dark:text-gray-400">
            <button onClick={() => onToggleLike(post.id)} className="hover:text-red-500">
                Like ({post.likedBy.length})
            </button>
            <span>{post.comments.length} comments</span>
            {(currentUser.id === post.author.id || currentUser.role === 'admin') && (
                <button onClick={() => onDeletePost(post.id)} className="text-red-500 hover:text-red-700">
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
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
            <form onSubmit={handleSubmit}>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                    placeholder={`What's on your mind, ${currentUser.name}?`}
                />
                <div className="flex justify-between items-center mt-2">
                    <div>
                        {currentUser.role === 'admin' && (
                            <label className="flex items-center space-x-2 cursor-pointer text-sm text-gray-600 dark:text-gray-400">
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
                    <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                        Post
                    </button>
                </div>
            </form>
        </div>
    );
};

const ResourceItem = ({ resource, currentUser, onDeleteResource }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4 flex justify-between items-center">
        <div className="flex items-center">
            <FileText className="w-6 h-6 mr-4 text-blue-500" />
            <div>
                <a href={resource.fileUrl} download={resource.fileName} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                    {resource.fileName}
                </a>
                <p className="text-sm text-gray-500 dark:text-gray-400">
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
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-3 flex justify-between items-center">
        <div className="flex items-center">
            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full mr-3" />
            <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{user.name} {user.id === currentUser.id && '(You)'}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user.role} • {user.status}</p>
            </div>
        </div>
        {currentUser.role === 'admin' && user.id !== currentUser.id && (
            <div className="flex items-center space-x-2">
                <button onClick={() => onToggleUserStatus(user.id)} className={`px-3 py-1 rounded text-sm font-medium ${user.status === 'active' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}>
                    {user.status === 'active' ? 'Suspend' : 'Activate'}
                </button>
                <button onClick={() => onDeleteUser(user.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full" title="Delete User">
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

    const { announcements, regularPosts } = useMemo(() => {
        const announcements = posts.filter(p => p.isAnnouncement).sort((a, b) => b.id - a.id);
        const regularPosts = posts.filter(p => !p.isAnnouncement).sort((a, b) => b.id - a.id);
        return { announcements, regularPosts };
    }, [posts]);

    const sortedResources = useMemo(() => {
        return [...resources].sort((a, b) => b.id - a.id);
    }, [resources]);

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
                        {users && users.length > 0 ? (
                            users.map(user => <UserItem key={user.id} user={user} currentUser={currentUser} onDeleteUser={onDeleteUser} onToggleUserStatus={onToggleUserStatus} />)
                        ) : (
                            <p className="text-center text-gray-500 dark:text-gray-400 mt-8">No users found.</p>
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
            className={`flex items-center w-full text-left px-4 py-2.5 rounded-lg transition-colors duration-200 ${activeTab === tabName ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
        >
            <Icon className="w-5 h-5 mr-3" />
            <span className="font-medium">{label}</span>
        </button>
    );

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            {/* Left Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-800 p-4 border-r dark:border-gray-700 flex flex-col">
                <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-8">ConnectSphere</h1>
                <nav className="flex flex-col space-y-2">
                    <TabButton tabName="feed" icon={Home} label="Feed" />
                    <TabButton tabName="notices" icon={Megaphone} label="Notices" />
                    <TabButton tabName="resources" icon={Folder} label="Resources" />
                    <TabButton tabName="messages" icon={MessageSquare} label="Messages" />
                    <TabButton tabName="users" icon={Users} label="Users" />
                </nav>
                <div className="mt-auto">
                    <div className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                        <img src={currentUser.avatar} alt={currentUser.name} className="w-10 h-10 rounded-full mr-3" />
                        <span className="font-semibold">{currentUser.name}</span>
                    </div>
                    <button onClick={onToggleTheme} className="w-full flex items-center mt-2 px-4 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
                        {theme === 'light' ? <Moon className="w-5 h-5 mr-3" /> : <Sun className="w-5 h-5 mr-3" />}
                        <span>Toggle Theme</span>
                    </button>
                    <button onClick={onLogout} className="w-full flex items-center mt-2 px-4 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
                        <LogOut className="w-5 h-5 mr-3" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 overflow-y-auto">
                {renderContent()}
            </main>

            {/* Right Panel (for chats, etc. - kept simple) */}
            <aside className="w-80 bg-white dark:bg-gray-800 p-4 border-l dark:border-gray-700">
                <h2 className="font-bold text-lg">Online Users</h2>
                {/* Placeholder for online users list */}
            </aside>
        </div>
    );
};

export default MainUI;
