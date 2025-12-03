import React, { useState } from 'react';
import { ArrowLeftIcon, SpinnerIcon } from '../Icons';
import UserAvatar from './UserAvatar';
import PostCard from './PostCard';
import EditProfileModal from './EditProfileModal';
import { EditIcon } from '../Icons';
const ProfilePage = ({ profileUser, currentUser, allPosts, onBack, onDeletePost, onViewProfile, onToggleFollow, onToggleLike, onAddComment, onStartChat, onUpdateUser }) => {
    const [isFollowingLoading, setIsFollowingLoading] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const userPosts = allPosts.filter(p => p.author.id === profileUser.id);
    const username = profileUser.name.toLowerCase().replace(/\s+/g, '');
    const isFollowing = currentUser.following.includes(profileUser.id);
    const handleFollowClick = async () => {
        setIsFollowingLoading(true);
        try {
            await onToggleFollow(profileUser.id);
        }
        finally {
            setIsFollowingLoading(false);
        }
    };
    return (<div className="w-full max-w-4xl mx-auto p-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
            {/* Profile Header */}
            <div className="relative">
                <div className="h-48 bg-gradient-to-r from-indigo-400 to-purple-500">
                    <img src={`https://picsum.photos/seed/${username}/1200/400`} alt="Cover" className="w-full h-full object-cover" />
                </div>
                <div className="absolute top-4 left-4">
                    <button onClick={onBack} className="flex items-center space-x-2 bg-black/30 text-white font-semibold px-4 py-2 rounded-full hover:bg-black/50 transition">
                        <ArrowLeftIcon className="h-5 w-5" />
                        <span>Back</span>
                    </button>
                </div>
                <div className="absolute -bottom-16 left-8">
                    <UserAvatar user={profileUser} className="h-32 w-32 border-4 border-white dark:border-secondary rounded-full" />
                </div>
            </div>

            {/* User Info */}
            <div className="pt-20 px-6 pb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{profileUser.name}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">@{username}</p>
                    </div>
                    {currentUser.id !== profileUser.id && (<div className="flex items-center space-x-2">
                        <button onClick={() => onStartChat(profileUser)} className="font-semibold px-6 py-2 rounded-full transition bg-blue-500 text-white hover:bg-blue-600">
                            Message
                        </button>
                        <button onClick={handleFollowClick} disabled={isFollowingLoading} className={`font-semibold px-6 py-2 rounded-full transition transform hover:scale-105 w-32 flex justify-center items-center ${isFollowing
                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                            : 'bg-primary text-white hover:bg-indigo-700'} disabled:opacity-50`}>
                            {isFollowingLoading ? <SpinnerIcon className="animate-spin h-5 w-5" /> : (isFollowing ? 'Following' : 'Follow')}
                        </button>
                    </div>)}
                    {(currentUser.id === profileUser.id || currentUser.role === 'admin') && (
                        <button onClick={() => setIsEditModalOpen(true)} className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition text-gray-700 dark:text-gray-300 font-semibold w-full sm:w-auto text-center">
                            <EditIcon className="h-4 w-4" />
                            <span>Edit Profile</span>
                        </button>
                    )}
                </div>

                <div className="mt-4 flex space-x-6 text-sm text-gray-600 dark:text-gray-300">
                    <p><span className="font-bold text-gray-800 dark:text-white">{userPosts.length}</span> Posts</p>
                    <p><span className="font-bold text-gray-800 dark:text-white">{profileUser.followers.length}</span> Followers</p>
                    <p><span className="font-bold text-gray-800 dark:text-white">{profileUser.following.length}</span> Following</p>
                </div>
            </div>
        </div>

        {/* User's Posts */}
        <div className="mt-6 space-y-4">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white px-2">Posts</h3>
            {userPosts.length > 0 ? (userPosts.map(post => <PostCard key={post.id} post={post} currentUser={currentUser} onDeletePost={onDeletePost} onViewProfile={onViewProfile} onToggleLike={onToggleLike} onAddComment={onAddComment} />)) : (<div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-8 text-center text-gray-500 dark:text-gray-400">
                <p>{profileUser.name} hasn't posted anything yet.</p>
            </div>)}
        </div>
        {isEditModalOpen && (
            <EditProfileModal
                user={profileUser}
                onSave={onUpdateUser}
                onClose={() => setIsEditModalOpen(false)}
            />
        )}
    </div>);
};
export default ProfilePage;
