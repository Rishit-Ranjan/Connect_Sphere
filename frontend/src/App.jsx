/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import Chatbot from './components/Chatbot';
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

  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [notices, setNotices] = useState([]);
  const [resources, setResources] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [roomMessages, setRoomMessages] = useState([]);
  const [directMessages, setDirectMessages] = useState([]);

  const [activeTab, setActiveTab] = useState('feed');
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [noticeCount, setNoticeCount] = useState(0);

  const isAdmin = currentUser?.role === 'admin';

  const handleLogout = () => {
    logout();
    setSelectedRecipient(null);
    setSelectedRoomId('');
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/users', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
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

  const fetchNotices = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/notices', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to fetch notices');
      }

      const data = await res.json();
      setNotices(data);
    } catch (error) {
      console.error('Error fetching notices:', error);
    }
  };

  const fetchResources = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/resources', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to fetch resources');
      }

      const data = await res.json();
      setResources(data);
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  };

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/rooms', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to fetch rooms');
      }

      const data = await res.json();
      setRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const fetchDirectMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/direct-messages', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to fetch direct messages');
      }

      const data = await res.json();
      setDirectMessages(data);
    } catch (error) {
      console.error('Error fetching direct messages:', error);
    }
  };

  const fetchRoomMessages = async (roomId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/rooms/${roomId}/messages`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to fetch room messages');
      }

      const data = await res.json();

      setRoomMessages((prev) => {
        const otherRoomMessages = prev.filter((msg) => msg.roomId !== roomId);
        return [...otherRoomMessages, ...data];
      });
    } catch (error) {
      console.error('Error fetching room messages:', error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchPosts();
      fetchUsers();
      fetchNotices();
      fetchResources();
      fetchRooms();
      fetchDirectMessages();
    }
  }, [currentUser]);

  useEffect(() => {
    if (rooms.length > 0 && !selectedRoomId) {
      setSelectedRoomId(rooms[0].id);
    }
  }, [rooms, selectedRoomId]);

  useEffect(() => {
    if (activeTab === 'messages') setUnreadCount(0);
    if (activeTab === 'notices') setNoticeCount(0);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'rooms' && selectedRoomId) {
      fetchRoomMessages(selectedRoomId);
    }
  }, [activeTab, selectedRoomId]);

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

  const handleAddNotice = async (notice) => {
    try {
      const token = localStorage.getItem('token');

      const payload = {
        title: notice.title,
        content: notice.content,
        category: notice.category || 'General',
        isUrgent: !!notice.isUrgent
      };

      const res = await fetch('http://localhost:5000/api/notices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to create notice');
      }

      setNotices((prev) => [data, ...prev]);
      setNoticeCount((prev) => prev + 1);
    } catch (error) {
      console.error('Error creating notice:', error);
    }
  };

  const handleDeleteNotice = async (noticeId) => {
    try {
      const token = localStorage.getItem('token');

      const res = await fetch(`http://localhost:5000/api/notices/${noticeId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete notice');
      }

      setNotices((prev) => prev.filter((notice) => notice.id !== noticeId));
    } catch (error) {
      console.error('Error deleting notice:', error);
    }
  };

  const handleAddResource = async (resource) => {
    try {
      const token = localStorage.getItem('token');

      const payload = {
        title: resource.title,
        description: resource.description,
        category: resource.category || '',
        fileType: resource.fileType || '',
        fileSize: resource.fileSize || '',
        url: resource.url || '#'
      };

      const res = await fetch('http://localhost:5000/api/resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to add resource');
      }

      setResources((prev) => [data, ...prev]);
    } catch (error) {
      console.error('Error creating resource:', error);
    }
  };

  const handleDeleteResource = async (resourceId) => {
    try {
      const token = localStorage.getItem('token');

      const res = await fetch(`http://localhost:5000/api/resources/${resourceId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete resource');
      }

      setResources((prev) => prev.filter((resource) => resource.id !== resourceId));
    } catch (error) {
      console.error('Error deleting resource:', error);
    }
  };

  const handleIncrementDownloads = async (resourceId) => {
    try {
      const token = localStorage.getItem('token');

      const res = await fetch(
        `http://localhost:5000/api/resources/${resourceId}/download`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to update download count');
      }

      setResources((prev) =>
        prev.map((resource) =>
          resource.id === resourceId
            ? { ...resource, downloadCount: data.downloadCount }
            : resource
        )
      );
    } catch (error) {
      console.error('Error updating downloads:', error);
    }
  };

  const handleCreateRoom = async ({ name, description }) => {
    try {
      const token = localStorage.getItem('token');

      const res = await fetch('http://localhost:5000/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, description })
      });

      if (!res.ok) {
        // Handle non-JSON error responses gracefully
        const errorText = await res.text();
        throw new Error(`Failed to create room. Server responded with: ${errorText}`);
      }

      const data = await res.json();

      setRooms((prev) => [...prev, data]);
      setSelectedRoomId(data.id);
      setActiveTab('rooms');
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  const handleAddRoomMessage = async (roomId, messageText) => {
    try {
      const token = localStorage.getItem('token');

      const res = await fetch(`http://localhost:5000/api/rooms/${roomId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text: messageText })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to send room message');
      }

      setRoomMessages((prev) => [...prev, data]);
    } catch (error) {
      console.error('Error sending room message:', error);
    }
  };

  const handleSendDirectMessage = async (receiverId, text) => {
    if (!currentUser) return;

    try {
      const token = localStorage.getItem('token');

      const res = await fetch('http://localhost:5000/api/direct-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ receiverId, text })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to send direct message');
      }

      setDirectMessages((prev) => [...prev, data]);
    } catch (error) {
      console.error('Error sending direct message:', error);
    }
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

  const handleRemoveUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete user');
      }

      setUsers((prev) => prev.filter((u) => u.id !== userId));

      if (currentUser?.id === userId) {
        handleLogout();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to update role');
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: data.role } : u))
      );

      if (currentUser?.id === userId) {
        setCurrentUser((prev) => (prev ? { ...prev, role: data.role } : null));
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleConnectWithUser = (userId) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, connected: true } : u))
    );
  };

  const handleFollowUser = (userId) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, following: !u.following } : u
      )
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
    <>
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
              onCreateRoom={handleCreateRoom}
              users={users}
              selectedRoomId={selectedRoomId}
              setSelectedRoomId={setSelectedRoomId}
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
          <div className="w-85">
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
      <Chatbot />
    </>
  );
}