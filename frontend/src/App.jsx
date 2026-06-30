/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';

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
import { useAuth } from './context/AuthContext';

export default function App() {
  const { currentUser, setCurrentUser, logout, loading } = useAuth();

  const [users, setUsers] = useState(() => getSavedState('users', INITIAL_USERS));
  const [posts, setPosts] = useState([]);
  const [notices, setNotices] = useState(() => getSavedState('notices', INITIAL_NOTICES));
  const [resources, setResources] = useState(() => getSavedState('resources', INITIAL_RESOURCES));
  const [rooms, setRooms] = useState(() => getSavedState('rooms', INITIAL_ROOMS));
  const [roomMessages, setRoomMessages] = useState(() => getSavedState('room_messages', INITIAL_ROOM_MESSAGES));
  const [directMessages, setDirectMessages] = useState(() => getSavedState('direct_messages', INITIAL_DIRECT_MESSAGES));

  const [activeTab, setActiveTab] = useState('feed');
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [noticeCount, setNoticeCount] = useState(0);

  useEffect(() => {
    saveState('users', users);
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      fetchPosts();
    }
  }, [currentUser]);

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

  useEffect(() => {
    if (activeTab === 'messages') setUnreadCount(0);
    if (activeTab === 'notices') setNoticeCount(0);
  }, [activeTab]);

  const isAdmin = currentUser?.role === 'admin';

  const handleLogout = () => {
    logout();
    setSelectedRecipient(null);
  };

  const handleAddPost = async ({ text, imageUrl }) => {
    try {
      const token = localStorage.getItem('token');

      const res = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text, imageUrl })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to create post');
      }

      setPosts((prev) => [data, ...prev]);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/posts', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data = await res.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleDeletePost = async (postId) => {
  try {
    const token = localStorage.getItem('token');

    const res = await fetch(`http://localhost:5000/api/posts/${postId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Failed to delete post');
    }

    setPosts((prev) => prev.filter((post) => post.id !== postId));
  } catch (error) {
    console.error('Error deleting post:', error);
  }
};

  const handleEditPost = (postId, updatedText) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              text: updatedText
            }
          : post
      )
    );
  };

  const handleLikePost = async (postId) => {
    try {
      const token = localStorage.getItem('token');

      const res = await fetch(`http://localhost:5000/api/posts/${postId}/like`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to update like');
      }

      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                likesCount: data.likesCount,
                likedByMe: data.likedByMe
              }
            : post
        )
      );
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleAddComment = async (postId, commentText) => {
    try {
      const token = localStorage.getItem('token');

      const res = await fetch(`http://localhost:5000/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text: commentText })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to add comment');
      }

      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: [...post.comments, data]
              }
            : post
        )
      );
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleAddNotice = (notice) => {
    setNotices((prev) => [notice, ...prev]);
    setNoticeCount((prev) => prev + 1);
  };

  const handleDeleteNotice = (noticeId) => {
    setNotices((prev) => prev.filter((n) => n.id !== noticeId));
  };

  const handleAddResource = (res) => {
    setResources((prev) => [res, ...prev]);
  };

  const handleDeleteResource = (resourceId) => {
    setResources((prev) => prev.filter((r) => r.id !== resourceId));
  };

  const handleIncrementDownloads = (resourceId) => {
    setResources((prev) =>
      prev.map((res) =>
        res.id === resourceId
          ? { ...res, downloadCount: res.downloadCount + 1 }
          : res
      )
    );
  };

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

  const handleSendDirectMessage = (receiverId, text) => {
    if (!currentUser) return;

    const newDM = {
      id: `dm-${Date.now()}`,
      senderId: currentUser.id,
      receiverId,
      text,
      createdAt: new Date().toISOString()
    };

    setDirectMessages((prev) => [...prev, newDM]);
  };

  const handleReceiveDirectMessage = (senderId, text) => {
    if (!currentUser) return;

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

  const handleStartDirectMessage = (recipient) => {
    setSelectedRecipient(recipient);
    setActiveTab('messages');
  };

  const handleRemoveUser = (userId) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    if (currentUser?.id === userId) {
      handleLogout();
    }
  };

  const handleUpdateUserRole = (userId, newRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );

    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, role: newRole } : null));
    }
  };

  const handleConnectWithUser = (userId) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, connected: true } : u))
    );
  };

  const handleFollowUser = (userId) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, following: !u.following } : u))
    );

    if (currentUser && currentUser.id === userId) {
      setCurrentUser((prev) =>
        prev ? { ...prev, following: !prev.following } : null
      );
    }
  };

  const handleUpdateProfile = (updatedUser) => {
    setCurrentUser(updatedUser);
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
  };

  const urgentNotices = notices.filter((n) => n.isUrgent);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500 font-medium">Connecting to server...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginView />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        unreadCount={unreadCount}
        noticeCount={noticeCount}
      />

      <main className="flex-1 overflow-y-auto bg-slate-50">
        {activeTab === 'feed' && (
          <FeedView
            currentUser={currentUser}
            posts={posts}
            onAddPost={handleAddPost}
            onDeletePost={handleDeletePost}
            onEditPost={handleEditPost}
            onLikePost={handleLikePost}
            onAddComment={handleAddComment}
          />
        )}

        {activeTab === 'notices' && (
          <NoticesView
            currentUser={currentUser}
            notices={notices}
            onAddNotice={handleAddNotice}
            onDeleteNotice={handleDeleteNotice}
          />
        )}

        {activeTab === 'resources' && (
          <ResourcesView
            currentUser={currentUser}
            resources={resources}
            onAddResource={handleAddResource}
            onDeleteResource={handleDeleteResource}
            onIncrementDownloads={handleIncrementDownloads}
          />
        )}

        {activeTab === 'rooms' && (
          <RoomsView
            currentUser={currentUser}
            rooms={rooms}
            roomMessages={roomMessages}
            onAddRoomMessage={handleAddRoomMessage}
            users={users}
          />
        )}

        {activeTab === 'messages' && (
          <MessagesView
            currentUser={currentUser}
            users={users}
            directMessages={directMessages}
            onSendDirectMessage={handleSendDirectMessage}
            selectedRecipient={selectedRecipient}
            setSelectedRecipient={setSelectedRecipient}
          />
        )}

        {activeTab === 'admin' && isAdmin && (
          <AdminDashboard
            currentUser={currentUser}
            users={users}
            posts={posts}
            notices={notices}
            resources={resources}
            onRemoveUser={handleRemoveUser}
            onUpdateUserRole={handleUpdateUserRole}
            onDeletePost={handleDeletePost}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            currentUser={currentUser}
            users={users}
            posts={posts}
            resources={resources}
            onUpdateProfile={handleUpdateProfile}
            onNavigateTab={setActiveTab}
          />
        )}
      </main>

      {activeTab !== 'messages' && activeTab !== 'rooms' && (
        <div className="w-80">
          <RightSidebar
            currentUser={currentUser}
            users={users}
            onConnect={handleConnectWithUser}
            onFollow={handleFollowUser}
            urgentNotices={urgentNotices}
            onStartDirectMessage={handleStartDirectMessage}
          />
        </div>
      )}
    </div>
  );
}