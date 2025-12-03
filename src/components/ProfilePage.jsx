import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeftIcon, EditIcon, CameraIcon } from '../Icons';
import PostCard from './PostCard';
import UserAvatar from './UserAvatar';

const ProfilePage = ({ profileUser, currentUser, allPosts, onBack, onDeletePost, onViewProfile, onToggleFollow, onToggleLike, onAddComment, onUpdateUser, onStartChat }) => {
    const isOwnProfile = profileUser.id === currentUser.id;
    const [isEditingName, setIsEditingName] = useState(false);
    const [name, setName] = useState(profileUser.name);
    const avatarInputRef = useRef(null);

    // Reset state if the profile user changes
    useEffect(() => {
        setName(profileUser.name);
        setIsEditingName(false);
    }, [profileUser]);

    const handleNameSave = () => {
        if (name.trim() && name.trim() !== profileUser.name) {
            onUpdateUser({ ...profileUser, name: name.trim() });
        }
        setIsEditingName(false);
    };

    const handleAvatarChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onUpdateUser({ ...profileUser, avatar: reader.result });
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const userPosts = allPosts.filter(post => post.authorId === profileUser.id).sort((a, b) => b.id - a.id);

    return (
        <div className="bg-white dark:bg-secondary rounded-lg shadow-md overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-4">
                <button onClick={onBack} className="text-gray-500 hover:text-primary p-2 rounded-full">
                    <ArrowLeftIcon className="h-6 w-6" />
                </button>
                <div>
                    <h2 className="text-xl font-bold">{profileUser.name}</h2>
                    <p className="text-sm text-gray-500">{userPosts.length} Posts</p>
                </div>
            </div>

            {/* Profile Info */}
            <div className="p-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                    <div className="relative group flex-shrink-0">
                        <UserAvatar user={profileUser} className="h-24 w-24 sm:h-32 sm:w-32" />
                        {isOwnProfile && (
                            <>
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={avatarInputRef}
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                />
                                <button
                                    onClick={() => avatarInputRef.current.click()}
                                    className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center rounded-full transition-all duration-300"
                                    aria-label="Change profile picture"
                                >
                                    <CameraIcon className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            </>
                        )}
                    </div>

                    <div className="flex-grow flex flex-col items-center sm:items-start">
                        <div className="flex items-center space-x-2">
                            {isEditingName ? (
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    onBlur={handleNameSave}
                                    onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                                    className="text-2xl font-bold bg-gray-100 dark:bg-gray-700 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
                                    autoFocus
                                />
                            ) : (
                                <h1 className="text-2xl font-bold">{profileUser.name}</h1>
                            )}
                            {isOwnProfile && !isEditingName && (
                                <button onClick={() => setIsEditingName(true)} className="text-gray-400 hover:text-primary p-1">
                                    <EditIcon className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                        <p className="text-sm text-gray-500">@{profileUser.name.toLowerCase().replace(/\s+/g, '')}</p>

                        <div className="flex space-x-6 mt-4 text-center">
                            <div>
                                <p className="font-bold text-lg">{userPosts.length}</p>
                                <p className="text-sm text-gray-500">Posts</p>
                            </div>
                            <div>
                                <p className="font-bold text-lg">{profileUser.followers.length}</p>
                                <p className="text-sm text-gray-500">Followers</p>
                            </div>
                            <div>
                                <p className="font-bold text-lg">{profileUser.following.length}</p>
                                <p className="text-sm text-gray-500">Following</p>
                            </div>
                        </div>

                        {!isOwnProfile && (
                            <div className="mt-4 flex space-x-2">
                                <button onClick={() => onToggleFollow(profileUser.id)} className={`px-4 py-2 rounded-full font-semibold text-sm transition ${currentUser.following.includes(profileUser.id) ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
                                    {currentUser.following.includes(profileUser.id) ? 'Following' : 'Follow'}
                                </button>
                                <button onClick={() => onStartChat(profileUser)} className="px-4 py-2 rounded-full font-semibold text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition">Message</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* User's Posts */}
            <div className="border-t border-gray-200 dark:border-gray-700">
                {userPosts.length > 0 ? (
                    <div className="space-y-4 p-4">
                        {userPosts.map(post => (
                            <PostCard key={post.id} post={post} currentUser={currentUser} onDeletePost={onDeletePost} onViewProfile={onViewProfile} onToggleLike={onToggleLike} onAddComment={onAddComment} />
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-16">This user hasn't posted anything yet.</p>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;