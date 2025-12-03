import React, { useState, useEffect } from 'react';
import AuthScreen from './components/LoginScreen';
import MainUI from './components/MainUI';
import ProfileSelectionScreen from './components/ProfileSelectionScreen';
import WelcomeScreen from './components/WelcomeScreen';
import FloatingChatbot from './components/FloatingChatbot'; 
import { auth, db, rtdb } from './services/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, deleteUser as deleteAuthUser } from 'firebase/auth';
import { ref, onValue, set, onDisconnect, serverTimestamp as rtdbServerTimestamp } from "firebase/database";
import { doc, setDoc, getDoc, collection, getDocs, query, orderBy, addDoc, serverTimestamp, onSnapshot, updateDoc, arrayUnion, arrayRemove, where, runTransaction, deleteDoc, writeBatch } from 'firebase/firestore';
 
import * as cryptoService from './services/cryptoService';
const App = () => {
    const [currentUser, setCurrentUser] = useState(undefined); // Use undefined to represent loading state
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [resources, setResources] = useState([]); // For the Resource Hub
    const [chats, setChats] = useState([]);
    const [notifications, setNotifications] = useState([]); // TODO: Migrate to Firestore
    const [viewingProfile, setViewingProfile] = useState(null);
    const [authStep, setAuthStep] = useState('welcome'); // 'welcome', 'auth'
    const [initialAuthView, setInitialAuthView] = useState('login');
    const [authFlow, setAuthFlow] = useState(null); // Can be 'admin' or 'participant'
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

    // Fetch all users from Firestore on initial load
    // This is now a real-time listener to get user status updates
    useEffect(() => {
        const usersCollectionRef = collection(db, "users");
        const unsubscribe = onSnapshot(usersCollectionRef, (querySnapshot) => {
            const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(usersList);
            console.log("Real-time user data update received.");
        });
        return () => unsubscribe();
    }, []);

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
                    updateDoc(userStatusFirestoreRef, { isOnline: true });
                });
            }
        });

        return () => unsubscribe();
    }, [currentUser]);

    // Fetch posts from Firestore and hydrate them with user data
    useEffect(() => {
        // Don't set up listener until users are loaded, as we need them for hydration
        if (users.length === 0) return;

        const postsCollectionRef = collection(db, "posts");
        const q = query(postsCollectionRef, orderBy("timestamp", "desc"));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const postsList = querySnapshot.docs.map(doc => {
                const postData = doc.data();

                // Find the full author object from the users list
                const author = users.find(u => u.id === postData.authorId);

                // Hydrate comments with their author objects
                const comments = (postData.comments || []).map(comment => {
                    const commentAuthor = users.find(u => u.id === comment.authorId);
                    return {
                        ...comment,
                        author: commentAuthor || { name: 'Unknown User', avatar: '' } // Fallback
                    };
                });

                // Fallback for author if user not found (e.g., deleted user)
                const finalAuthor = author || { id: postData.authorId, name: 'Unknown User', avatar: '' };

                return {
                    id: doc.id,
                    ...postData,
                    timestamp: postData.timestamp?.toDate().toLocaleString() || 'Just now',
                    author: finalAuthor,
                    comments: comments
                };
            });
            setPosts(postsList);
            console.log("Real-time post update received from Firestore.");
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [users]); // This effect depends on the users list

    // Real-time listener for chats
    useEffect(() => {
        if (!currentUser || users.length === 0) {
            setChats([]);
            return;
        }

        const chatsCollectionRef = collection(db, "chats");
        // Query for chats where the current user is a participant
        const q = query(chatsCollectionRef, where("participantIds", "array-contains", currentUser.id));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const chatsList = querySnapshot.docs.map(doc => {
                const chatData = doc.data();

                // Hydrate participant data
                const participants = chatData.participantIds.map(id => {
                    return users.find(u => u.id === id) || { id, name: 'Unknown User', avatar: '' };
                });

                // Hydrate message sender data
                const messages = (chatData.messages || []).map(msg => ({
                    ...msg,
                    timestamp: msg.timestamp?.toDate().toLocaleString() || 'Just now',
                }));

                return {
                    id: doc.id,
                    ...chatData,
                    participants,
                    messages,
                };
            });
            setChats(chatsList);
            console.log("Real-time chat update received from Firestore.");
        });

        return () => unsubscribe();
    }, [currentUser, users]);

    // Listen for status changes in Realtime Database and sync to Firestore
    useEffect(() => {
        if (users.length === 0) return;

        const statusRef = ref(rtdb, 'status');
        const unsubscribe = onValue(statusRef, (snapshot) => {
            const statuses = snapshot.val();
            if (!statuses) return;
            users.forEach(user => {
                const firestoreUserRef = doc(db, 'users', user.id);
                const onlineStatus = statuses[user.id]?.isOnline || false;
                if (user.isOnline !== onlineStatus) {
                    updateDoc(firestoreUserRef, { isOnline: onlineStatus });
                }
            });
        });
        return () => unsubscribe();
    }, [users]);

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
        } catch (error) {
            console.error("Error creating notification:", error);
        }
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
            // onAuthStateChanged will handle setting the current user
            console.log("Firebase login successful for:", userCredential.user.email);
            return true;
        } catch (error) {
            console.error("Firebase Login Error:", error.message);
            alert(`Login failed: ${error.message}`);
            return false;
        }
    };
    const handleSignup = async (userData) => {
        try {
            // Enforce one admin rule
            if (authFlow === 'admin') {
                const adminExists = users.some(u => u.role === 'admin');
                if (adminExists) {
                    throw new Error("An admin account already exists. Only one admin is allowed.");
                }
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
            setUsers(prev => [...prev, newUser]);
            
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
    const handleViewProfile = (user) => {
        setViewingProfile(user);
    };
    const handleBackToFeed = () => {
        setViewingProfile(null);
    };
    const addPost = async (postData) => {
        if (!currentUser)
            return;

        // If it has a file but no content, treat it as a resource
        if (postData.fileUrl && !postData.content) { // This is a resource upload
            const newResource = {
                id: Date.now(),
                author: currentUser,
                fileName: postData.fileName,
                fileUrl: postData.fileUrl,
                timestamp: 'Just now', // Local timestamp for non-persistent resource
                // No Firestore interaction here
            }; 
            try {
                // This was trying to use newResourceData which doesn't exist in this scope.
                // Since resources are not persistent, we only update local state.
                // The onSnapshot listener for resources (to be implemented) will update the UI.
                // For now, we'll manually add to local state for immediate feedback.
                setResources(prev => [newResource, ...prev]);
            } catch (error) {
                console.error("Error adding resource to Firestore:", error);
            }
        } else { // Otherwise, treat it as a post
            const newPost = {
                authorId: currentUser.id,
                content: postData.content,
                imageUrl: postData.imageUrl || null,
                timestamp: serverTimestamp(), // Use server timestamp for consistency
                likedBy: [],
                comments: [],
                isAnnouncement: postData.isAnnouncement && currentUser.role === 'admin',
            };

            // Optimistic UI update: Add post to local state immediately
            const tempId = `temp_${Date.now()}`;
            const optimisticPost = {
                ...newPost,
                id: tempId,
                author: currentUser,
                timestamp: new Date().toLocaleString(),
            };
            setPosts(prevPosts => [optimisticPost, ...prevPosts]);

            try {
                await addDoc(collection(db, "posts"), newPost);
            } catch (error) {
                console.error("Error adding post to Firestore: ", error);
                // Revert optimistic update on error
                setPosts(prevPosts => prevPosts.filter(p => p.id !== tempId));
                alert("Failed to create post. Please try again.");
            }
        }
    };
    // Real-time listener for resources (similar to posts and chats) - REMOVED as resources are not persistent
    // Real-time listener for resources (similar to posts and chats)
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

    const deleteResource = async (resourceId) => { // Reverted to local state
        // No Firestore interaction as resources are not persistent
        // This will only remove it from the current session's view
        setResources(prev => prev.filter(r => r.id !== resourceId));
    };
    const deletePost = async (postId) => {
        // Authorization is handled by Firestore Security Rules.
        // The UI already hides the button for users without permission.
        try {
            const postRef = doc(db, "posts", postId);
            // TODO: Delete associated image/file from Firebase Storage if any
            await deleteDoc(postRef);
            // The onSnapshot listener will automatically update the UI.
        } catch (error) {
            console.error("Error deleting post:", error);
            alert("Failed to delete post. Please try again.");
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
            // For now, we'll just delete the Firestore document.
            // A real-world app would have a Cloud Function triggered by Firestore delete
            // to also delete the Auth user.

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
    const addMessage = async (chatId, message, plaintextForNotification) => {
        const chat = chats.find(c => c.id === chatId); // Find chat from local state
        if (!chat || !currentUser)
            return;

        const messageWithTimestamp = {
            ...message,
            timestamp: serverTimestamp()
        };

        try {
            const chatRef = doc(db, "chats", chatId);
            await updateDoc(chatRef, {
                messages: arrayUnion(messageWithTimestamp)
                // Note: Handling unread counts server-side with cloud functions is more robust,
                // but for now, we'll rely on the client to update its own state.
            });

            // The onSnapshot listener will handle the UI update for the sender.
            // We can still send notifications to other participants.
            chat.participants.forEach(p => {
                if (p.id !== currentUser.id) {
                    const messageText = plaintextForNotification ?? (message.content?.text);
                    addNotification(p.id, 'message', currentUser, undefined, messageText);
                }
            });
        } catch (error) {
            console.error("Error sending message: ", error);
            alert("Failed to send message. Please try again.");
        }
    };
    const handleStartChat = async (participant) => {
        if (!currentUser || currentUser.id === participant.id)
            return;

        // Check if a private chat already exists
        const existingChat = chats.find(c => c.type === 'private' &&
            c.participants.length === 2 &&
            c.participants.some(p => p.id === currentUser.id) &&
            c.participants.some(p => p.id === participant.id));

        if (existingChat) {
            // If chat exists, just switch to it
            _setActiveChat(existingChat);
            return;
        }

        // If not, create a new chat document in Firestore
        try {
            const newChatData = {
                type: 'private',
                participantIds: [currentUser.id, participant.id],
                messages: [],
                unreadCounts: { [currentUser.id]: 0, [participant.id]: 0 },
                createdAt: serverTimestamp(),
            };
            const chatDocRef = await addDoc(collection(db, "chats"), newChatData);
            // The onSnapshot listener will add the new chat to the state.
            console.log("Created new private chat with ID:", chatDocRef.id);
        } catch (error) {
            console.error("Error starting chat:", error);
            alert("Could not start a new chat. Please try again.");
        }
    };
    const handleCreateGroup = async (name, members) => {
        if (!currentUser || !name.trim() || members.length === 0)
            return;
        
        const allParticipantIds = [currentUser.id, ...members.map(m => m.id)];
        const uniqueParticipantIds = [...new Set(allParticipantIds)];

        try {
            const newGroupData = {
                name,
                type: 'group',
                participantIds: uniqueParticipantIds,
                messages: [],
                unreadCounts: uniqueParticipantIds.reduce((acc, id) => ({ ...acc, [id]: 0 }), {}),
                adminId: currentUser.id,
                createdAt: serverTimestamp(),
            };
            await addDoc(collection(db, "chats"), newGroupData);
            // onSnapshot will handle UI update
        } catch (error) {
            console.error("Error creating group:", error);
            alert("Failed to create group. Please try again.");
        }
    };
    const handleCreateRoom = async (name, privacy, password) => {
        if (!currentUser || !name.trim())
            return;
        try {
            await addDoc(collection(db, "chats"), newRoom);
            // The onSnapshot listener will handle the UI update.
        } catch (error) {
            console.error("Error creating room:", error);
            alert("Failed to create room. Please try again.");
        }
    };
    const handleJoinRoom = async (chatId, passwordInput) => {
        if (!currentUser)
            return false;
        // Fetch the room directly from Firestore to ensure latest data
        const roomDocRef = doc(db, "chats", chatId);
        const roomDocSnap = await getDoc(roomDocRef);

        if (!roomDocSnap.exists()) {
            console.error("Room not found:", chatId);
            return false;
        }

        const room = { id: roomDocSnap.id, ...roomDocSnap.data() };

        // Check if room is password protected and password matches
        if (!room || room.type !== 'room' || room.roomPrivacy !== 'password_protected') {
            return false;
        }
        if (room.password === passwordInput) {
            // Add the current user to the room's participants in Firestore
            await updateDoc(roomDocRef, {
                participantIds: arrayUnion(currentUser.id)
            });
            // The onSnapshot listener will handle the UI update.
            return true;
        }
        return false;
    };
    const handleManageRoomMembers = async (chatId, newMemberList) => {
        if (!currentUser)
            return;
        const chatRef = doc(db, "chats", chatId);
        try {
            // Fetch current chat data to ensure admin check is accurate
            const chatDoc = await getDoc(chatRef);
            if (!chatDoc.exists() || chatDoc.data().adminId !== currentUser.id) {
                alert("You are not authorized to manage this room.");
                return;
            }

            const currentParticipantIds = chatDoc.data().participantIds || [];
            const newParticipantIds = newMemberList.map(m => m.id);
            const finalParticipantIds = [...new Set([chatDoc.data().adminId, ...newParticipantIds])]; // Ensure admin is always present

            const batch = writeBatch(db);
            batch.update(chatRef, { participantIds: finalParticipantIds });

            // Update unread counts for new members
            finalParticipantIds.forEach(id => {
                if (!currentParticipantIds.includes(id)) {
                    batch.update(chatRef, { [`unreadCounts.${id}`]: 0 });
                }
            });
            await batch.commit();
            console.log("Room members updated in Firestore.");
        } catch (error) {
            console.error("Error managing room members:", error);
            alert("Failed to manage room members. Please try again.");
        }
    };
    const handleUpdateRoomSettings = async (chatId, settings) => {
        if (!currentUser)
            return;
        const chatRef = doc(db, "chats", chatId);
        try {
            const chatDoc = await getDoc(chatRef);
            if (!chatDoc.exists() || chatDoc.data().adminId !== currentUser.id) {
                alert("You are not authorized to update this room's settings.");
                return;
            }
            await updateDoc(chatRef, settings);
            console.log("Room settings updated in Firestore.");
        } catch (error) {
            console.error("Error updating room settings:", error);
            alert("Failed to update room settings. Please try again.");
        }
    };
    const handleDeleteRoom = async (chatId) => {
        if (!currentUser)
            return;
        const chatRef = doc(db, "chats", chatId);
        try {
            const chatDoc = await getDoc(chatRef);
            if (!chatDoc.exists() || chatDoc.data().adminId !== currentUser.id) {
                alert("You are not authorized to delete this room.");
                return;
            }
            await deleteDoc(chatRef);
            console.log("Room deleted from Firestore.");
        } catch (error) {
            console.error("Error deleting room:", error);
            alert("Failed to delete room. Please try again.");
        }
    };
    const handleMarkChatAsRead = (chatId) => {
        if (!currentUser)
            return;
        setChats(prevChats => prevChats.map(chat => {
            if (chat.id === chatId) {
                const newUnreadCounts = { ...chat.unreadCounts };
                newUnreadCounts[currentUser.id] = 0;                
                // Update Firestore for unread counts
                updateDoc(doc(db, "chats", chatId), {
                    [`unreadCounts.${currentUser.id}`]: 0
                });
            }
            return chat;
        }));
    };
    const handleUpdateUser = async (updatedData) => {
        if (!currentUser)
            return;
        
        // Use the incoming data as the source of truth for the update
        const updatedUser = updatedData;
        
        // Persist changes to Firestore
        const userDocRef = doc(db, "users", updatedUser.id);
        await setDoc(userDocRef, updatedUser, { merge: true }); // Use merge: true to avoid overwriting

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
    const handleToggleLike = async (postId) => {
        if (!currentUser)
            return;

        const postRef = doc(db, "posts", postId);
        const post = posts.find(p => p.id === postId);

        if (!post) {
            console.error("Post not found for liking:", postId);
            return;
        }

        const isLiked = post.likedBy.includes(currentUser.id);

        try {
            if (isLiked) {
                // User is unliking the post
                await updateDoc(postRef, {
                    likedBy: arrayRemove(currentUser.id)
                });
            } else {
                // User is liking the post
                await updateDoc(postRef, {
                    likedBy: arrayUnion(currentUser.id)
                });
                // Send notification only when liking, not unliking
                addNotification(post.author.id, 'like', currentUser, post);
            }
            // The onSnapshot listener will automatically update the UI.
        } catch (error) {
            console.error("Error toggling like: ", error);
            alert("Failed to update like status. Please try again.");
        }
    };
    const handleAddComment = async (postId, content) => {
        if (!currentUser)
            return;

        const newComment = {
            id: Date.now(), // Using timestamp for a simple unique ID
            authorId: currentUser.id,
            content,
            timestamp: serverTimestamp(),
        };

        try {
            const postRef = doc(db, "posts", postId);
            await updateDoc(postRef, {
                comments: arrayUnion(newComment)
            });

            // The onSnapshot listener will handle the UI update.
            // We can still send a notification.
            const targetPost = posts.find(p => p.id === postId);
            if (targetPost) {
                addNotification(targetPost.author.id, 'comment', currentUser, targetPost);
            }
        } catch (error) {
            console.error("Error adding comment: ", error);
            alert("Failed to add comment. Please try again.");
        }
    };
    const handleDeleteComment = async (postId, commentId) => {
        if (!currentUser) return;

        const post = posts.find(p => p.id === postId);
        if (!post) return;

        const commentToDelete = post.comments.find(c => c.id === commentId);
        if (!commentToDelete) return;

        // Authorization: only comment author or admin can delete
        if (commentToDelete.author.id !== currentUser.id && currentUser.role !== 'admin') {
            alert("You don't have permission to delete this comment.");
            return;
        }

        try {
            const postRef = doc(db, "posts", postId);
            // We need to remove the comment object exactly as it is stored in Firestore.
            // The local state has a hydrated `author` object, but Firestore has `authorId`.
            const commentAsInDb = { ...commentToDelete, author: undefined, authorId: commentToDelete.author.id };
            delete commentAsInDb.author; // Ensure the author object is not part of the payload

            await updateDoc(postRef, { comments: arrayRemove(commentAsInDb) });
            // The onSnapshot listener will automatically update the UI.
        } catch (error) {
            console.error("Error deleting comment: ", error);
            alert("Failed to delete comment. Please try again.");
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
        <MainUI activeChat={_activeChat} onSetActiveChat={_setActiveChat} currentUser={currentUser} users={users} posts={posts} resources={resources} chats={chats} notifications={notifications} viewingProfile={viewingProfile} theme={theme} onLogout={handleLogout} onAddPost={addPost} onDeletePost={deletePost} onDeleteUser={deleteUser} onDeleteResource={deleteResource} onAddMessage={addMessage} onStartChat={handleStartChat} onCreateGroup={handleCreateGroup} onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} onManageRoomMembers={handleManageRoomMembers} onUpdateRoomSettings={handleUpdateRoomSettings} onDeleteRoom={handleDeleteRoom} onUpdateUser={handleUpdateUser} onToggleUserStatus={handleToggleUserStatus} onViewProfile={handleViewProfile} onBackToFeed={handleBackToFeed} onToggleFollow={handleToggleFollow} onToggleLike={handleToggleLike} onAddComment={handleAddComment} onDeleteComment={handleDeleteComment} onToggleTheme={handleToggleTheme} onMarkNotificationsAsRead={markNotificationsAsRead} onMarkChatAsRead={handleMarkChatAsRead} />
        <FloatingChatbot currentUser={currentUser} isOnline={isOnline} />
    </>);
};
export default App;
