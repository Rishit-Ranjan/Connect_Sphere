import React, { useState, useEffect } from 'react';
import AuthScreen from './components/LoginScreen';
import MainUI from './components/MainUI';
import ProfileSelectionScreen from './components/ProfileSelectionScreen';
import WelcomeScreen from './components/WelcomeScreen';
import FloatingChatbot from './components/FloatingChatbot';
import * as cryptoService from './services/cryptoService';
// --- MOCK DATA ---
const adminUser = {
    id: 1,
    name: 'Admin User',
    email: 'admin@connectsphere.com',
    password: 'adminpassword',
    gender: 'prefer_not_to_say',
    avatar: 'https://picsum.photos/seed/admin/100',
    role: 'admin',
    status: 'active',
    followers: [2, 3],
    following: [2, 3]
};
const participantUser = {
    id: 2,
    name: 'Participant User',
    email: 'user@connectsphere.com',
    password: 'userpassword',
    gender: 'female',
    avatar: 'https://picsum.photos/seed/participant/100',
    role: 'participant',
    status: 'active',
    followers: [1],
    following: [1, 3]
};
const thirdUser = {
    id: 3,
    name: 'Alex Doe',
    email: 'alex@connectsphere.com',
    password: 'alexpassword',
    gender: 'other',
    avatar: 'https://picsum.photos/seed/alex/100',
    role: 'participant',
    status: 'active',
    followers: [1, 2],
    following: [1, 2],
};
const initialUsers = [adminUser, participantUser, thirdUser];
const initialPosts = [
    {
        id: 1,
        author: participantUser,
        content: 'Just finished a great book! "The Midnight Library" by Matt Haig. Highly recommend it to anyone looking for a thought-provoking read. What are you all reading?',
        timestamp: '2 hours ago',
        likedBy: [1],
        comments: [
            { id: 1, author: adminUser, content: "Excellent choice. A very impactful book.", timestamp: '30 mins ago' },
        ],
    },
    {
        id: 2,
        author: adminUser,
        content: 'Campus coffee shop has a new seasonal latte! 🍂 It\'s a must-try. Perfect for these chilly mornings.',
        imageUrl: 'https://picsum.photos/seed/latte/600/400',
        timestamp: '5 hours ago',
        likedBy: [2],
        comments: [],
    },
    {
        id: 3,
        author: adminUser,
        content: 'Excited to announce our new project collaboration feature launching next week! Get ready to build amazing things together. #ProjectLaunch #Collaboration',
        imageUrl: 'https://picsum.photos/seed/work/600/400',
        timestamp: '1 day ago',
        likedBy: [],
        comments: [],
    }
];
const initialChats = [
    {
        id: 1,
        type: 'private',
        participants: [adminUser, participantUser],
        messages: [], // Messages will be empty initially for E2EE
        unreadCounts: { [adminUser.id]: 0, [participantUser.id]: 0 },
    },
    {
        id: 2,
        name: 'Project Team',
        type: 'group',
        participants: [adminUser, participantUser, thirdUser],
        messages: [
            { id: 101, senderId: adminUser.id, content: { text: "Welcome to the team channel!" }, timestamp: "Yesterday" },
            { id: 102, senderId: thirdUser.id, content: { text: "Hey everyone! Ready to get started." }, timestamp: "10 hours ago" }
        ],
        unreadCounts: { [adminUser.id]: 0, [participantUser.id]: 1, [thirdUser.id]: 0 },
        adminId: adminUser.id
    },
    {
        id: 3,
        name: 'Design Lounge',
        type: 'room',
        roomPrivacy: 'password_protected',
        password: 'design',
        participants: [adminUser],
        messages: [],
        unreadCounts: { [adminUser.id]: 0 },
        adminId: adminUser.id,
        messagingPermission: 'all',
        mediaSharePermission: 'all',
    },
    {
        id: 4,
        name: 'Announcements',
        type: 'room',
        roomPrivacy: 'invite_only',
        participants: [adminUser, thirdUser],
        messages: [
            { id: 103, senderId: adminUser.id, content: { text: "Welcome to the Announcements channel. Only admins can post here." }, timestamp: "Yesterday" }
        ],
        unreadCounts: { [adminUser.id]: 0, [thirdUser.id]: 0 },
        adminId: adminUser.id,
        messagingPermission: 'admin_only',
        mediaSharePermission: 'admin_only',
    }
];
// --- END MOCK DATA ---
const App = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [users, setUsers] = useState(initialUsers);
    const [posts, setPosts] = useState(initialPosts);
    const [chats, setChats] = useState(initialChats);
    const [notifications, setNotifications] = useState([]);
    const [viewingProfile, setViewingProfile] = useState(null);
    const [_activeChat, _setActiveChat] = useState(null); // State lifted from MainUI
    const [authStep, setAuthStep] = useState('select_profile');
    const [initialAuthView, setInitialAuthView] = useState('login');
    const [authFlow, setAuthFlow] = useState(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [theme, setTheme] = useState(() => {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) {
            return storedTheme;
        }
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        return prefersDark ? 'dark' : 'light';
    });
    // E2EE Key Generation on App Load for mock users
    useEffect(() => {
        const setupInitialKeys = async () => {
            let needsUpdate = false;
            const updatedUsers = await Promise.all(users.map(async (user) => {
                if (!user.publicKeyJwk) {
                    const existingPrivateKey = await cryptoService.getPrivateKey(user.id);
                    if (!existingPrivateKey) {
                        console.log(`Generating E2EE keys for mock user: ${user.name}`);
                        const { publicKeyJwk } = await cryptoService.generateAndStoreKeyPair(user.id);
                        needsUpdate = true;
                        return { ...user, publicKeyJwk };
                    }
                    else {
                        const publicKeyJwk = await cryptoService.getPublicKey(user.id);
                        needsUpdate = true;
                        return { ...user, publicKeyJwk };
                    }
                }
                return user;
            }));
            if (needsUpdate) {
                setUsers(updatedUsers);
            }
        };
        setupInitialKeys();
    }, [users]);
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        }
        else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);
    const simulateNetwork = (delay = 500) => new Promise(res => setTimeout(res, delay));
    const handleToggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };
    const ensureUserKeyPair = async (user) => {
        if (user.publicKeyJwk)
            return user;
        let privateKey = await cryptoService.getPrivateKey(user.id);
        if (!privateKey) {
            const { publicKeyJwk } = await cryptoService.generateAndStoreKeyPair(user.id);
            const updatedUser = { ...user, publicKeyJwk };
            setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
            return updatedUser;
        }
        else {
            const publicKeyJwk = await cryptoService.getPublicKey(user.id);
            const updatedUser = { ...user, publicKeyJwk };
            setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
            return updatedUser;
        }
    };
    const addNotification = (recipientId, type, triggeringUser, post, messageContent) => {
        if (recipientId === triggeringUser.id)
            return;
        const newNotification = {
            id: Date.now(),
            recipientId,
            type,
            triggeringUser,
            post,
            messageContent,
            read: false,
            timestamp: 'Just now',
        };
        setNotifications(prev => [newNotification, ...prev]);
    };
    const markNotificationsAsRead = () => {
        if (!currentUser)
            return;
        setNotifications(prev => prev.map(n => n.recipientId === currentUser.id ? { ...n, read: true } : n));
    };
    const handleLogin = async (credentials) => {
        await simulateNetwork();
        const user = users.find(u => u.email.toLowerCase() === credentials.email.toLowerCase() && u.password === credentials.password);
        if (user && user.status === 'active') {
            const userWithKeys = await ensureUserKeyPair(user);
            setCurrentUser(userWithKeys);
            return true;
        }
        return false;
    };
    const handleSignup = async (userData) => {
        await simulateNetwork();
        const existingUser = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
        if (existingUser) {
            alert("An account with this email already exists.");
            return false;
        }
        const newUser = {
            ...userData,
            id: Date.now(),
            avatar: `https://picsum.photos/seed/${userData.name.toLowerCase()}/100`,
            role: 'participant',
            status: 'active',
            followers: [],
            following: [],
        };
        const { publicKeyJwk } = await cryptoService.generateAndStoreKeyPair(newUser.id);
        newUser.publicKeyJwk = publicKeyJwk;
        setUsers(prev => [...prev, newUser]);
        return true;
    };
    const handleLogout = () => {
        setCurrentUser(null);
        setViewingProfile(null);
        setAuthStep('select_profile');
        setAuthFlow(null);
    };
    const handleRoleSelect = (role) => {
        setAuthFlow(role);
        setAuthStep('welcome');
    };
    const handleGoToLogin = () => {
        setInitialAuthView('login');
        setAuthStep('auth');
    };
    const handleGoToSignup = () => {
        setInitialAuthView('signup');
        setAuthStep('auth');
    };
    const handleBackToProfileSelect = () => {
        setAuthStep('select_profile');
        setAuthFlow(null);
    };
    const handleBackToWelcome = () => {
        setAuthStep('welcome');
    };
    const handleViewProfile = (user) => {
        setViewingProfile(user);
    };
    const handleBackToFeed = () => {
        setViewingProfile(null);
    };
    const addPost = async (newPost) => {
        if (!currentUser)
            return;
        await simulateNetwork();
        const post = {
            id: Date.now(),
            author: currentUser,
            content: newPost.content,
            imageUrl: newPost.imageUrl,
            fileName: newPost.fileName,
            fileUrl: newPost.fileUrl,
            timestamp: 'Just now',
            likedBy: [],
            comments: [],
        };
        setPosts([post, ...posts]);
    };
    const deletePost = async (postId) => {
        await simulateNetwork();
        setPosts(posts.filter(p => p.id !== postId));
    };
    const deleteUser = async (userId) => {
        if (!currentUser || currentUser.role !== 'admin' || currentUser.id === userId) {
            alert("You cannot delete your own account.");
            return;
        }
        await simulateNetwork();
        // Also remove user's crypto keys from local storage
        localStorage.removeItem(`private_key_${userId}`);
        localStorage.removeItem(`public_key_${userId}`);
        setPosts(prevPosts => prevPosts.filter(p => p.author.id !== userId));
        setChats(prevChats => prevChats.filter(c => c.participants.some(p => p.id === userId)));
        setUsers(prevUsers => prevUsers
            .filter(u => u.id !== userId)
            .map(u => ({
                ...u,
                followers: u.followers.filter(id => id !== userId),
                following: u.following.filter(id => id !== userId),
            })));
    };
    const addMessage = (chatId, message, plaintextForNotification) => {
        const chat = chats.find(c => c.id === chatId);
        if (!chat || !currentUser)
            return;
        setChats(prevChats => prevChats.map(c => {
            if (c.id === chatId) {
                const newUnreadCounts = { ...c.unreadCounts };
                // For groups, increment for all OTHER participants
                c.participants.forEach(p => {
                    if (p.id !== currentUser.id) {
                        newUnreadCounts[p.id] = (newUnreadCounts[p.id] || 0) + 1;
                    }
                });
                return { ...c, messages: [...c.messages, message], unreadCounts: newUnreadCounts };
            }
            return c;
        }));
        // Notify all OTHER participants
        chat.participants.forEach(p => {
            if (p.id !== currentUser.id) {
                const messageText = plaintextForNotification ?? (message.content?.text);
                addNotification(p.id, 'message', currentUser, undefined, messageText);
            }
        });
    };
    const handleStartChat = (participant) => {
        if (!currentUser || currentUser.id === participant.id)
            return;
        const existingChat = chats.find(c => c.type === 'private' &&
            c.participants.length === 2 &&
            c.participants.some(p => p.id === currentUser.id) &&
            c.participants.some(p => p.id === participant.id));
        if (!existingChat) {
            const newChat = {
                id: Date.now(),
                type: 'private',
                participants: [currentUser, participant],
                messages: [],
                unreadCounts: { [currentUser.id]: 0, [participant.id]: 0 }
            };
            setChats(prevChats => [...prevChats, newChat]);
        }
    };
    const handleCreateGroup = async (name, members) => {
        if (!currentUser || !name.trim() || members.length === 0)
            return;
        await simulateNetwork();
        const allParticipants = [currentUser, ...members.filter(m => m.id !== currentUser.id)];
        const newGroupChat = {
            id: Date.now(),
            name,
            type: 'group',
            participants: allParticipants,
            messages: [],
            unreadCounts: allParticipants.reduce((acc, user) => {
                acc[user.id] = 0;
                return acc;
            }, {}),
            adminId: currentUser.id,
        };
        setChats(prev => [newGroupChat, ...prev]);
    };
    const handleCreateRoom = async (name, privacy, password) => {
        if (!currentUser || !name.trim())
            return;
        await simulateNetwork();
        const newRoom = {
            id: Date.now(),
            name,
            type: 'room',
            roomPrivacy: privacy,
            password: password,
            participants: [currentUser],
            messages: [],
            unreadCounts: { [currentUser.id]: 0 },
            adminId: currentUser.id,
            messagingPermission: 'all',
            mediaSharePermission: 'all',
        };
        setChats(prev => [newRoom, ...prev]);
    };
    const handleJoinRoom = async (chatId, passwordInput) => {
        if (!currentUser)
            return false;
        await simulateNetwork();
        const room = chats.find(c => c.id === chatId);
        if (!room || room.type !== 'room' || room.roomPrivacy !== 'password_protected') {
            return false;
        }
        if (room.password === passwordInput) {
            setChats(prevChats => prevChats.map(chat => {
                if (chat.id === chatId) {
                    if (!chat.participants.some(p => p.id === currentUser.id)) {
                        const newUnreadCounts = { ...chat.unreadCounts, [currentUser.id]: 0 };
                        return { ...chat, participants: [...chat.participants, currentUser], unreadCounts: newUnreadCounts };
                    }
                }
                return chat;
            }));
            return true;
        }
        return false;
    };
    const handleManageRoomMembers = async (chatId, newMemberList) => {
        if (!currentUser)
            return;
        await simulateNetwork();
        setChats(prevChats => prevChats.map(chat => {
            if (chat.id === chatId && chat.type === 'room' && chat.adminId === currentUser.id) {
                // Ensure the admin is always in the member list
                const adminIsPresent = newMemberList.some(m => m.id === currentUser.id);
                const finalMemberList = adminIsPresent ? newMemberList : [currentUser, ...newMemberList];
                const newUnreadCounts = { ...chat.unreadCounts };
                finalMemberList.forEach(member => {
                    if (newUnreadCounts[member.id] === undefined) {
                        newUnreadCounts[member.id] = 0;
                    }
                });
                return { ...chat, participants: finalMemberList, unreadCounts: newUnreadCounts };
            }
            return chat;
        }));
    };
    const handleUpdateRoomSettings = async (chatId, settings) => {
        if (!currentUser)
            return;
        await simulateNetwork();
        setChats(prevChats => prevChats.map(chat => {
            if (chat.id === chatId && chat.type === 'room' && chat.adminId === currentUser.id) {
                return { ...chat, ...settings };
            }
            return chat;
        }));
    };
    const handleDeleteRoom = async (chatId) => {
        if (!currentUser)
            return;
        await simulateNetwork();
        const room = chats.find(c => c.id === chatId);
        if (room && room.type === 'room' && room.adminId === currentUser.id) {
            setChats(prev => prev.filter(c => c.id !== chatId));
        }
    };
    const handleMarkChatAsRead = (chatId) => {
        if (!currentUser)
            return;
        setChats(prevChats => prevChats.map(chat => {
            if (chat.id === chatId) {
                const newUnreadCounts = { ...chat.unreadCounts };
                newUnreadCounts[currentUser.id] = 0;
                return { ...chat, unreadCounts: newUnreadCounts };
            }
            return chat;
        }));
    };
    const handleUpdateUser = async (updatedData) => {
        if (!currentUser)
            return;
        await simulateNetwork();
        const updatedUser = { ...currentUser, ...updatedData };
        setCurrentUser(updatedUser);
        setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
        setPosts(prevPosts => prevPosts.map(p => ({
            ...p,
            author: p.author.id === updatedUser.id ? updatedUser : p.author,
            comments: p.comments.map(c => ({
                ...c,
                author: c.author.id === updatedUser.id ? updatedUser : c.author,
            }))
        })));
        // Note: Chat messages sender objects won't update retroactively, which is fine.
        // New messages will use the updated user object.
        setChats(prevChats => prevChats.map(chat => ({
            ...chat,
            participants: chat.participants.map(p => p.id === updatedUser.id ? updatedUser : p)
        })));
    };
    const handleToggleUserStatus = async (userId) => {
        await simulateNetwork();
        setUsers(prevUsers => prevUsers.map(u => {
            if (u.id === userId) {
                return { ...u, status: u.status === 'active' ? 'revoked' : 'active' };
            }
            return u;
        }));
    };
    const handleToggleFollow = async (targetUserId) => {
        if (!currentUser)
            return;
        if (currentUser.id === targetUserId)
            return;
        await simulateNetwork();
        let updatedUsers = users.map(u => ({
            ...u,
            followers: [...u.followers],
            following: [...u.following],
        }));
        let updatedCurrentUser = updatedUsers.find(u => u.id === currentUser.id);
        let targetUser = updatedUsers.find(u => u.id === targetUserId);
        const isFollowing = updatedCurrentUser.following.includes(targetUserId);
        if (isFollowing) {
            updatedCurrentUser.following = updatedCurrentUser.following.filter(id => id !== targetUserId);
            targetUser.followers = targetUser.followers.filter(id => id !== currentUser.id);
        }
        else {
            updatedCurrentUser.following.push(targetUserId);
            targetUser.followers.push(currentUser.id);
        }
        setUsers(updatedUsers);
        setCurrentUser(updatedCurrentUser);
        if (viewingProfile) {
            if (viewingProfile.id === updatedCurrentUser.id) {
                setViewingProfile(updatedCurrentUser);
            }
            else if (viewingProfile.id === targetUser.id) {
                setViewingProfile(targetUser);
            }
        }
    };
    const handleToggleLike = async (postId) => {
        if (!currentUser)
            return;
        await simulateNetwork(250);
        let targetPost;
        const newPosts = posts.map(p => {
            if (p.id === postId) {
                const likedBy = p.likedBy.includes(currentUser.id)
                    ? p.likedBy.filter(id => id !== currentUser.id)
                    : [...p.likedBy, currentUser.id];
                targetPost = { ...p, likedBy };
                return targetPost;
            }
            return p;
        });
        setPosts(newPosts);
        if (targetPost && targetPost.likedBy.includes(currentUser.id)) {
            addNotification(targetPost.author.id, 'like', currentUser, targetPost);
        }
    };
    const handleAddComment = async (postId, content) => {
        if (!currentUser)
            return;
        await simulateNetwork();
        let targetPost;
        const newPosts = posts.map(p => {
            if (p.id === postId) {
                const newComment = {
                    id: Date.now(),
                    author: currentUser,
                    content,
                    timestamp: 'Just now',
                };
                targetPost = { ...p, comments: [...p.comments, newComment] };
                return targetPost;
            }
            return p;
        });
        setPosts(newPosts);
        if (targetPost) {
            addNotification(targetPost.author.id, 'comment', currentUser, targetPost);
        }
    };
    if (!currentUser) {
        if (authStep === 'select_profile') {
            return <ProfileSelectionScreen adminUser={adminUser} onSelectRole={handleRoleSelect} />;
        }
        if (authStep === 'welcome') {
            return <WelcomeScreen onLoginClick={handleGoToLogin} onSignupClick={handleGoToSignup} onBack={handleBackToProfileSelect} authFlow={authFlow} />;
        }
        return <AuthScreen initialView={initialAuthView} onLogin={handleLogin} onSignup={handleSignup} onBack={handleBackToWelcome} allowSignupToggle={authFlow !== 'admin'} authFlow={authFlow} />;
    }
    return (<>
        <MainUI activeChat={_activeChat} onSetActiveChat={_setActiveChat} currentUser={currentUser} users={users} posts={posts} chats={chats} notifications={notifications} viewingProfile={viewingProfile} theme={theme} onLogout={handleLogout} onAddPost={addPost} onDeletePost={deletePost} onDeleteUser={deleteUser} onAddMessage={addMessage} onStartChat={handleStartChat} onCreateGroup={handleCreateGroup} onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} onManageRoomMembers={handleManageRoomMembers} onUpdateRoomSettings={handleUpdateRoomSettings} onDeleteRoom={handleDeleteRoom} onUpdateUser={handleUpdateUser} onToggleUserStatus={handleToggleUserStatus} onViewProfile={handleViewProfile} onBackToFeed={handleBackToFeed} onToggleFollow={handleToggleFollow} onToggleLike={handleToggleLike} onAddComment={handleAddComment} onToggleTheme={handleToggleTheme} onMarkNotificationsAsRead={markNotificationsAsRead} onMarkChatAsRead={handleMarkChatAsRead} />
        <FloatingChatbot currentUser={currentUser} isOnline={isOnline} />
    </>);
};
export default App;
