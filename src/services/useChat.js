import { useState, useEffect } from 'react';
import { db } from './services/firebase';
import {
    collection,
    query,
    where,
    onSnapshot,
    addDoc,
    serverTimestamp,
    doc,
    updateDoc,
    arrayUnion,
    getDoc,
    writeBatch,
    deleteDoc
} from 'firebase/firestore';

export const useChat = (currentUser, users, addNotification) => {
    const [chats, setChats] = useState([]);
    const [availableRooms, setAvailableRooms] = useState([]);

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

    // Real-time listener for available rooms (Discovery)
    useEffect(() => {
        if (!currentUser) return;
        const chatsCollectionRef = collection(db, "chats");
        // We can't easily query OR in Firestore for "public" OR "password_protected" combined with other fields efficiently without index.
        // But "in" query works for up to 10 values.
        const q = query(chatsCollectionRef, where("type", "==", "room"), where("roomPrivacy", "in", ["public", "password_protected"]));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const rooms = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAvailableRooms(rooms);
        }, (error) => {
            console.error("Error fetching available rooms:", error);
        });

        return () => unsubscribe();
    }, [currentUser]);

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
            // Return existing chat so the UI can switch to it
            // Note: In App.jsx we called handleSetActiveChat. 
            // Here we just return the chat object, and let the component handle the switch.
            return existingChat;
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
            console.log("Created new private chat with ID:", chatDocRef.id);
            // Return a temporary chat object so we can switch immediately if needed
            // Ideally we wait for the snapshot, but returning something helps for immediate UI reaction
            return { id: chatDocRef.id, ...newChatData };
        } catch (error) {
            console.error("Error starting chat:", error);
            alert("Could not start a new chat. Please try again.");
            return null;
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

    const handleCreateRoom = async (name, privacy, password, initialMembers = []) => {
        if (!currentUser || !name.trim())
            return;
        try {
            const initialParticipantIds = [currentUser.id, ...initialMembers.map(m => m.id)];
            // Remove duplicates
            const uniqueParticipantIds = [...new Set(initialParticipantIds)];

            const newRoom = {
                name,
                type: 'room',
                roomPrivacy: privacy,
                password: privacy === 'password_protected' ? password : null,
                participantIds: uniqueParticipantIds,
                messages: [],
                unreadCounts: uniqueParticipantIds.reduce((acc, id) => ({ ...acc, [id]: 0 }), {}),
                adminId: currentUser.id,
                createdAt: serverTimestamp(),
                messagingPermission: 'all',
                mediaSharePermission: 'all'
            };
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

        if (!room || room.type !== 'room') {
            return false;
        }

        if (room.roomPrivacy === 'public' || (room.roomPrivacy === 'password_protected' && room.password === passwordInput)) {
            // Add the current user to the room's participants in Firestore
            await updateDoc(roomDocRef, {
                participantIds: arrayUnion(currentUser.id),
                [`unreadCounts.${currentUser.id}`]: 0
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
            return false;
        const chatRef = doc(db, "chats", chatId);
        try {
            const chatDoc = await getDoc(chatRef);
            if (!chatDoc.exists() || chatDoc.data().adminId !== currentUser.id) {
                alert("You are not authorized to delete this room.");
                return false;
            }
            await deleteDoc(chatRef);
            console.log("Room deleted from Firestore.");
            return true;
        } catch (error) {
            console.error("Error deleting room:", error);
            alert(`Failed to delete room: ${error.message}`);
            return false;
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

    return {
        chats,
        availableRooms,
        addMessage,
        handleStartChat,
        handleCreateGroup,
        handleCreateRoom,
        handleJoinRoom,
        handleManageRoomMembers,
        handleUpdateRoomSettings,
        handleDeleteRoom,
        handleMarkChatAsRead
    };
};
