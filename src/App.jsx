import React, { useState, useEffect } from 'react';
import AuthScreen from './components/LoginScreen';
import MainUI from './components/MainUI';
import WelcomeScreen from './components/WelcomeScreen';
import FloatingChatbot from './components/FloatingChatbot';
import SettingsModal from './SettingsModal';
import { auth, db, rtdb } from './services/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, deleteUser as deleteAuthUser, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { ref, onValue, set, onDisconnect, serverTimestamp as rtdbServerTimestamp } from "firebase/database";
import { doc, setDoc, getDoc, collection, getDocs, query, orderBy, addDoc, serverTimestamp, onSnapshot, updateDoc, arrayUnion, arrayRemove, where, runTransaction, deleteDoc, writeBatch } from 'firebase/firestore';

import * as cloudinaryService from './services/cloudinaryService';
import * as cryptoService from './services/cryptoService';
import { usePosts } from './services/usePosts';
import { useChat } from './services/useChat';

const App = () => {
    const [currentUser, setCurrentUser] = useState(undefined); // Use undefined to represent loading state
    const [users, setUsers] = useState([]);
    const [resources, setResources] = useState([]); // For the Resource Hub
    
    // chats and availableRooms state are now managed in useChat hook
    const [notifications, setNotifications] = useState([]);
    const [connectionRequests, setConnectionRequests] = useState([]);
    const [privacyMap, setPrivacyMap] = useState({});

    const addNotification = async (recipientId, type, triggeringUser, post, messageContent) => {
        if (recipientId === triggeringUser.id)
            return;

        // Prepare data for Firestore. Store IDs instead of large objects.
        const newNotification = {
            recipientId,
            type,
            triggeringUserId: triggeringUser.id,
            postId: post ? post.id : null,
            messageContent,
            read: false,
            timestamp: serverTimestamp(),
        };

        try {
            await addDoc(collection(db, "notifications"), newNotification);

            // Send email notification if enabled by recipient
            const recipient = users.find(u => u.id === recipientId);
            if (recipient && recipient.emailNotifications && recipient.email) {
                await addDoc(collection(db, "mail"), {
                    to: recipient.email,
                    message: {
                        subject: `New Notification: ${type}`,
                        html: `<p>You received a <strong>${type}</strong> from <strong>${triggeringUser.name}</strong>.</p><p>${messageContent || ''}</p>`
                    }
                });
            }
        } catch (error) {
            console.error("Error creating notification:", error);
        }
    };

    // Initialize useChat hook
    const {
        chats,
        availableRooms,
        addMessage,
        handleStartChat: startChat,
        handleCreateGroup,
        handleCreateRoom,
        handleJoinRoom,
        handleManageRoomMembers,
        handleUpdateRoomSettings,
        handleDeleteRoom,
        handleMarkChatAsRead
    } = useChat(currentUser, users, addNotification);

    const handleStartChat = async (participant) => {
        const chat = await startChat(participant);
        if (chat) {
            handleSetActiveChat(chat);
        }
    };
    const [viewingProfile, setViewingProfile] = useState(null);
    const [authStep, setAuthStep] = useState(() => sessionStorage.getItem('authStep') || 'welcome'); // 'welcome', 'auth'
    const [initialAuthView, setInitialAuthView] = useState(() => sessionStorage.getItem('initialAuthView') || 'login');
    const [authFlow, setAuthFlow] = useState(() => sessionStorage.getItem('authFlow') || null); // Can be 'admin' or 'participant'
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [_activeChat, _setActiveChat] = useState(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [theme, setTheme] = useState(() => {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) {
            return storedTheme;
        }
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        return prefersDark ? 'dark' : 'light';
    });

    const handleOpenSettingsModal = () => setIsSettingsModalOpen(true);
    const handleCloseSettingsModal = () => setIsSettingsModalOpen(false);

    const handleChangePassword = async (currentPassword, newPassword) => {
        if (!currentUser) {
            alert("No user is currently signed in.");
            return false;
        }

        const user = auth.currentUser;
        const credential = EmailAuthProvider.credential(user.email, currentPassword);

        try {
            // Re-authenticate the user to ensure they are the legitimate owner
            await reauthenticateWithCredential(user, credential);

            // If re-authentication is successful, update the password
            await updatePassword(user, newPassword);

            alert("Password updated successfully!");
            return true;
        } catch (error) {
            console.error("Error changing password:", error);
            let errorMessage = "An error occurred. Please try again.";
            if (error.code === 'auth/wrong-password') {
                errorMessage = "The current password you entered is incorrect.";
            }
            alert(`Failed to change password: ${errorMessage}`);
            return false;
        }
    };

    // Persist Auth UI State
    useEffect(() => { sessionStorage.setItem('authStep', authStep); }, [authStep]);
    useEffect(() => { sessionStorage.setItem('initialAuthView', initialAuthView); }, [initialAuthView]);
    useEffect(() => {
        if (authFlow) sessionStorage.setItem('authFlow', authFlow);
        else sessionStorage.removeItem('authFlow');
    }, [authFlow]);

    // Persist and Sync Active Chat
    useEffect(() => {
        const storedChatId = localStorage.getItem('activeChatId');
        if (chats.length > 0) {
            if (_activeChat) {
                // Sync existing active chat with real-time updates
                const updatedChat = chats.find(c => c.id === _activeChat.id);
                if (updatedChat) {
                    if (updatedChat !== _activeChat) _setActiveChat(updatedChat);
                } else {
                    // Chat was deleted or user removed
                    _setActiveChat(null);
                    localStorage.removeItem('activeChatId');
                }
            } else if (storedChatId) {
                // Restore active chat from storage
                const restoredChat = chats.find(c => c.id === storedChatId);
                if (restoredChat) _setActiveChat(restoredChat);
            }
        }
    }, [chats, _activeChat]);

    const handleSetActiveChat = (chat) => {
        _setActiveChat(chat);
        if (chat) localStorage.setItem('activeChatId', chat.id);
        else localStorage.removeItem('activeChatId');
    };

    // Fetch all users from Firestore on initial load

    useEffect(() => {
        if (!currentUser) {
            setUsers([]); // Clear users when logged out
            return;
        }
        const usersCollectionRef = collection(db, "users");
        const unsubscribe = onSnapshot(usersCollectionRef, (querySnapshot) => {
            const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(usersList);
            console.log("Real-time user data update received.");
        }, (error) => { console.error("Error fetching users:", error); if (error && error.code === 'permission-denied') { setUsers([]); /* alert('Insufficient permissions for users collection. Ensure Firestore rules allow reads for authenticated users.'); */ } }); // Added error handling
        return () => unsubscribe();
    }, [currentUser]);

    // Real-time presence system using Realtime Database
    useEffect(() => {
        if (!currentUser) return;

        const userStatusDatabaseRef = ref(rtdb, '/status/' + currentUser.id);
        const userStatusFirestoreRef = doc(db, '/users/' + currentUser.id);

        const isOfflineForDatabase = {
            isOnline: false,
            last_seen: rtdbServerTimestamp(),
        };

        const isOnlineForDatabase = {
            isOnline: true,
            last_seen: rtdbServerTimestamp(),
        };

        const connectedRef = ref(rtdb, '.info/connected');
        const unsubscribe = onValue(connectedRef, (snap) => {
            if (snap.val() === true) {
                onDisconnect(userStatusDatabaseRef).set(isOfflineForDatabase).then(() => {
                    set(userStatusDatabaseRef, isOnlineForDatabase);
                    // Update presence in userPrivacy doc instead of users doc
                    const userPrivacyRef = doc(db, 'userPrivacy', currentUser.id);
                    setDoc(userPrivacyRef, { isOnline: true, lastSeen: rtdbServerTimestamp() }, { merge: true });
                });
            }
        });

        return () => unsubscribe();
    }, [currentUser]);

    // Real-time listener for chats

    useEffect(() => {
        if (users.length === 0) return;

        const statusRef = ref(rtdb, 'status');
        const unsubscribe = onValue(statusRef, (snapshot) => {
            const statuses = snapshot.val();
            if (!statuses) return;
            users.forEach(user => {
                const userPrivacyRef = doc(db, 'userPrivacy', user.id);
                const onlineStatus = statuses[user.id]?.isOnline || false;
                // Only update if different to avoid extra writes
                // Note: We cannot compare against userPrivacy here easily; perform a write for truth
                setDoc(userPrivacyRef, { isOnline: onlineStatus }, { merge: true }).catch(err => {
                    // Ignore permission errors here; Firestore rules may prevent updates for other users
                    if (err.code !== 'permission-denied') console.error('Failed updating userPrivacy presence:', err);
                });
            });
        });
        return () => unsubscribe();
    }, [users]);

    // Listen for connection requests involving current user
    useEffect(() => {
        if (!currentUser) {
            setConnectionRequests([]);
            return;
        }
        const incomingQuery = query(collection(db, 'connectionRequests'), where('toId', '==', currentUser.id));
        const outgoingQuery = query(collection(db, 'connectionRequests'), where('fromId', '==', currentUser.id));
        const unsubIncoming = onSnapshot(incomingQuery, (qs) => {
            const items = qs.docs.map(d => ({ id: d.id, ...d.data() }));
            setConnectionRequests(prev => {
                // Merge with outgoing to keep full set
                const outgoing = prev.filter(r => r.fromId === currentUser.id);
                const merged = items.concat(outgoing.filter(o => !items.find(i => i.id === o.id)));
                return merged;
            });
        }, (error) => {
            console.error('ConnectionRequests incoming snapshot error:', error);
            if (error && error.code === 'permission-denied') {
                // Clear local state and notify developer/user
                setConnectionRequests([]);
                // Optional: show a friendly alert in dev/testing
                // alert('Permission denied: cannot read connection requests. Check Firestore rules.');
            }
        });
        const unsubOutgoing = onSnapshot(outgoingQuery, (qs) => {
            const items = qs.docs.map(d => ({ id: d.id, ...d.data() }));
            setConnectionRequests(prev => {
                const incoming = prev.filter(r => r.toId === currentUser.id);
                const merged = incoming.concat(items.filter(o => !incoming.find(i => i.id === o.id)));
                return merged;
            });
        }, (error) => {
            console.error('ConnectionRequests outgoing snapshot error:', error);
            if (error && error.code === 'permission-denied') {
                setConnectionRequests([]);
            }
        });

        // Also listen for userPrivacy docs so UI can show statusMessage / presence according to visibility
        const privacyQuery = collection(db, 'userPrivacy');
        const unsubPrivacy = onSnapshot(privacyQuery, (qs) => {
            const map = {};
            qs.docs.forEach(d => { map[d.id] = d.data(); });
            setPrivacyMap(map);
        }, (error) => {
            console.error('userPrivacy snapshot error:', error);
            if (error && error.code === 'permission-denied') {
                setPrivacyMap({});
            }
        });

        return () => { unsubIncoming(); unsubOutgoing(); unsubPrivacy(); };
    }, [currentUser]);

    // Connection request APIs
    const sendConnectionRequest = async (targetUserId) => {
        if (!currentUser || currentUser.id === targetUserId) return;
        try {
            await addDoc(collection(db, 'connectionRequests'), {
                fromId: currentUser.id,
                toId: targetUserId,
                status: 'pending',
                timestamp: serverTimestamp()
            });
            const target = users.find(u => u.id === targetUserId);
            if (target) await addNotification(targetUserId, 'connection_request', currentUser, null, `${currentUser.name} sent you a connection request.`);
        } catch (error) {
            console.error('Failed to send connection request', error);
            alert('Could not send connection request. Please try again.');
        }
    };

    const cancelConnectionRequest = async (requestId) => {
        try {
            await deleteDoc(doc(db, 'connectionRequests', requestId));
        } catch (error) {
            console.error('Failed to cancel connection request', error);
            alert('Could not cancel request. Please try again.');
        }
    };

    const acceptConnectionRequest = async (request) => {
        try {
            const reqRef = doc(db, 'connectionRequests', request.id);
            await updateDoc(reqRef, { status: 'accepted' });
            // Add each user to the other's connections
            const meRef = doc(db, 'users', currentUser.id);
            const otherRef = doc(db, 'users', request.fromId);
            await updateDoc(meRef, { connections: arrayUnion(request.fromId) });
            await updateDoc(otherRef, { connections: arrayUnion(currentUser.id) });
            const other = users.find(u => u.id === request.fromId);
            if (other) await addNotification(request.fromId, 'connection_accepted', currentUser, null, `${currentUser.name} accepted your connection request.`);
        } catch (error) {
            console.error('Failed to accept connection request', error);
            alert('Could not accept request. Please try again.');
        }
    };

    const declineConnectionRequest = async (request) => {
        try {
            const reqRef = doc(db, 'connectionRequests', request.id);
            await updateDoc(reqRef, { status: 'declined' });
            const other = users.find(u => u.id === request.fromId);
            if (other) await addNotification(request.fromId, 'connection_declined', currentUser, null, `${currentUser.name} declined your connection request.`);
        } catch (error) {
            console.error('Failed to decline connection request', error);
            alert('Could not decline request. Please try again.');
        }
    };

    // Real-time listener for notifications
    useEffect(() => {
        if (!currentUser || users.length === 0) {
            setNotifications([]);
            return;
        }

        const notificationsCollectionRef = collection(db, "notifications");
        const q = query(notificationsCollectionRef, where("recipientId", "==", currentUser.id), orderBy("timestamp", "desc"));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const notificationsList = querySnapshot.docs.map(doc => {
                const notificationData = doc.data();

                // Hydrate the triggering user's data
                const triggeringUser = users.find(u => u.id === notificationData.triggeringUserId) || { id: notificationData.triggeringUserId, name: 'Unknown User', avatar: '' };

                return {
                    id: doc.id,
                    ...notificationData,
                    timestamp: notificationData.timestamp?.toDate().toLocaleString() || 'Just now',
                    triggeringUser,
                    // The post object is not hydrated here to keep it simple,
                    // as it's only used for navigation. The postId is sufficient.
                };
            });
            setNotifications(notificationsList);
            console.log("Real-time notification update received from Firestore.");
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [currentUser, users]);

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

    // Listen for Firebase auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // User is signed in, see docs for a list of available properties
                // https://firebase.google.com/docs/reference/js/firebase.User
                console.log("Firebase user signed in:", user.uid);

                // Fetch user profile from Firestore
                const userDocRef = doc(db, "users", user.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    const userWithKeys = await ensureUserKeyPair(userData);
                    setCurrentUser(userWithKeys);
                } else {
                    // This case might happen if a user is authenticated but their Firestore doc is missing
                    console.error("No user document found in Firestore for UID:", user.uid);
                    setCurrentUser(null);
                }
            } else {
                // User is signed out
                setCurrentUser(null);
                setAuthStep('welcome'); // Reset to welcome screen on logout
            }
        });

        return () => unsubscribe(); // Cleanup subscription on unmount
    }, []); // Empty dependency array ensures this runs only once

    const handleToggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };
    const ensureUserKeyPair = async (user) => {
        if (user.publicKeyJwk)
            return user;

        let privateKey = await cryptoService.getPrivateKey(user.id);
        let updatedUser = { ...user };

        if (!privateKey) {
            const { publicKeyJwk } = await cryptoService.generateAndStoreKeyPair(user.id);
            updatedUser.publicKeyJwk = publicKeyJwk;
        }
        else {
            const publicKeyJwk = await cryptoService.getPublicKey(user.id);
            updatedUser.publicKeyJwk = publicKeyJwk;
        }
        await handleUpdateUser(updatedUser);
        return updatedUser;
    };

    const markNotificationsAsRead = async () => {
        if (!currentUser)
            return;

        const unreadNotifications = notifications.filter(n => !n.read);
        if (unreadNotifications.length === 0) return;

        try {
            const batch = writeBatch(db);
            unreadNotifications.forEach(notification => {
                const notificationRef = doc(db, "notifications", notification.id);
                batch.update(notificationRef, { read: true });
            });
            await batch.commit();
            // The onSnapshot listener will automatically update the UI.
        } catch (error) {
            console.error("Error marking notifications as read:", error);
        }
    };
    const handleLogin = async (credentials) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
            const user = userCredential.user;

            // Fetch user profile from Firestore to verify their role against the login flow.
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (!userDocSnap.exists()) {
                await signOut(auth); // Sign out user who exists in Auth but not in Firestore
                throw new Error("User data not found. Please contact support.");
            }

            const userData = userDocSnap.data();

            // Enforce role-based login flow
            if (authFlow === 'admin' && userData.role !== 'admin') {
                await signOut(auth);
                throw new Error("Access Denied. Only admin users can log in through this module.");
            }

            // If login is successful and role is correct, onAuthStateChanged will handle the rest.
            console.log(`Firebase login successful for ${userData.role}:`, user.email);
            return true;
        } catch (error) {
            console.error("Login Error:", error.message);
            // Use the error message directly for more specific feedback
            alert(`Login failed: ${error.message}`);
            return false;
        }
    };
    const handleSignup = async (userData) => {
        try {
            // Enforce one admin rule
            if (authFlow === 'admin') {
                throw new Error("Admin signup is restricted. Please contact the system administrator.");
            }
            // 1. Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
            const user = userCredential.user;
            console.log("Firebase signup successful for:", user.email);

            // 2. Create user profile document in Firestore
            const newUser = {
                id: user.uid, // Use Firebase UID as the document ID
                name: userData.name,
                email: userData.email,
                gender: userData.gender,
                avatar: `https://picsum.photos/seed/${userData.name.toLowerCase()}/100`,
                role: authFlow === 'admin' ? 'admin' : 'participant',
                status: 'active',
                followers: [],
                following: [],
                isOnline: false, // Add presence field
                emailNotifications: true, // Default setting for new users
            };

            // 3. Generate and add E2EE keys
            const { publicKeyJwk } = await cryptoService.generateAndStoreKeyPair(newUser.id);
            newUser.publicKeyJwk = publicKeyJwk;

            // 4. Save the new user object to Firestore
            await setDoc(doc(db, "users", user.uid), newUser);

            // 5. Update local state (optional, as onAuthStateChanged will also fire)
            // The real-time listener for users will handle this update.

            // onAuthStateChanged will handle setting the current user
            return true;
        } catch (error) {
            console.error("Firebase Signup Error:", error.message);
            alert(`Signup failed: ${error.message}`);
            return false;
        }
    };
    const handleLogout = async () => {
        await signOut(auth);
        setViewingProfile(null);
        setAuthFlow(null);
        // The onAuthStateChanged listener will also set authStep
    };
    const handleGoToLogin = () => {
        setInitialAuthView('login');
        setAuthStep('auth');
    };
    const handleGoToSignup = () => {
        setInitialAuthView('signup');
        setAuthStep('auth');
    };
    const handleBackToWelcome = () => {
        setAuthStep('welcome');
    };
    const handleSetAuthFlow = (flow) => {
        setAuthFlow(flow);
    };
    // Call the usePosts hook and pass dependencies
    const { posts, addPost: addPostToDb, deletePost, handleToggleLike, handleAddComment, handleDeleteComment } = usePosts(currentUser, users, addNotification);
    const handleViewProfile = (user) => {
        setViewingProfile(user);
    };
    const handleBackToFeed = () => {
        setViewingProfile(null);
    };
    const addPost = async (postData, file) => {
        if (!currentUser)
            return;

        if (file) {
            try {
                // 1. Upload file to Cloudinary
                const uploadResult = await cloudinaryService.uploadFile(file);

                // 2. Check if it's a resource or a post with an image
                if (postData) { // It's a post with an image
                    const postWithImageUrl = {
                        ...postData,
                        imageUrl: uploadResult.secure_url,
                    };
                    await addPostToDb(postWithImageUrl);
                } else { // It's a resource for the hub
                    const newResource = {
                        authorId: currentUser.id,
                        fileName: file.name,
                        fileUrl: uploadResult.secure_url,
                        publicId: uploadResult.public_id,
                        fileType: uploadResult.resource_type,
                        timestamp: serverTimestamp(),
                    };
                    await addDoc(collection(db, "resources"), newResource);
                }
            } catch (error) {
                console.error("Error creating resource:", error);
                alert("Failed to upload resource. Please try again.");
                throw error;
            }
        } else if (postData) { // It's a text-only post
            await addPostToDb(postData);
        }
    };
    // Real-time listener for resources
    useEffect(() => {
        if (users.length === 0) return;

        const resourcesCollectionRef = collection(db, "resources");
        const q = query(resourcesCollectionRef, orderBy("timestamp", "desc"));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const resourcesList = querySnapshot.docs.map(doc => {
                const resourceData = doc.data();
                const author = users.find(u => u.id === resourceData.authorId);
                return {
                    id: doc.id,
                    ...resourceData,
                    timestamp: resourceData.timestamp?.toDate().toLocaleString() || 'Just now',
                    author: author || { id: resourceData.authorId, name: 'Unknown User', avatar: '' },
                };
            });
            setResources(resourcesList);
            console.log("Real-time resource update received from Firestore.");
        });

        return () => unsubscribe();
    }, [users]);

    const deleteResource = async (resource) => {
        if (!currentUser || (currentUser.id !== resource.author.id && currentUser.role !== 'admin')) {
            alert("You are not authorized to delete this resource.");
            return;
        }
        try {
            // 1. Delete the document from Firestore
            await deleteDoc(doc(db, "resources", resource.id));
            // 2. (Optional but recommended) Delete the file from Cloudinary
            // This requires a secure backend call.
            await cloudinaryService.deleteFile(resource.publicId);
        } catch (error) {
            console.error("Error deleting resource:", error);
            alert("Failed to delete resource.");
        }
    };
    const deleteUser = async (userId) => {
        if (!currentUser || currentUser.role !== 'admin' || currentUser.id === userId) {
            alert("You cannot delete your own account.");
            return;
        }
        try {
            // 1. Delete user document from Firestore (this part remains as it's a Firestore operation)
            await deleteDoc(doc(db, "users", userId));

            // 2. Delete user from Firebase Authentication (requires Cloud Function for security)

            // 3. Clean up local storage for crypto keys (if they exist)
            localStorage.removeItem(`private_key_${userId}`);
            localStorage.removeItem(`public_key_${userId}`);

            // The onSnapshot listeners for users, posts, chats will handle UI updates.
            console.log(`User ${userId} deleted from Firestore.`);
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("Failed to delete user. Please try again.");
        }
    };

    const handleUpdateUser = async (updatedData) => {
        if (!currentUser)
            return;

        // Normalize updated user object: parent code passes either full user or partial fields
        const updatedUser = { ...(currentUser || {}), ...(updatedData || {}) };

        // Persist changes to Firestore (users collection)
        const userDocRef = doc(db, "users", updatedUser.id);
        await setDoc(userDocRef, updatedUser, { merge: true }); // Use merge: true to avoid overwriting

        // Persist privacy-sensitive fields to userPrivacy collection
        const userPrivacyRef = doc(db, 'userPrivacy', updatedUser.id);
        const privacyPayload = {};
        if ('statusMessage' in updatedUser) privacyPayload.statusMessage = updatedUser.statusMessage || '';
        if ('statusVisibility' in updatedUser) privacyPayload.statusVisibility = updatedUser.statusVisibility;
        if ('presenceVisibility' in updatedUser) privacyPayload.presenceVisibility = updatedUser.presenceVisibility;
        if (Object.keys(privacyPayload).length > 0) {
            await setDoc(userPrivacyRef, privacyPayload, { merge: true });
        }

        // Update local state
        setCurrentUser(updatedUser);
        // Update chats participants' cached data
        setChats(prevChats => prevChats.map(chat => ({
            ...chat,
            participants: chat.participants.map(p => p.id === updatedUser.id ? updatedUser : p)
        })));
    };
    const handleToggleUserStatus = async (userId) => {
        if (!currentUser || currentUser.role !== 'admin') {
            alert("You are not authorized to change user status.");
            return;
        }
        if (currentUser.id === userId) {
            alert("You cannot change your own status.");
            return;
        }
        const userRef = doc(db, "users", userId);
        try {
            const userDoc = await getDoc(userRef);
            if (!userDoc.exists()) throw new Error("User not found.");
            const currentStatus = userDoc.data().status;
            const newStatus = currentStatus === 'active' ? 'revoked' : 'active';
            await updateDoc(userRef, { status: newStatus });
            console.log(`User ${userId} status toggled to ${newStatus}.`);
        } catch (error) {
            console.error("Error toggling user status:", error);
            alert("Failed to toggle user status. Please try again.");
        }
    };
    const handleToggleFollow = async (targetUserId) => {
        if (!currentUser)
            return;
        if (currentUser.id === targetUserId)
            return;

        const currentUserRef = doc(db, "users", currentUser.id);
        const targetUserRef = doc(db, "users", targetUserId);

        try {
            await runTransaction(db, async (transaction) => {
                const currentUserDoc = await transaction.get(currentUserRef);
                const targetUserDoc = await transaction.get(targetUserRef);

                if (!currentUserDoc.exists() || !targetUserDoc.exists()) {
                    throw "One or both users not found.";
                }

                const isFollowing = currentUserDoc.data().following.includes(targetUserId);

                if (isFollowing) {
                    // Unfollow
                    transaction.update(currentUserRef, { following: arrayRemove(targetUserId) });
                    transaction.update(targetUserRef, { followers: arrayRemove(currentUser.id) });
                } else {
                    // Follow
                    transaction.update(currentUserRef, { following: arrayUnion(targetUserId) });
                    transaction.update(targetUserRef, { followers: arrayUnion(currentUser.id) });
                }
            });
            // The onSnapshot listener for users will update the UI automatically.
            // To make it feel instant, we can optimistically update the local state.
            // This part is complex and can be added later for UX improvement.
            console.log("Follow/unfollow transaction successful.");
        } catch (e) {
            console.error("Follow/unfollow transaction failed: ", e);
            alert("Could not update follow status. Please try again.");
        }
    };
    if (currentUser === undefined) { // Show a loading screen while auth state is being determined
        return <div className="w-screen h-screen flex items-center justify-center bg-light dark:bg-dark text-dark dark:text-light">Loading...</div>;
    }
    if (!currentUser) { // Now, if user is null, show auth flow
        if (authStep === 'welcome') {
            return <WelcomeScreen onLoginClick={handleGoToLogin} onSignupClick={handleGoToSignup} onSetAuthFlow={handleSetAuthFlow} />;
        }
        return <AuthScreen initialView={initialAuthView} onLogin={handleLogin} onSignup={handleSignup} onBack={handleBackToWelcome} allowSignupToggle={authFlow !== 'admin'} authFlow={authFlow} />;
    }
    return (<>
        <MainUI activeChat={_activeChat} onSetActiveChat={handleSetActiveChat} currentUser={currentUser} users={users} posts={posts} resources={resources} chats={chats} availableRooms={availableRooms} notifications={notifications} connectionRequests={connectionRequests} viewingProfile={viewingProfile} theme={theme} onLogout={handleLogout} onAddPost={addPost} onDeletePost={deletePost} onDeleteUser={deleteUser} onDeleteResource={deleteResource} onAddMessage={addMessage} onStartChat={handleStartChat} onCreateGroup={handleCreateGroup} onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} onManageRoomMembers={handleManageRoomMembers} onUpdateRoomSettings={handleUpdateRoomSettings} onDeleteRoom={handleDeleteRoom} onUpdateUser={handleUpdateUser} onToggleUserStatus={handleToggleUserStatus} onViewProfile={handleViewProfile} onBackToFeed={handleBackToFeed} onToggleFollow={handleToggleFollow} onSendConnectionRequest={sendConnectionRequest} onAcceptConnectionRequest={acceptConnectionRequest} onDeclineConnectionRequest={declineConnectionRequest} onCancelConnectionRequest={cancelConnectionRequest} onToggleLike={handleToggleLike} onAddComment={handleAddComment} onDeleteComment={handleDeleteComment} onToggleTheme={handleToggleTheme} onMarkNotificationsAsRead={markNotificationsAsRead} onMarkChatAsRead={handleMarkChatAsRead} onOpenSettingsModal={handleOpenSettingsModal} />
        {isSettingsModalOpen && (
            <SettingsModal
                currentUser={currentUser}
                onUpdateUser={handleUpdateUser}
                onClose={handleCloseSettingsModal}
                onUpdatePassword={handleChangePassword}
            />
        )}
        <FloatingChatbot currentUser={currentUser} isOnline={isOnline} />
    </>);
};
export default App;
