/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import { INITIAL_USERS, INITIAL_POSTS, INITIAL_NOTICES, INITIAL_RESOURCES, INITIAL_ROOMS, INITIAL_ROOM_MESSAGES, INITIAL_DIRECT_MESSAGES, getSavedState, saveState } from './mockData';
import Sidebar from './components/Sidebar';
import RightSidebar from './components/RightSidebar';
import FeedView from './components/FeedView';
import NoticesView from './components/NoticesView';
import ResourcesView from './components/ResourcesView';
import RoomsView from './components/RoomsView';
import MessagesView from './components/MessagesView';
import AdminDashboard from './components/AdminDashboard';
import LoginView from './components/LoginView';
import ProfileView from './components/ProfileView';
import { useAuth } from "./context/AuthContext";

export default function App() {
    const { currentUser, setCurrentUser, login, logout } = useAuth();
    // Core records lists
    const [users, setUsers] = useState(() => getSavedState('users', INITIAL_USERS));
    const [posts, setPosts] = useState(() => getSavedState('posts', INITIAL_POSTS));
    const [notices, setNotices] = useState(() => getSavedState('notices', INITIAL_NOTICES));
    const [resources, setResources] = useState(() => getSavedState('resources', INITIAL_RESOURCES));
    const [rooms, setRooms] = useState(() => getSavedState('rooms', INITIAL_ROOMS));
    const [roomMessages, setRoomMessages] = useState(() => getSavedState('room_messages', INITIAL_ROOM_MESSAGES));
    const [directMessages, setDirectMessages] = useState(() => getSavedState('direct_messages', INITIAL_DIRECT_MESSAGES));
    // Active view tabs
    const [activeTab, setActiveTab] = useState('feed');
    // Selected direct message recipient
    const [selectedRecipient, setSelectedRecipient] = useState(null);
    // Direct notifications and badges state simulations
    const [unreadCount, setUnreadCount] = useState(0);
    const [noticeCount, setNoticeCount] = useState(0);
    useEffect(() => {
        saveState('users', users);
    }, [users]);
    useEffect(() => {
        saveState('posts', posts);
    }, [posts]);
    useEffect(() => {
        saveState('notices', notices);
    }, [notices]);
    useEffect(() => {
        saveState('resources', resources);
    }, [resources]);
    useEffect(() => {
        saveState('rooms', rooms);
    }, [rooms]);
    useEffect(() => {
        saveState('room_messages', roomMessages);
    }, [roomMessages]);
    useEffect(() => {
        saveState('direct_messages', directMessages);
    }, [directMessages]);
    // Handle Tab Switch (clears counts on visiting matching tabs)
    useEffect(() => {
        if (activeTab === 'messages')
            setUnreadCount(0);
        if (activeTab === 'notices')
            setNoticeCount(0);
    }, [activeTab]);
    // 1. Authentications & Session Actions
    const handleLogin = (user) => {
        login(user);
        setActiveTab('feed');
    };
    const handleLogout = () => {
        logout();
        setSelectedRecipient(null);
    };
    const handleAddUser = (user) => {
        setUsers((prev) => [...prev, user]);
    };
    // 2. Feed Operations
    const handleAddPost = (post) => {
        setPosts((prev) => [post, ...prev]);
    };
    const handleDeletePost = (postId) => {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
    };
    const handleLikePost = (postId) => {
        setPosts((prev) => prev.map((post) => {
            if (post.id === postId) {
                const liked = !post.likedByMe;
                return {
                    ...post,
                    likedByMe: liked,
                    likesCount: liked ? post.likesCount + 1 : Math.max(0, post.likesCount - 1)
                };
            }
            return post;
        }));
    };
    const handleAddComment = (postId, commentText) => {
        if (!currentUser)
            return;
        const newComment = {
            id: `c-${Date.now()}`,
            postId,
            author: currentUser,
            text: commentText,
            createdAt: new Date().toISOString()
        };
        setPosts((prev) => prev.map((post) => {
            if (post.id === postId) {
                return {
                    ...post,
                    comments: [...post.comments, newComment]
                };
            }
            return post;
        }));
    };
    // 3. Notices Board Operations
    const handleAddNotice = (notice) => {
        setNotices((prev) => [notice, ...prev]);
        setNoticeCount((prev) => prev + 1);
    };
    const handleDeleteNotice = (noticeId) => {
        setNotices((prev) => prev.filter((n) => n.id !== noticeId));
    };
    // 4. Shared Resources Operations
    const handleAddResource = (res) => {
        setResources((prev) => [res, ...prev]);
    };
    const handleDeleteResource = (resourceId) => {
        setResources((prev) => prev.filter((r) => r.id !== resourceId));
    };
    const handleIncrementDownloads = (resourceId) => {
        setResources((prev) => prev.map((res) => (res.id === resourceId ? { ...res, downloadCount: res.downloadCount + 1 } : res)));
    };
    // 5. Multi-User Channel/Room Operations
    const handleAddRoomMessage = (roomId, messageText, sender) => {
        const newMsg = {
            id: `rm-${Date.now()}`,
            roomId,
            sender,
            text: messageText,
            createdAt: new Date().toISOString()
        };
        setRoomMessages((prev) => [...prev, newMsg]);
    };
    // 6. Direct Messaging (Facebook Messenger simulation)
    const handleSendDirectMessage = (receiverId, text) => {
        if (!currentUser)
            return;
        const newDM = {
            id: `dm-${Date.now()}`,
            senderId: currentUser.id,
            receiverId,
            text,
            createdAt: new Date().toISOString()
        };
        setDirectMessages((prev) => [...prev, newDM]);
    };
    // Facilitates direct replies coming from recipient back to currentUser
    const handleReceiveDirectMessage = (senderId, text) => {
        if (!currentUser)
            return;
        const newDM = {
            id: `dm-${Date.now()}`,
            senderId,
            receiverId: currentUser.id,
            text,
            createdAt: new Date().toISOString()
        };
        setDirectMessages((prev) => [...prev, newDM]);
        if (activeTab !== 'messages') {
            setUnreadCount((prev) => prev + 1);
        }
    };
    const isAdmin = currentUser?.role === 'admin';
    // 7. RightSidebar Click Triggers Direct Chat
    const handleStartDirectMessage = (recipient) => {
        setSelectedRecipient(recipient);
        setActiveTab('messages');
    };
    // 8. Admin Moderations (User banning/roles changes)
    const handleRemoveUser = (userId) => {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        if (currentUser?.id === userId) {
            handleLogout();
        }
    };
    const handleUpdateUserRole = (userId, newRole) => {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
        if (currentUser?.id === userId) {
            setCurrentUser((prev) => prev ? { ...prev, role: newRole } : null);
        }
    };
    // Connections trigger (updates candidate user status as connected)
    const handleConnectWithUser = (userId) => {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, connected: true } : u)));
    };
    // Follow/Unfollow trigger
    const handleFollowUser = (userId) => {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, following: !u.following } : u)));
        // Also sync current user if modified
        if (currentUser && currentUser.id === userId) {
            setCurrentUser((prev) => prev ? { ...prev, following: !prev.following } : null);
        }
    };
    // Update profile handler
    const handleUpdateProfile = (updatedUser) => {
        setCurrentUser(updatedUser);
        setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    };
    // Filter urgent notices to feed widgets
    const urgentNotices = notices.filter((n) => n.isUrgent);
    if (!currentUser) {
        return <LoginView onLogin={handleLogin} users={users} onAddUser={handleAddUser}/>;
    }
    return (<div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* 1. Sidebar Navigation (Left Column) */}
      <Sidebar currentUser={currentUser} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} unreadCount={unreadCount} noticeCount={noticeCount}/>

      {/* 2. Main Content Stream Panel (Center Column) */}
      <main className="flex-1 overflow-y-auto bg-slate-50">
        {activeTab === 'feed' && (<FeedView currentUser={currentUser} posts={posts} onAddPost={handleAddPost} onDeletePost={handleDeletePost} onLikePost={handleLikePost} onAddComment={handleAddComment}/>)}

        {activeTab === 'notices' && (<NoticesView currentUser={currentUser} notices={notices} onAddNotice={handleAddNotice} onDeleteNotice={handleDeleteNotice}/>)}

        {activeTab === 'resources' && (<ResourcesView currentUser={currentUser} resources={resources} onAddResource={handleAddResource} onDeleteResource={handleDeleteResource} onIncrementDownloads={handleIncrementDownloads}/>)}

        {activeTab === 'rooms' && (<RoomsView currentUser={currentUser} rooms={rooms} roomMessages={roomMessages} onAddRoomMessage={handleAddRoomMessage} users={users}/>)}

        {activeTab === 'messages' && (<MessagesView currentUser={currentUser} users={users} directMessages={directMessages} onSendDirectMessage={handleSendDirectMessage} selectedRecipient={selectedRecipient} setSelectedRecipient={setSelectedRecipient}/>)}

        {activeTab === 'admin' && currentUser.role === 'admin' && (<AdminDashboard currentUser={currentUser} users={users} posts={posts} notices={notices} resources={resources} onRemoveUser={handleRemoveUser} onUpdateUserRole={handleUpdateUserRole}/>)}
        
        {activeTab === 'admin' && isAdmin && (<AdminDashboard currentUser={currentUser} users={users} posts={posts} notices={notices} resources={resources} onRemoveUser={handleRemoveUser} onUpdateUserRole={handleUpdateUserRole}/>)}

        {activeTab === 'profile' && (<ProfileView currentUser={currentUser} users={users} posts={posts} resources={resources} onUpdateProfile={handleUpdateProfile} onNavigateTab={setActiveTab}/>)}
      </main>

      {/* 3. Widgets Sidebar (Right Column) - only displayed on non-chat pages to maintain layout spaciousness */}
      {activeTab !== 'messages' && activeTab !== 'rooms' && (
        <div className= "w-80">
            <RightSidebar currentUser={currentUser} users={users} onConnect={handleConnectWithUser} onFollow={handleFollowUser} urgentNotices={urgentNotices} onStartDirectMessage={handleStartDirectMessage}/>
        </div>
    )}
    </div>);
}