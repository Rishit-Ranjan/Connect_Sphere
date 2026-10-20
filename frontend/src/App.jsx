/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useEffect } from 'react';
import Chatbot from './components/Chatbot';
import Navbar from './components/Navbar';
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
import NotificationsView from './components/NotificationsView';
import { useAuth } from './context/AuthContext';
import { API_URL } from './config/api';

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
  const [viewedProfileUser, setViewedProfileUser] = useState(null);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  // Private rooms the user has unlocked with a password (persisted per browser).
  const [unlockedRoomIds, setUnlockedRoomIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('unlocked_rooms') || '[]');
    } catch {
      return [];
    }
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [noticeCount, setNoticeCount] = useState(0);
  const [relationshipError, setRelationshipError] = useState('');

  const isAdmin = currentUser?.role === 'admin';

  const handleNavbarTabChange = (tab) => {
    if (tab === 'profile') {
      setViewedProfileUser(null);
    }
    setActiveTab(tab);
  };

  const handleViewProfile = (author) => {
    const authorId = String(author.id || author._id || '');
    const ownId = String(currentUser.id || currentUser._id || '');
    const profileUser = users.find((user) => {
      const userId = String(user.id || user._id || '');
      return (authorId && userId === authorId) ||
        (author.handle && user.handle === author.handle);
    }) || author;
    const isOwnProfile =
      (authorId && ownId && authorId === ownId) ||
      (author.handle && currentUser.handle === author.handle);

    setViewedProfileUser(isOwnProfile ? null : profileUser);
    setActiveTab('profile');
  };

  const handleLogout = () => {
    logout();
    setSelectedRecipient(null);
    setSelectedRoomId('');
    setViewedProfileUser(null);
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/users`, {
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
      const res = await fetch(`${API_URL}/posts`, {
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
      const res = await fetch(`${API_URL}/notices`, {
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

  const fetchNotificationStatuses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error('Failed to fetch notification statuses');
      }

      const statuses = await res.json();
      setReadNotificationIds(statuses.filter((status) => status.read).map((status) => status.notificationId));
      setDismissedNotificationIds(statuses.filter((status) => status.dismissed).map((status) => status.notificationId));
    } catch (error) {
      console.error('Error fetching notification statuses:', error);
    }
  };

  const fetchResources = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/resources`, {
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
      const res = await fetch(`${API_URL}/rooms`, {
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
      const res = await fetch(`${API_URL}/direct-messages`, {
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
      const res = await fetch(`${API_URL}/rooms/${roomId}/messages`, {
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
    setReadNotificationIds([]);
    setDismissedNotificationIds([]);
    if (currentUser) {
      fetchPosts();
      fetchUsers();
      fetchNotices();
      fetchNotificationStatuses();
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

  const handleAddPost = async ({ text, image }) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('text', text);
      if (image) {
        formData.append('image', image);
      }

      const res = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to create post');
      }

      setPosts((prev) => [data, ...prev]);
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const token = localStorage.getItem('token');

      const res = await fetch(`${API_URL}/posts/${postId}`, {
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

      const res = await fetch(`${API_URL}/posts/${postId}/like`, {
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

      const res = await fetch(`${API_URL}/posts/${postId}/comment`, {
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

  const handleEditComment = async (postId, commentId, text) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/posts/${postId}/comment/${commentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text }),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to edit comment.');
    }

    setPosts((previous) =>
      previous.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: post.comments.map((comment) =>
                comment.id === commentId ? { ...comment, text: result.text } : comment,
              ),
            }
          : post,
      ),
    );
  };

  const handleDeleteComment = async (postId, commentId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/posts/${postId}/comment/${commentId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to delete comment.');
    }

    setPosts((previous) =>
      previous.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: post.comments.filter((comment) => comment.id !== commentId),
            }
          : post,
      ),
    );
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

      const res = await fetch(`${API_URL}/notices`, {
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

      const res = await fetch(`${API_URL}/notices/${noticeId}`, {
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

      const payload = new FormData();
      payload.append('title', resource.title);
      payload.append('description', resource.description);
      payload.append('category', resource.category);
      payload.append('file', resource.file);

      const res = await fetch(`${API_URL}/resources`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: payload
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to add resource');
      }

      setResources((prev) => [data, ...prev]);
    } catch (error) {
      console.error('Error creating resource:', error);
      throw error;
    }
  };

  const handleDeleteResource = async (resourceId) => {
    try {
      const token = localStorage.getItem('token');

      const res = await fetch(`${API_URL}/resources/${resourceId}`, {
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

  const handleDownloadResource = async (resource) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/resources/${resource.id}/file`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to download resource');
      }

      const downloadCountHeader = res.headers.get('X-Download-Count');
      if (downloadCountHeader === null || !Number.isFinite(Number(downloadCountHeader))) {
        throw new Error('The backend did not return the updated download count.');
      }
      const objectUrl = URL.createObjectURL(await res.blob());
      const downloadCount = Number(downloadCountHeader);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = resource.fileName || resource.title;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      setResources((prev) =>
        prev.map((item) => item.id === resource.id ? { ...item, downloadCount } : item)
      );
    } catch (error) {
      console.error('Error downloading resource:', error);
      throw error;
    }
  };

  const handleCreateRoom = async ({ name, description, visibility, password }) => {
    try {
      const token = localStorage.getItem('token');

      const res = await fetch(`${API_URL}/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, description, visibility, password })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        return { ok: false, message: data.message || 'Failed to create room.' };
      }

      setRooms((prev) => [...prev, data]);
      // A room you just created is unlocked for you automatically.
      if (data.isPrivate || data.visibility === 'private') {
        setUnlockedRoomIds((prev) => {
          const next = [...new Set([...prev, data.id])];
          localStorage.setItem('unlocked_rooms', JSON.stringify(next));
          return next;
        });
      }
      setSelectedRoomId(data.id);
      setActiveTab('rooms');
      return { ok: true, room: data };
    } catch (error) {
      console.error('Error creating room:', error);
      return { ok: false, message: 'Failed to create room.' };
    }
  };

  const handleVerifyRoomPassword = async (roomId, password) => {
    try {
      const token = localStorage.getItem('token');

      const res = await fetch(`${API_URL}/rooms/${roomId}/verify-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ password })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        return { ok: false, message: data.message || 'Incorrect room password.' };
      }

      setUnlockedRoomIds((prev) => {
        const next = [...new Set([...prev, roomId])];
        localStorage.setItem('unlocked_rooms', JSON.stringify(next));
        return next;
      });
      return { ok: true };
    } catch (error) {
      console.error('Error verifying room password:', error);
      return { ok: false, message: 'Failed to verify password.' };
    }
  };

  const handleDeleteRoom = async (roomId) => {
    try {
      const token = localStorage.getItem('token');

      const res = await fetch(`${API_URL}/rooms/${roomId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 404 && !data.message) {
          return {
            ok: false,
            message: 'Delete endpoint not found. Restart the backend server to load the new room routes.'
          };
        }
        return { ok: false, message: data.message || 'Failed to delete room.' };
      }
      setRoomMessages((prev) => prev.filter((msg) => msg.roomId !== roomId));
      setUnlockedRoomIds((prev) => {
        const next = prev.filter((id) => id !== roomId);
        localStorage.setItem('unlocked_rooms', JSON.stringify(next));
        return next;
      });
      setSelectedRoomId((prev) => (prev === roomId ? '' : prev));

      return { ok: true };
    } catch (error) {
      console.error('Error deleting room:', error);
      return { ok: false, message: 'Failed to delete room.' };
    }
  };

  const handleAddRoomMessage = async (roomId, messageText) => {
    try {
      const token = localStorage.getItem('token');

      const res = await fetch(`${API_URL}/rooms/${roomId}/messages`, {
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

      const res = await fetch(`${API_URL}/direct-messages`, {
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

  const handleStartDirectMessage = (recipient) => {
    setSelectedRecipient(recipient);
    setActiveTab('messages');
  };

  const handleRemoveUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/users/${userId}`, {
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
      const res = await fetch(`${API_URL}/users/${userId}/role`, {
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

  const handleConnectWithUser = async (userId) => {
    try {
      setRelationshipError('');
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/users/${userId}/connection`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ connected: true })
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to connect with user.');
      }

      setUsers((previous) =>
        previous.map((user) => user.id === userId
          ? { ...user, connected: result.connected }
          : user)
      );
    } catch (error) {
      console.error('Error connecting with user:', error);
      setRelationshipError(error.message || 'Unable to connect with this user.');
    }
  };

  const handleFollowUser = async (userId) => {
    const user = users.find((candidate) => candidate.id === userId);
    if (!user) return;

    try {
      setRelationshipError('');
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/users/${userId}/follow`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ following: !user.following })
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to update follow status.');
      }

      setUsers((previous) =>
        previous.map((candidate) => candidate.id === userId
          ? { ...candidate, following: result.following }
          : candidate)
      );
    } catch (error) {
      console.error('Error updating follow status:', error);
      setRelationshipError(error.message || 'Unable to update follow status.');
    }
  };

  const handleUpdateProfile = (updatedUser) => {
    setCurrentUser(updatedUser);
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
  };

  const handleUpdateAvatar = async (avatar) => {
    const token = localStorage.getItem('token');
    const isFileUpload = avatar instanceof File;
    const requestBody = isFileUpload ? new FormData() : JSON.stringify({ avatarUrl: avatar });
    if (isFileUpload) requestBody.append('avatar', avatar);

    const response = await fetch(
      `${API_URL}/users/me/avatar${isFileUpload ? '/upload' : ''}`,
      {
        method: isFileUpload ? 'POST' : 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          ...(isFileUpload ? {} : { 'Content-Type': 'application/json' }),
        },
        body: requestBody,
      },
    );
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to update profile photo.');
    }

    const userId = currentUser.id || currentUser._id;
    setCurrentUser((prev) => (prev ? { ...prev, avatarUrl: result.avatarUrl } : prev));
    setUsers((prev) =>
      prev.map((user) =>
        String(user.id || user._id) === String(userId)
          ? { ...user, avatarUrl: result.avatarUrl }
          : user,
      ),
    );
    setPosts((prev) =>
      prev.map((post) =>
        String(post.author?.id || post.author?._id) === String(userId)
          ? {
              ...post,
              author: { ...post.author, avatarUrl: result.avatarUrl },
              comments: post.comments?.map((comment) =>
                String(comment.author?.id || comment.author?._id || comment.user?.id || comment.user?._id) === String(userId)
                  ? {
                      ...comment,
                      author: comment.author
                        ? { ...comment.author, avatarUrl: result.avatarUrl }
                        : comment.author,
                      user: comment.user
                        ? { ...comment.user, avatarUrl: result.avatarUrl }
                        : comment.user,
                    }
                  : comment,
              ),
            }
          : post,
      ),
    );
    setRoomMessages((prev) =>
      prev.map((message) =>
        String(message.sender?.id || message.sender?._id) === String(userId)
          ? { ...message, sender: { ...message.sender, avatarUrl: result.avatarUrl } }
          : message,
      ),
    );

    return result.avatarUrl;
  };

  const urgentNotices = notices.filter((n) => n.isUrgent);

  const [readNotificationIds, setReadNotificationIds] = useState([]);
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState([]);
  const [notificationTarget, setNotificationTarget] = useState(null);

  const persistNotificationStatus = async (notificationIds, status) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/notifications`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notificationIds, ...status })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to update notification status');
      }

      if (typeof status.read === 'boolean') {
        setReadNotificationIds((previous) => status.read
          ? [...new Set([...previous, ...notificationIds])]
          : previous.filter((id) => !notificationIds.includes(id)));
      }
      if (typeof status.dismissed === 'boolean') {
        setDismissedNotificationIds((previous) => status.dismissed
          ? [...new Set([...previous, ...notificationIds])]
          : previous.filter((id) => !notificationIds.includes(id)));
      }
    } catch (error) {
      console.error('Error updating notification status:', error);
    }
  };

  const notifications = [
    ...notices.slice(0, 5).map((notice) => ({
      id: `notice-${notice.id}`,
      type: 'notice',
      noticeId: notice.id,
      actor: notice.authorName || '—',
      text: `published: ${notice.title}`,
      time: notice.createdAt ? new Date(notice.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—',
      createdAt: notice.createdAt ? new Date(notice.createdAt).getTime() : 0,
    })),
    ...posts.flatMap((post) => {
      const items = [];
      if (post.liked) {
        items.push({
          id: `like-${post.id}`,
          type: 'like',
          postId: post.id,
          actor: post.author?.name || '—',
          text: `liked a post: ${(post.text || '').slice(0, 60)}${(post.text || '').length > 60 ? '...' : ''}`,
          time: post.createdAt ? new Date(post.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—',
          createdAt: post.createdAt ? new Date(post.createdAt).getTime() : 0,
        });
      }
      (post.comments || []).slice(-2).forEach((comment) => {
        items.push({
          id: `comment-${comment.id}`,
          type: 'comment',
          postId: post.id,
          commentId: comment.id,
          actor: comment.author?.name || '—',
          text: `commented: ${(comment.text || '').slice(0, 60)}${(comment.text || '').length > 60 ? '...' : ''}`,
          time: comment.createdAt ? new Date(comment.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—',
          createdAt: comment.createdAt ? new Date(comment.createdAt).getTime() : 0,
        });
      });
      return items;
    }),
  ]
    .sort((a, b) => b.createdAt - a.createdAt)
    .filter((n) => !dismissedNotificationIds.includes(n.id))
    .slice(0, 20)
    .map((n) => ({ ...n, unread: !readNotificationIds.includes(n.id) }));

  const unreadNotificationsCount = notifications.filter((n) => n.unread).length;

  const handleMarkAllNotificationsRead = () => {
    const notificationIds = notifications.filter((notification) => notification.unread).map((notification) => notification.id);
    if (notificationIds.length > 0) {
      persistNotificationStatus(notificationIds, { read: true });
    }
  };

  const handleNotificationClick = (notification) => {
    persistNotificationStatus([notification.id], { read: true });
    setNotificationTarget(notification);
    setActiveTab(notification.type === 'notice' ? 'notices' : 'feed');
  };

  const handleDismissNotification = (notification) => {
    persistNotificationStatus([notification.id], { read: true, dismissed: true });
  };

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
      <div className="flex flex-col h-[100dvh] bg-slate-50 overflow-hidden font-sans">
        <Navbar
          currentUser={currentUser}
          activeTab={activeTab}
          setActiveTab={handleNavbarTabChange}
          onLogout={handleLogout}
          unreadCount={unreadCount}
          unreadNotificationsCount={unreadNotificationsCount}
        />

        <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">
          <Sidebar
            currentUser={currentUser}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            noticeCount={noticeCount}
          />

          <main className="flex-1 min-w-0 overflow-y-auto bg-slate-50">
            {activeTab === 'feed' && (
            <FeedView
              currentUser={currentUser}
              posts={posts}
              onAddPost={handleAddPost}
              onDeletePost={handleDeletePost}
              onEditPost={handleEditPost}
              onLikePost={handleLikePost}
              onAddComment={handleAddComment}
              onEditComment={handleEditComment}
              onDeleteComment={handleDeleteComment}
              onViewProfile={handleViewProfile}
              notificationTarget={notificationTarget}
            />
          )}

          {activeTab === 'notices' && (
            <NoticesView
              currentUser={currentUser}
              notices={notices}
              onAddNotice={handleAddNotice}
              onDeleteNotice={handleDeleteNotice}
              notificationTarget={notificationTarget}
            />
          )}

          {activeTab === 'notifications' && (
            <NotificationsView
              notifications={notifications}
              unreadNotificationsCount={unreadNotificationsCount}
              onMarkAllRead={handleMarkAllNotificationsRead}
              onNotificationClick={handleNotificationClick}
              onDismissNotification={handleDismissNotification}
            />
          )}

          {activeTab === 'resources' && (
            <ResourcesView
              currentUser={currentUser}
              resources={resources}
              onAddResource={handleAddResource}
              onDeleteResource={handleDeleteResource}
              onDownloadResource={handleDownloadResource}
            />
          )}

          {activeTab === 'rooms' && (
            <RoomsView
              currentUser={currentUser}
              rooms={rooms}
              roomMessages={roomMessages}
              onAddRoomMessage={handleAddRoomMessage}
              onCreateRoom={handleCreateRoom}
              onVerifyRoomPassword={handleVerifyRoomPassword}
              onDeleteRoom={handleDeleteRoom}
              unlockedRoomIds={unlockedRoomIds}
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
              viewedUser={viewedProfileUser}
              users={users}
              posts={posts}
              resources={resources}
              onUpdateProfile={handleUpdateProfile}
              onUpdateAvatar={handleUpdateAvatar}
              onNavigateTab={setActiveTab}
            />
          )}
          </main>

          <div className="hidden md:block md:w-56 lg:w-64 xl:w-80 2xl:w-96 bg-slate-50 shrink-0">
            <RightSidebar
              currentUser={currentUser}
              users={users}
              relationshipError={relationshipError}
              onConnect={handleConnectWithUser}
              onFollow={handleFollowUser}
              urgentNotices={urgentNotices}
              onStartDirectMessage={handleStartDirectMessage}
            />
          </div>
        </div>
      </div>
      <Chatbot />
    </>
  );
}