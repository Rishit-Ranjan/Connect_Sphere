import { useState, useEffect } from 'react';
import { db } from './firebase';
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp,
    deleteDoc,
    doc,
    updateDoc,
    arrayUnion,
    arrayRemove,
} from 'firebase/firestore';

export const usePosts = (currentUser, users, addNotification) => {
    const [posts, setPosts] = useState([]);

    // Fetch posts from Firestore and hydrate them with user data
    useEffect(() => {
        if (users.length === 0) return;

        const postsCollectionRef = collection(db, "posts");
        const q = query(postsCollectionRef, orderBy("timestamp", "desc"));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const postsList = querySnapshot.docs.map(doc => {
                const postData = doc.data();
                const author = users.find(u => u.id === postData.authorId);
                const comments = (postData.comments || []).map(comment => {
                    const commentAuthor = users.find(u => u.id === comment.authorId);
                    return { ...comment, author: commentAuthor || { name: 'Unknown User', avatar: '' } };
                });
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
        });

        return () => unsubscribe();
    }, [users]);

    const addPost = async (postData) => {
        if (!currentUser) return;

        if (postData.fileUrl && !postData.content) {
            // This logic remains in App.jsx as it deals with 'resources' state
            return false;
        }

        const newPost = {
            authorId: currentUser.id,
            content: postData.content,
            imageUrl: postData.imageUrl || null,
            timestamp: serverTimestamp(),
            likedBy: [],
            comments: [],
            isAnnouncement: postData.isAnnouncement && currentUser.role === 'admin',
        };

        try {
            await addDoc(collection(db, "posts"), newPost);
            return true;
        } catch (error) {
            console.error("Error adding post to Firestore: ", error);
            alert("Failed to create post. Please try again.");
            return false;
        }
    };

    const deletePost = async (postId) => {
        try {
            const postRef = doc(db, "posts", postId);
            await deleteDoc(postRef);
        } catch (error) {
            console.error("Error deleting post:", error);
            alert("Failed to delete post. Please try again.");
        }
    };

    const handleToggleLike = async (postId) => {
        if (!currentUser) return;

        const postRef = doc(db, "posts", postId);
        const post = posts.find(p => p.id === postId);

        if (!post) return;

        const isLiked = post.likedBy.includes(currentUser.id);

        try {
            if (isLiked) {
                await updateDoc(postRef, { likedBy: arrayRemove(currentUser.id) });
            } else {
                await updateDoc(postRef, { likedBy: arrayUnion(currentUser.id) });
                addNotification(post.author.id, 'like', currentUser, post);
            }
        } catch (error) {
            console.error("Error toggling like: ", error);
            alert("Failed to update like status. Please try again.");
        }
    };

    const handleAddComment = async (postId, content) => {
        if (!currentUser) return;

        const newComment = {
            id: Date.now(),
            authorId: currentUser.id,
            content,
            timestamp: serverTimestamp(),
        };

        try {
            const postRef = doc(db, "posts", postId);
            await updateDoc(postRef, { comments: arrayUnion(newComment) });

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

        if (commentToDelete.author.id !== currentUser.id && currentUser.role !== 'admin') {
            alert("You don't have permission to delete this comment.");
            return;
        }

        try {
            const postRef = doc(db, "posts", postId);
            const commentAsInDb = { ...commentToDelete, author: undefined, authorId: commentToDelete.author.id };
            delete commentAsInDb.author;

            await updateDoc(postRef, { comments: arrayRemove(commentAsInDb) });
        } catch (error) {
            console.error("Error deleting comment: ", error);
            alert("Failed to delete comment. Please try again.");
        }
    };

    return { posts, addPost, deletePost, handleToggleLike, handleAddComment, handleDeleteComment };
};