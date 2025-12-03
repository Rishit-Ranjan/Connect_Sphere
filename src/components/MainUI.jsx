import React, { useState, useRef, useEffect, useMemo } from 'react';
import { HomeIcon, MessageIcon, LogoutIcon, SendIcon, PhotoIcon, TrashIcon, LogoIcon, EditIcon, BanIcon, UserCheckIcon, SunIcon, MoonIcon, BellIcon, PaperclipIcon, UserIcon, SearchIcon, UsersIcon, PlusIcon, XIcon, HashtagIcon, LockClosedIcon, Cog6ToothIcon, MegaphoneIcon, FolderIcon, FileTextIcon, UploadCloudIcon, CommentIcon } from './Icons';
import * as cryptoService from '../services/cryptoService';
// AI feature removed
// import { generateReplySuggestions } from '../services/geminiService';
// Import newly created UI components
import UserAvatar from './ui/UserAvatar';
import PostCard from './ui/PostCard';
import CreatePost from './ui/CreatePost';
import EditProfileModal from './ui/EditProfileModal';
import CreateGroupModal from './ui/CreateGroupModal';
import CreateRoomModal from './ui/CreateRoomModal';
import JoinRoomModal from './ui/JoinRoomModal';
import ManageRoomModal from './ui/ManageRoomModal';
import ProfilePage from './ui/ProfilePage';
import ChatMessage from './ui/ChatMessage';
import SettingsModal from './ui/SettingsModal';
// --- MAIN UI COMPONENT ---
const MainUI = ({
    activeChat, // New prop
    onSetActiveChat, // New prop
    currentUser,
    users,
    posts,
    resources, // New prop
    chats,
    notifications,
    viewingProfile,
    theme,
    onLogout,
    onAddPost,
    onDeleteResource, // New prop
    onDeletePost,
    onDeleteUser,
    onAddMessage,
    onStartChat,
    onCreateGroup,
    onDeleteGroup, // Added this prop
    onCreateRoom,
    onJoinRoom,
    onManageRoomMembers,
    onUpdateRoomSettings,
    onDeleteRoom,
    onUpdateUser,
    onToggleUserStatus,
    onViewProfile,
    onBackToFeed,
    onToggleFollow,
    onToggleLike,
    onDeleteComment, // New prop
    onAddComment,
    onToggleTheme,
    onMarkNotificationsAsRead,
    onMarkChatAsRead
}) => {
    const [activeView, setActiveView] = useState('feed'); // 'feed', 'chat', 'notices', 'resources'
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
    const [isCreateRoomModalOpen, setIsCreateRoomModalOpen] = useState(false);
    const [isJoinRoomModalOpen, setIsJoinRoomModalOpen] = useState(null);
    const [isManageRoomModalOpen, setIsManageRoomModalOpen] = useState(null);
    const [viewingPost, setViewingPost] = useState(null); // For post detail modal
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [attachedImage, setAttachedImage] = useState(null);
    const [attachedFile, setAttachedFile] = useState(null);
    const [sharedSecrets, setSharedSecrets] = useState(new Map());
    const chatEndRef = useRef(null);
    const notificationsRef = useRef(null);
    const profileMenuRef = useRef(null);
    const chatImageInputRef = useRef(null);
    const chatFileInputRef = useRef(null);
    const userNotifications = notifications.filter(n => n.recipientId === currentUser.id);
    const unreadCount = userNotifications.filter(n => !n.read).length;

    const { announcements, regularPosts } = useMemo(() => {
        const announcements = posts.filter(p => p.isAnnouncement).sort((a, b) => b.id - a.id);
        const regularPosts = posts.filter(p => !p.isAnnouncement).sort((a, b) => b.id - a.id);
        return { announcements, regularPosts };
    }, [posts]);

    const sortedResources = useMemo(() => {
        return [...resources].sort((a, b) => b.id - a.id);
    }, [resources]);

    // State for chat-specific UI elements, moved to top level to follow Rules of Hooks
    const [isChatMenuOpen, setIsChatMenuOpen] = useState(false);
    const chatMenuRef = useRef(null);
    const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
    const attachmentMenuRef = useRef(null);
    const sortedChats = [...chats].filter(c => c.participants.some(p => p.id === currentUser.id)).sort((a, b) => (b.messages[b.messages.length - 1]?.id ?? 0) - (a.messages[a.messages.length - 1]?.id ?? 0));
    const joinableRooms = chats.filter(c => c.type === 'room' && c.roomPrivacy === 'password_protected' && !c.participants.some(p => p.id === currentUser.id));
    const handleChatImageSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAttachedImage(reader.result);
                setAttachedFile(null);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    const handleChatFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            setAttachedFile(e.target.files[0]);
            setAttachedImage(null);
        }
    };
    const handleSendMessage = async (textToSend) => {
        const messageContent = textToSend ?? message;
        if ((!messageContent.trim() && !attachedImage && !attachedFile) || !currentUser || !activeChat)
            return;
        setIsSending(true);
        const contentPayload = {
            text: messageContent,
            imageUrl: attachedImage || undefined,
            fileName: attachedFile?.name,
            fileUrl: attachedFile ? URL.createObjectURL(attachedFile) : undefined
        };
        let finalMessage;
        if (activeChat.type === 'group' || activeChat.type === 'room') {
            finalMessage = {
                id: Date.now(),
                senderId: currentUser.id,
                content: contentPayload,
                timestamp: 'Just now',
            };
        }
        else { // Private chat
            const sharedSecret = sharedSecrets.get(activeChat.id);
            if (!sharedSecret) {
                alert("Cannot send message: secure connection not established.");
                setIsSending(false);
                return;
            }
            const encryptedData = await cryptoService.encrypt(sharedSecret, JSON.stringify(contentPayload));
            finalMessage = {
                id: Date.now(),
                senderId: currentUser.id,
                encryptedData,
                timestamp: 'Just now',
            };
        }
        onAddMessage(activeChat.id, finalMessage, contentPayload.text);
        if (textToSend === undefined)
            setMessage('');
        setAttachedImage(null);
        setAttachedFile(null);
        if (chatImageInputRef.current)
            chatImageInputRef.current.value = "";
        if (chatFileInputRef.current)
            chatFileInputRef.current.value = "";
        setIsSending(false);
    };
    const handleSelectChat = (chat) => {
        setActiveView('chat');
        onBackToFeed(); // Clear any profile view
        onSetActiveChat(chat);
        if (chat.type === 'private') {
            const partner = chat.participants.find(p => p.id !== currentUser.id);
            if (partner && currentUser.publicKeyJwk && partner.publicKeyJwk && !sharedSecrets.has(chat.id)) {
                cryptoService.deriveSharedSecret(currentUser.id, partner.publicKeyJwk)
                    .then(secret => setSharedSecrets(prev => new Map(prev).set(chat.id, secret)))
                    .catch(err => console.error("Failed to derive shared secret:", err));
            }
        }
        if (chat.unreadCounts[currentUser.id] > 0) {
            onMarkChatAsRead(chat.id);
        }
        // Close menus when switching chats
        setIsChatMenuOpen(false);
        setIsAttachmentMenuOpen(false);
    };

    // Click outside handler for chat menus
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (chatMenuRef.current && !chatMenuRef.current.contains(event.target)) setIsChatMenuOpen(false);
            if (attachmentMenuRef.current && !attachmentMenuRef.current.contains(event.target)) setIsAttachmentMenuOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    })
    // When chats array changes, if the active chat is deleted, close it.
    useEffect(() => {
        if (activeChat) {
            const updatedChat = chats.find(c => c.id === activeChat.id);
            if (!updatedChat) {
                onSetActiveChat(null);
            }
        }
    }, [chats, activeChat, onSetActiveChat]);
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeChat?.messages]);
    useEffect(() => {
        if (viewingProfile) {
            setActiveView('feed'); // Keep chat active in the background
        }
    }, [viewingProfile]);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setIsNotificationsOpen(false);
            }
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setIsProfileMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    const mainContent = () => {
        if (activeView === 'feed') {
            return (<div className="animate-fade-in">
                <CreatePost onAddPost={onAddPost} currentUser={currentUser} />
                <div className="space-y-4">
                    {regularPosts.map(post => <PostCard key={post.id} post={post} currentUser={currentUser} onDeletePost={onDeletePost} onViewProfile={onViewProfile} onToggleLike={onToggleLike} onAddComment={onAddComment} />)}
                </div>
            </div>);
        }
        if (activeView === 'notices') {
            return (<div className="animate-fade-in">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200 flex items-center"><MegaphoneIcon className="h-6 w-6 mr-3 text-primary" /> Notices & Announcements</h2>
                {currentUser.role === 'admin' && <CreatePost onAddPost={onAddPost} currentUser={currentUser} />}
                <div className="space-y-4">
                    {announcements.length > 0 ? (
                        announcements.map(post => <PostCard key={post.id} post={post} currentUser={currentUser} onDeletePost={onDeletePost} onViewProfile={onViewProfile} onToggleLike={onToggleLike} onAddComment={onAddComment} />)
                    ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400 mt-8">No announcements right now.</p>
                    )}
                </div>
            </div>);
        }
        if (activeView === 'resources') { // This is the ResourceUploadForm
            return (<div className="animate-fade-in">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200 flex items-center"><FolderIcon className="h-6 w-6 mr-3 text-primary" /> Resource Hub</h2>
                <ResourceUploadForm onAddPost={onAddPost} />
                <div className="space-y-4">
                    {sortedResources.length > 0 ? (
                        sortedResources.map(resource => (
                            <div key={resource.id} className="bg-white dark:bg-secondary p-4 rounded-2xl shadow-sm flex justify-between items-center">
                                <div className="flex items-center space-x-4">
                                    <FileTextIcon className="w-8 h-8 text-primary" />
                                    <div>
                                        <a href={resource.fileUrl} download={resource.fileName} className="font-semibold text-primary dark:text-accent hover:underline">{resource.fileName}</a>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Uploaded by {resource.author.name} &bull; {new Date(resource.id).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                {currentUser.role === 'admin' && <button onClick={() => onDeleteResource(resource.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition" title={`Delete ${resource.fileName}`}><TrashIcon className="h-5 w-5" /></button>}
                            </div>))
                    ) : (<p className="text-center text-gray-500 dark:text-gray-400 mt-8">No resources have been uploaded yet.</p>)}
                </div>
            </div>);
        }
        if (activeView === 'chat') {
            if (!activeChat) {
                return (<div className="h-full flex flex-col items-center justify-center bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-3xl shadow-glass border border-white/20 dark:border-slate-700/30 text-center p-8 animate-fade-in">
                    <div className="bg-primary/10 p-6 rounded-full mb-6 animate-blob">
                        <MessageIcon className="h-16 w-16 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Your Messages</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto">Select a conversation from the sidebar to start chatting securely.</p>
                </div>);
            }
            const isGroup = activeChat.type === 'group';
            const isRoom = activeChat.type === 'room';
            const chatPartner = !isGroup && !isRoom ? activeChat.participants.find(p => p.id !== currentUser.id) : null;
            const chatName = isGroup || isRoom ? activeChat.name : chatPartner?.name;
            const chatAvatar = isGroup || isRoom ? null : chatPartner;
            const isGroupAdmin = isGroup && activeChat.adminId === currentUser.id;
            const isRoomAdmin = isRoom && activeChat.adminId === currentUser.id;
            const sharedSecret = sharedSecrets.get(activeChat.id);
            const canSendMessage = isRoom ? activeChat.messagingPermission === 'all' || isRoomAdmin : true;
            const canShareMedia = isRoom ? activeChat.mediaSharePermission === 'all' || isRoomAdmin : true;
            return (<div className="h-full flex flex-col bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-glass border border-white/20 dark:border-slate-700/30 overflow-hidden">
                <div className="p-4 border-b border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
                    <div className="flex items-center space-x-3">
                        {isGroup ? <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center"><UsersIcon className="h-6 w-6 text-primary" /></div> : isRoom ? <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center"><HashtagIcon className="h-6 w-6 text-green-500" /></div> : <UserAvatar user={chatAvatar} />}
                        <div>
                            <p className="font-semibold text-gray-800 dark:text-white">{chatName}</p>
                            {isGroup || isRoom ? (
                                <p className="text-xs text-gray-400">{activeChat.participants.length} members</p>
                            ) : (
                                <p className={`text-xs font-medium ${chatPartner?.isOnline ? 'text-green-500' : 'text-gray-400'}`}>
                                    {chatPartner?.isOnline ? 'Online' : 'Offline'}
                                </p>
                            )}
                        </div>
                    </div>
                    {(isGroupAdmin || isRoomAdmin) && (
                        <div ref={chatMenuRef} className="relative">
                            <button onClick={() => setIsChatMenuOpen(p => !p)} className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                                <Cog6ToothIcon className="h-6 w-6" />
                            </button>
                            {isChatMenuOpen && (
                                <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 z-10 p-2">
                                    {isRoomAdmin && (
                                        <button onClick={() => { setIsManageRoomModalOpen(activeChat); setIsChatMenuOpen(false); }} className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                                            <Cog6ToothIcon className="h-5 w-5" />
                                            <span>Manage Room</span>
                                        </button>
                                    )}
                                    {isGroupAdmin && (
                                        <button
                                            onClick={() => { if (window.confirm(`Are you sure you want to delete the group "${activeChat.name}"? This cannot be undone.`)) { onDeleteGroup(activeChat.id); } setIsChatMenuOpen(false); }}
                                            className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                            <span>Delete Group</span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {activeChat.type === 'private' && !sharedSecret && <div className="text-center text-xs text-gray-400 italic">Establishing secure connection...</div>}
                    {activeChat.messages.map((msg) => (<ChatMessage key={msg.id} message={msg} secret={sharedSecret} currentUser={currentUser} allUsers={users} />))}
                    <div ref={chatEndRef} />
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700">
                    <div className="p-4 space-y-2">
                        {(attachedImage || attachedFile) && (<div className="p-2 bg-gray-100 dark:bg-gray-700/50 rounded-lg relative">
                            <div className="flex items-center space-x-2">
                                {attachedImage && <img src={attachedImage} alt="preview" className="h-12 w-12 rounded object-cover" />}
                                {attachedFile && (<>
                                    <PaperclipIcon className="h-6 w-6 text-gray-500 flex-shrink-0" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{attachedFile.name}</span>
                                </>)}
                            </div>
                            <button onClick={() => { setAttachedImage(null); setAttachedFile(null); }} className="absolute top-1 right-1 bg-gray-500 bg-opacity-50 text-white rounded-full p-0.5 hover:bg-opacity-75" aria-label="Remove attachment">
                                <XIcon className="h-4 w-4" />
                            </button>
                        </div>)}

                        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="relative flex items-center">
                            <div ref={attachmentMenuRef} className="relative">
                                <button type="button" onClick={() => setIsAttachmentMenuOpen(p => !p)} className="p-3 text-gray-500 hover:text-primary transition rounded-full disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Attach file" disabled={!canShareMedia}>
                                    <PlusIcon className="h-6 w-6" />
                                </button>
                                {isAttachmentMenuOpen && (
                                    <div className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 z-10 p-2">
                                        <button type="button" onClick={() => { chatImageInputRef.current?.click(); setIsAttachmentMenuOpen(false); }} className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                                            <PhotoIcon className="h-5 w-5" />
                                            <span>Image</span>
                                        </button>
                                        <button type="button" onClick={() => { chatFileInputRef.current?.click(); setIsAttachmentMenuOpen(false); }} className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                                            <PaperclipIcon className="h-5 w-5" />
                                            <span>File</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            <input type="file" accept="image/*" ref={chatImageInputRef} onChange={handleChatImageSelect} className="hidden" disabled={!canShareMedia} />
                            <input type="file" ref={chatFileInputRef} onChange={handleChatFileSelect} className="hidden" disabled={!canShareMedia} />
                            <div className="relative flex-1">
                                <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700 rounded-full py-3 pl-4 pr-12 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300 disabled:placeholder:text-gray-400" placeholder={!canSendMessage ? 'Only admins can send messages' : (isGroup || isRoom ? `Message #${chatName}` : `Type an encrypted message...`)} disabled={isSending || (activeChat.type === 'private' && !sharedSecret) || !canSendMessage} />
                                <button type="submit" disabled={isSending || (activeChat.type === 'private' && !sharedSecret) || (!message.trim() && !attachedImage && !attachedFile)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-primary text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary" aria-label="Send message">
                                    <SendIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>);
        }
        return null;
    };
    const NavItem = ({ icon, label, isActive, onClick, badgeCount }) => (
        <button
            onClick={onClick}
            className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-300 relative group ${isActive
                ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-[1.02]'
                : 'text-slate-500 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-slate-800/80 hover:shadow-md hover:scale-[1.02]'
                }`}
        >
            <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                {icon}
            </div>
            <span className={`font-semibold hidden lg:inline flex-grow text-left tracking-wide ${isActive ? '' : 'group-hover:text-gray-800 dark:group-hover:text-gray-200'}`}>{label}</span>
            {badgeCount !== undefined && (
                <span className={`hidden lg:inline-flex items-center justify-center text-xs font-bold rounded-full h-5 min-w-[1.25rem] px-1.5 transition-colors ${isActive
                    ? 'bg-white text-primary'
                    : badgeCount > 0
                        ? 'bg-red-500 text-white shadow-sm'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300'
                    }`}>
                    {badgeCount > 99 ? '99+' : badgeCount}
                </span>
            )}
            {/* Mobile dot indicator */}
            {badgeCount !== undefined && badgeCount > 0 && (
                <span className="absolute top-3 right-3 block lg:hidden h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white dark:border-secondary animate-pulse"></span>
            )}
        </button>
    );
    const NotificationItem = ({ notification, onClick }) => {
        let text = '';
        switch (notification.type) {
            case 'like':
                text = <><strong>{notification.triggeringUser.name}</strong> liked your post.</>;
                break;
            case 'comment':
                text = <><strong>{notification.triggeringUser.name}</strong> commented on your post.</>;
                break;
            case 'message':
                text = (<>
                    <strong>{notification.triggeringUser.name}</strong>
                    {notification.messageContent
                        ? `: "${notification.messageContent}"`
                        : " sent you a message."}
                </>);
                break;
        }
        return (<button onClick={onClick} className="w-full flex items-start space-x-3 p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition">
            <UserAvatar user={notification.triggeringUser} className="h-10 w-10 flex-shrink-0" />
            <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 dark:text-gray-200 truncate">{text}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{notification.timestamp}</p>
            </div>
            {!notification.read && <div className="w-2.5 h-2.5 bg-primary rounded-full self-center flex-shrink-0"></div>}
        </button>);
    };
    const ResourceUploadForm = ({ onAddPost }) => { // This is the ResourceUploadForm
        const [file, setFile] = useState(null);
        const [isUploading, setIsUploading] = useState(false);
        const fileInputRef = useRef(null);
    
        const handleFileChange = (e) => {
            if (e.target.files && e.target.files[0]) {
                setFile(e.target.files[0]);
            }
        };
    
        const handleSubmit = async (e) => {
            e.preventDefault();
            if (!file) return;
    
            setIsUploading(true);
            // In a real app, you'd upload to a server and get a URL.
            // Here, we'll simulate it with a blob URL.
            const fileUrl = URL.createObjectURL(file);
    
            await onAddPost({ 
                fileUrl: fileUrl, 
                fileName: file.name,
                content: '' 
            });
    
            setIsUploading(false);
            setFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        };
    
        return (
            <div className="bg-white dark:bg-secondary p-4 rounded-2xl shadow-sm mb-6">
                <form onSubmit={handleSubmit} className="flex items-center space-x-4">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary dark:file:bg-primary/20 dark:file:text-accent hover:file:bg-primary/20 transition" />
                    <button type="submit" disabled={!file || isUploading} className="bg-primary text-white px-4 py-2 rounded-full hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2 transition">
                        <UploadCloudIcon size={18} className="h-5 w-5" /> <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
                    </button>
                </form>
            </div>
        );
    };
    const userSearchQueryTrimmed = userSearchQuery.trim().toLowerCase();
    const isSearching = userSearchQueryTrimmed !== '';
    let usersToShow;
    if (isSearching) {
        usersToShow = users.filter(user => user.id !== currentUser.id &&
            user.name.toLowerCase().includes(userSearchQueryTrimmed) &&
            (currentUser.role === 'admin' || user.status === 'active'));
    }
    else {
        if (currentUser.role === 'admin') {
            usersToShow = users.filter(u => u.id !== currentUser.id);
        }
        else {
            usersToShow = users.filter(u => u.id !== currentUser.id &&
                u.status === 'active' &&
                !currentUser.following.includes(u.id)).slice(0, 5);
        }
    }
    const totalUnreadMessages = chats.reduce((acc, chat) => {
        if (chat.participants.some(p => p.id === currentUser.id)) {
            return acc + (chat.unreadCounts[currentUser.id] || 0);
        }
        return acc;
    }, 0);
    return (<>
        {isCreateGroupModalOpen && (<CreateGroupModal currentUser={currentUser} users={users} onCreateGroup={onCreateGroup} onClose={() => setIsCreateGroupModalOpen(false)} />)}
        {isCreateRoomModalOpen && (<CreateRoomModal onCreateRoom={onCreateRoom} onClose={() => setIsCreateRoomModalOpen(false)} />)}
        {isJoinRoomModalOpen && (<JoinRoomModal roomName={isJoinRoomModalOpen.name || 'this room'} onClose={() => setIsJoinRoomModalOpen(null)} onJoin={async (password) => {
            const success = await onJoinRoom(isJoinRoomModalOpen.id, password);
            if (success) {
                // @ts-ignore
                handleSelectChat(chats.find(c => c.id === isJoinRoomModalOpen.id)); // Use updated chat object
                setIsJoinRoomModalOpen(null);
                return true;
            }
            else {
                alert('Incorrect password. Please try again.');
                return false;
            }
        }} />)}
        {isManageRoomModalOpen && (<ManageRoomModal room={isManageRoomModalOpen} allUsers={users} currentUser={currentUser} onClose={() => setIsManageRoomModalOpen(null)} onSaveMembers={onManageRoomMembers} onSaveSettings={onUpdateRoomSettings} onDeleteRoom={onDeleteRoom} />)}
        {viewingPost && <PostDetailModal post={viewingPost} currentUser={currentUser} onClose={() => setViewingPost(null)} onAddComment={onAddComment} onDeleteComment={onDeleteComment} />}
        {isSettingsModalOpen && (<SettingsModal currentUser={currentUser} onUpdateUser={onUpdateUser} onClose={() => setIsSettingsModalOpen(false)} />)}
        <div className="min-h-screen bg-light dark:bg-dark text-gray-800 dark:text-gray-200 font-sans transition-colors duration-300">
            <div className="container mx-auto grid grid-cols-12 gap-4 md:gap-6 p-2 md:p-4">
                {/* Left Sidebar */}
                <aside className="col-span-2 lg:col-span-2 hidden sm:block z-20">
                    <div className="sticky top-4 flex flex-col h-[calc(100vh-2rem)]">
                        <div className="flex justify-center lg:justify-start items-center p-2 space-x-3 mb-6">
                            <div className="bg-primary/10 p-2 rounded-xl">
                                <LogoIcon className="h-8 w-8 text-primary" />
                            </div>
                            <span className="text-2xl font-bold hidden lg:inline bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">Connect</span>
                        </div>
                        <nav className="space-y-2 mt-4">
                            <NavItem icon={<HomeIcon className="h-6 w-6" />} label="Home" isActive={activeView === 'feed' && !viewingProfile} onClick={() => { setActiveView('feed'); onBackToFeed(); }} />
                            <NavItem icon={<MegaphoneIcon className="h-6 w-6" />} label="Notices" isActive={activeView === 'notices'} onClick={() => { setActiveView('notices'); onBackToFeed(); }} />
                            <NavItem icon={<FolderIcon className="h-6 w-6" />} label="Resources" isActive={activeView === 'resources'} onClick={() => { setActiveView('resources'); onBackToFeed(); }} />
                            <NavItem icon={<MessageIcon className="h-6 w-6" />} label="Messages" isActive={activeView === 'chat'} onClick={() => { setActiveView('chat'); onBackToFeed(); }} badgeCount={totalUnreadMessages} />
                            <div ref={notificationsRef} className="relative">
                                <NavItem icon={<BellIcon className="h-6 w-6" />} label="Notifications" isActive={isNotificationsOpen} onClick={() => {
                                    setIsNotificationsOpen(!isNotificationsOpen);
                                    if (!isNotificationsOpen)
                                        onMarkNotificationsAsRead();
                                }} badgeCount={unreadCount} />
                                {isNotificationsOpen && (<div className="absolute left-0 sm:left-full top-0 sm:top-auto sm:bottom-0 ml-0 sm:ml-2 mt-14 sm:mt-0 w-full sm:w-96 bg-white dark:bg-secondary rounded-lg shadow-2xl border dark:border-gray-700 z-30 max-h-[70vh] flex flex-col">
                                    <div className="p-4 border-b dark:border-gray-700">
                                        <h3 className="font-bold text-lg">Notifications</h3>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-2">
                                        {userNotifications.length > 0 ? (userNotifications.map(n => (<NotificationItem key={n.id} notification={n} onClick={() => {
                                            setIsNotificationsOpen(false);
                                            if (n.type === 'message') {
                                                const chat = chats.find(c => c.type === 'private' && c.participants.some(p => p.id === n.triggeringUser.id));
                                                if (chat)
                                                    handleSelectChat(chat);
                                            }
                                            else if (n.post) {
                                                onViewProfile(n.triggeringUser);
                                            }
                                        }} />))) : (<p className="p-4 text-center text-sm text-gray-500">You have no notifications yet.</p>)}
                                    </div>
                                </div>)}
                            </div>
                        </nav>
                        <div className="flex-grow"></div>
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-auto">
                            <button onClick={onToggleTheme} className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-slate-500 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-slate-800/80 hover:shadow-md transition-all duration-300 group" aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
                                {theme === 'light' ? <MoonIcon className="h-6 w-6 group-hover:text-primary transition-colors" /> : <SunIcon className="h-6 w-6 group-hover:text-accent transition-colors" />}
                                <span className="font-semibold hidden lg:inline">
                                    {theme === 'light' ? 'Dark' : 'Light'} Mode
                                </span>
                            </button>

                            <div ref={profileMenuRef} className="relative mt-2">
                                {isProfileMenuOpen && (<div className="absolute bottom-full left-0 right-0 mb-2 w-full bg-white dark:bg-secondary rounded-lg shadow-lg border dark:border-gray-700 p-2 z-40">
                                    <ul className="space-y-1">
                                        <li>
                                            <button onClick={() => { onViewProfile(currentUser); setIsProfileMenuOpen(false); }} className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                                                <UserIcon className="h-5 w-5" />
                                                <span className="font-semibold">View Profile</span>
                                            </button>
                                        </li>
                                        <li>
                                            <button onClick={() => { setIsSettingsModalOpen(true); setIsProfileMenuOpen(false); }} className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                                                <Cog6ToothIcon className="h-5 w-5" />
                                                <span className="font-semibold">Settings</span>
                                            </button>
                                        </li>
                                        <li>
                                            <button onClick={onLogout} className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors">
                                                <LogoutIcon className="h-5 w-5" />
                                                <span className="font-semibold">Logout</span>
                                            </button>
                                        </li>
                                    </ul>
                                </div>)}
                                <button onClick={() => setIsProfileMenuOpen(prev => !prev)} className="flex items-center space-x-3 p-2 w-full hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-2xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 mt-4">
                                    <UserAvatar user={currentUser} />
                                    <div className="hidden lg:inline text-left">
                                        <p className="font-semibold text-sm">{currentUser.name}</p>
                                        <p className="text-xs text-gray-500">{currentUser.role}</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="col-span-12 sm:col-span-10 lg:col-span-7 h-[calc(100vh-5rem)] sm:h-[calc(100vh-2rem)] overflow-y-auto pr-2">
                    {viewingProfile ? (<ProfilePage profileUser={viewingProfile} currentUser={currentUser} allPosts={posts} onBack={onBackToFeed} onDeletePost={onDeletePost} onViewProfile={onViewProfile} onToggleFollow={onToggleFollow} onToggleLike={onToggleLike} onAddComment={onAddComment} onUpdateUser={onUpdateUser} onStartChat={(user) => {
                        const chat = chats.find(c => c.type === 'private' && c.participants.some(p => p.id === user.id));
                        if (chat)
                            handleSelectChat(chat);
                        else
                            onStartChat(user);
                    }} />) : mainContent()}
                </main>

                {/* Right Sidebar */}
                <aside className="col-span-3 hidden lg:block">
                    <div className="sticky top-4 space-y-6">
                        <div className="glass rounded-3xl p-5 animate-slide-in-right">
                            <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-white">
                                {isSearching ? 'Search Results' : (currentUser.role === 'admin' ? 'Manage Users' : 'Discover People')}
                            </h3>
                            <div className="relative mb-4">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                    <SearchIcon className="h-5 w-5" />
                                </span>
                                <input type="text" value={userSearchQuery} onChange={(e) => setUserSearchQuery(e.target.value)} placeholder="Search users..." className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-2 border-transparent focus:border-primary rounded-full focus:outline-none focus:ring-0 transition" />
                            </div>
                            <div className="space-y-4">
                                {usersToShow.length > 0 ? (usersToShow.map(user => {
                                    const isFollowing = currentUser.following.includes(user.id);
                                    return (<div key={user.id} className="flex items-center justify-between">
                                        <button onClick={() => onViewProfile(user)} className="flex items-center space-x-3 group text-left">
                                            <UserAvatar user={user} />
                                            <div>
                                                <p className="font-semibold text-sm text-gray-800 dark:text-white group-hover:underline">{user.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">@{user.name.toLowerCase().replace(/\s+/g, '')}</p>
                                            </div>
                                        </button>
                                        {currentUser.role === 'admin' ? (<div className="flex items-center space-x-1">
                                            {user.status === 'active' ? (<button onClick={() => onToggleUserStatus(user.id)} className="p-2 text-gray-400 hover:text-orange-500 rounded-full hover:bg-orange-100 dark:hover:bg-orange-900/50 transition" title={`Revoke ${user.name}`}>
                                                <BanIcon className="h-4 w-4" />
                                            </button>) : (<button onClick={() => onToggleUserStatus(user.id)} className="p-2 text-gray-400 hover:text-green-500 rounded-full hover:bg-green-100 dark:hover:bg-green-900/50 transition" title={`Activate ${user.name}`}>
                                                <UserCheckIcon className="h-4 w-4" />
                                            </button>)}
                                            <button onClick={() => {
                                                if (window.confirm(`Are you sure you want to permanently delete ${user.name}? This cannot be undone.`))
                                                    onDeleteUser(user.id);
                                            }} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition" title={`Delete ${user.name}`}>
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>) : (<button onClick={() => onToggleFollow(user.id)} className={`text-sm font-semibold px-4 py-1 rounded-full transition ${isFollowing ? 'bg-primary text-white' : 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-indigo-400 hover:bg-primary/20'}`}>
                                            {isFollowing ? 'Following' : 'Follow'}
                                        </button>)}
                                    </div>);
                                })) : (<p className="text-sm text-center text-gray-500 dark:text-gray-400 py-4">
                                    {isSearching ? 'No users found.' : 'No users to show.'}
                                </p>)}
                            </div>
                        </div>
                        <div className="glass rounded-3xl p-5 animate-slide-in-right animation-delay-1000">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg text-gray-800 dark:text-white">Announcements</h3>
                                <button onClick={() => { setActiveView('notices'); onBackToFeed(); }} className="text-sm font-semibold text-primary dark:text-accent hover:underline">
                                    View All
                                </button>
                            </div>
                            <div className="space-y-3 max-h-48 overflow-y-auto">
                                {announcements.length > 0 ? (announcements.slice(0, 3).map(post => (
                                    <button key={post.id} onClick={() => setViewingPost(post)} className="w-full text-left p-3 rounded-xl bg-primary/5 dark:bg-primary/10 hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors">
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{post.author.name}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{post.content}</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{post.timestamp}</p>
                                    </button>
                                ))) : (
                                    <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-4">No recent announcements.</p>
                                )}
                            </div>
                        </div>
                        <div className="glass rounded-3xl p-5 animate-slide-in-right animation-delay-2000">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg text-gray-800 dark:text-white">Messages</h3>
                                <div className="flex items-center space-x-1">
                                    <button onClick={() => setIsCreateRoomModalOpen(true)} className="p-2 text-gray-400 hover:text-primary rounded-full hover:bg-primary/10 transition" title="Create a new room">
                                        <HashtagIcon className="h-5 w-5" />
                                    </button>
                                    <button onClick={() => setIsCreateGroupModalOpen(true)} className="p-2 text-gray-400 hover:text-primary rounded-full hover:bg-primary/10 transition" title="Create a new group">
                                        <PlusIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-1 max-h-60 overflow-y-auto">
                                {sortedChats.map(chat => {
                                    const unreadCount = chat.unreadCounts[currentUser.id] || 0;
                                    const isGroup = chat.type === 'group';
                                    const isRoom = chat.type === 'room';
                                    const chatPartner = !isGroup && !isRoom ? chat.participants.find(p => p.id !== currentUser.id) : null;
                                    return (<button key={chat.id} onClick={() => handleSelectChat(chat)} className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all text-left group ${activeChat?.id === chat.id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-transparent'}`}>
                                        {isGroup ? <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0"><UsersIcon className="h-6 w-6 text-primary" /></div> : isRoom ? <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0"><HashtagIcon className="h-6 w-6 text-green-500" /></div> : <UserAvatar user={chatPartner} />}
                                        <div className="flex-1 overflow-hidden">
                                            <p className={`font-semibold text-sm truncate ${unreadCount > 0 ? 'font-bold text-gray-900 dark:text-white' : ''}`}>
                                                {isGroup || isRoom ? chat.name : chatPartner?.name}
                                            </p>
                                            <p className={`text-xs truncate ${unreadCount > 0 ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500'}`}>
                                                {chat.messages[chat.messages.length - 1]?.content?.text || (chat.messages.length > 0 ? 'Encrypted Message' : 'No messages yet')}
                                            </p>
                                        </div>
                                        {unreadCount > 0 && (<span className="flex-shrink-0 h-5 w-5 flex items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>)}
                                    </button>);
                                })}
                            </div>
                        </div>
                        {joinableRooms.length > 0 && (
                            <div className="glass rounded-3xl p-5 animate-slide-in-right animation-delay-4000">
                                <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-4">Discover Rooms</h3>
                                <div className="space-y-2">
                                    {joinableRooms.map(room => (<div key={room.id} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0"><LockClosedIcon className="h-6 w-6 text-orange-500" /></div>
                                            <p className="font-semibold text-sm">{room.name}</p>
                                        </div>
                                        <button onClick={() => setIsJoinRoomModalOpen(room)} className="text-sm font-semibold px-4 py-1 rounded-full transition bg-primary/10 text-primary dark:bg-primary/20 dark:text-indigo-400 hover:bg-primary/20">
                                            Join
                                        </button>
                                    </div>))}
                                </div>
                            </div>)}
                    </div>
                </aside>

                {/* Mobile Bottom Nav */}
                <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-secondary/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 flex justify-around p-1 z-50">
                    <button onClick={() => { setActiveView('feed'); onBackToFeed(); }} className={`p-3 rounded-2xl transition-colors ${activeView === 'feed' && !viewingProfile ? 'text-primary bg-primary/10' : 'text-gray-500'}`}><HomeIcon className="h-7 w-7" /></button>
                    <button onClick={() => { setActiveView('chat'); onBackToFeed(); }} className={`p-3 rounded-2xl transition-colors ${activeView === 'chat' ? 'text-primary bg-primary/10' : 'text-gray-500'}`}><MessageIcon className="h-7 w-7" /></button>
                    <button onClick={() => { onViewProfile(currentUser); }} className="p-3 rounded-2xl text-gray-500"><UserIcon className="h-7 w-7" /></button>
                    <button onClick={onLogout} className="p-3 rounded-2xl text-gray-500"><LogoutIcon className="h-7 w-7" /></button>
                </nav>
            </div >
        </div >
    </>);
};
const PostDetailModal = ({ post, currentUser, onClose, onAddComment, onDeleteComment }) => {
    const [comment, setComment] = useState('');
    const modalRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (!comment.trim()) return;
        onAddComment(post.id, comment);
        setComment('');
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-fast">
            <div ref={modalRef} className="bg-white dark:bg-secondary rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <UserAvatar user={post.author} />
                        <div>
                            <p className="font-semibold">{post.author.name}</p>
                            <p className="text-xs text-gray-500">{post.timestamp}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><XIcon className="h-6 w-6" /></button>
                </div>

                <div className="p-4 overflow-y-auto">
                    <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{post.content}</p>
                    {post.imageUrl && <img src={post.imageUrl} alt="Post" className="mt-4 rounded-lg w-full" />}
                    <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-4">
                        <span>{post.likedBy.length} Likes</span>
                        <span>{post.comments.length} Comments</span>
                    </div>
                </div>

                <div className="p-4 border-t dark:border-gray-700 space-y-4 overflow-y-auto">
                    {post.comments.map(c => (
                        <div key={c.id} className="flex items-start space-x-3">
                            <UserAvatar user={c.author} className="h-8 w-8 flex-shrink-0" />
                            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-xl flex-1">
                                <p className="font-semibold text-sm">{c.author.name}</p>
                                <p className="text-sm text-gray-800 dark:text-gray-200">{c.content}</p>
                            </div>
                            {(currentUser.id === c.author.id || currentUser.role === 'admin') && (
                                <button 
                                    onClick={() => onDeleteComment(post.id, c.id)}
                                    className="p-2 text-gray-400 rounded-full opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 transition-opacity"
                                    title="Delete comment"
                                ><TrashIcon className="h-4 w-4" /></button>
                            )}
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t dark:border-gray-700 mt-auto">
                    <form onSubmit={handleCommentSubmit} className="flex items-center space-x-3">
                        <UserAvatar user={currentUser} className="h-8 w-8" />
                        <input type="text" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write a comment..." className="w-full bg-gray-100 dark:bg-gray-700 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary" />
                        <button type="submit" disabled={!comment.trim()} className="p-2 rounded-full bg-primary text-white disabled:opacity-50"><SendIcon className="h-5 w-5" /></button>
                    </form>
                </div>
            </div>
        </div>
    );
};
export default MainUI;
