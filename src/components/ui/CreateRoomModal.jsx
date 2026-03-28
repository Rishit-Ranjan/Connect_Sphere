import React, { useState } from 'react';
import { XIcon, LockClosedIcon, UserPlusIcon, SpinnerIcon, UsersIcon, SearchIcon } from '../Icons';
const CreateRoomModal = ({ users, currentUser, onCreateRoom, onClose }) => {
    const [roomName, setRoomName] = useState('');
    const [privacy, setPrivacy] = useState('invite_only');
    const [category, setCategory] = useState('General');
    const [customCategory, setCustomCategory] = useState('');
    const [password, setPassword] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const handleSubmit = async () => {
        if (!roomName.trim() || isCreating)
            return;
        if (privacy === 'password_protected' && !password.trim())
            return;
        setIsCreating(true);
        try {
            await onCreateRoom(roomName, privacy, password, selectedMembers, category === 'Others' ? (customCategory.trim() || 'Others') : category);
            onClose();
        }
        catch (error) {
            console.error("Failed to create room", error);
        }
        finally {
            setIsCreating(false);
        }
    };

    const toggleMember = (user) => {
        if (selectedMembers.some(m => m.id === user.id)) {
            setSelectedMembers(prev => prev.filter(m => m.id !== user.id));
        } else {
            setSelectedMembers(prev => [...prev, user]);
        }
    };

    const usersToDisplay = users.filter(u =>
        u.id !== currentUser.id &&
        u.status === 'active' &&
        u.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isSubmitDisabled = !roomName.trim() || (privacy === 'password_protected' && password.length < 4) || isCreating;
    return (<div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md transform animate-fade-in-scale flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-200/50 dark:border-slate-700/50">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Create a New Room</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <XIcon className="h-6 w-6" />
                </button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto">
                <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Room Type</label>
                    <div className="grid grid-cols-1 gap-3">
                        <button onClick={() => { setPrivacy('public'); setPassword(''); }} disabled={isCreating} className={`flex items-center space-x-4 p-4 rounded-xl border-2 transition-all ${privacy === 'public' ? 'border-primary bg-primary/5 shadow-sm' : 'border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-slate-700/50'} text-left disabled:opacity-50 disabled:cursor-not-allowed group`}>
                            <div className={`h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${privacy === 'public' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 group-hover:text-primary dark:text-gray-400'}`}>
                                <UsersIcon className="h-6 w-6" />
                            </div>
                            <div>
                                <p className={`font-bold transition-colors ${privacy === 'public' ? 'text-primary' : 'text-gray-700 dark:text-gray-200'}`}>Public Room</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Open to everyone. Visible in discovery.</p>
                            </div>
                        </button>

                        <button onClick={() => { setPrivacy('invite_only'); setPassword(''); }} disabled={isCreating} className={`flex items-center space-x-4 p-4 rounded-xl border-2 transition-all ${privacy === 'invite_only' ? 'border-primary bg-primary/5 shadow-sm' : 'border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-slate-700/50'} text-left disabled:opacity-50 disabled:cursor-not-allowed group`}>
                            <div className={`h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${privacy === 'invite_only' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 group-hover:text-primary dark:text-gray-400'}`}>
                                <UserPlusIcon className="h-6 w-6" />
                            </div>
                            <div>
                                <p className={`font-bold transition-colors ${privacy === 'invite_only' ? 'text-primary' : 'text-gray-700 dark:text-gray-200'}`}>Invite-Only</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Private. Only accessible via invitation.</p>
                            </div>
                        </button>

                        <button onClick={() => setPrivacy('password_protected')} disabled={isCreating} className={`flex items-center space-x-4 p-4 rounded-xl border-2 transition-all ${privacy === 'password_protected' ? 'border-primary bg-primary/5 shadow-sm' : 'border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-slate-700/50'} text-left disabled:opacity-50 disabled:cursor-not-allowed group`}>
                            <div className={`h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${privacy === 'password_protected' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 group-hover:text-primary dark:text-gray-400'}`}>
                                <LockClosedIcon className="h-6 w-6" />
                            </div>
                            <div>
                                <p className={`font-bold transition-colors ${privacy === 'password_protected' ? 'text-primary' : 'text-gray-700 dark:text-gray-200'}`}>Password Protected</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Secure. Requires a password to join.</p>
                            </div>
                        </button>
                    </div>
                </div>
                <div className="relative">
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Room Category</label>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { name: 'General', color: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600', active: 'bg-indigo-600 text-white border-indigo-600', emoji: '💬' },
                            { name: 'Tech',    color: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700', active: 'bg-blue-600 text-white border-blue-600', emoji: '💻' },
                            { name: 'Gaming',  color: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700', active: 'bg-purple-600 text-white border-purple-600', emoji: '🎮' },
                            { name: 'Career',  color: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700', active: 'bg-green-600 text-white border-green-600', emoji: '💼' },
                            { name: 'Study',   color: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700', active: 'bg-yellow-500 text-white border-yellow-500', emoji: '📚' },
                            { name: 'Social',  color: 'bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-700', active: 'bg-pink-500 text-white border-pink-500', emoji: '🎉' },
                            { name: 'Others',  color: 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700', active: 'bg-orange-500 text-white border-orange-500', emoji: '✨' },
                        ].map(cat => (
                            <button
                                key={cat.name}
                                type="button"
                                onClick={() => { setCategory(cat.name); if (cat.name !== 'Others') setCustomCategory(''); }}
                                disabled={isCreating}
                                className={`flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all hover:scale-105 active:scale-95 ${
                                    category === cat.name ? cat.active : cat.color
                                }`}
                            >
                                <span>{cat.emoji}</span>
                                <span>{cat.name}</span>
                            </button>
                        ))}
                    </div>
                    {/* Custom category input — slides in when 'Others' is selected */}
                    {category === 'Others' && (
                        <div className="mt-3 animate-fade-in">
                            <input
                                type="text"
                                autoFocus
                                value={customCategory}
                                onChange={(e) => setCustomCategory(e.target.value)}
                                placeholder="Enter your category name..."
                                maxLength={30}
                                className="block w-full px-4 py-3 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/10 text-gray-800 dark:text-gray-200 border-2 border-orange-300 dark:border-orange-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all placeholder:text-gray-400"
                                disabled={isCreating}
                            />
                        </div>
                    )}
                </div>
                <div>
                    <label htmlFor="roomName" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Room Name</label>
                    <input type="text" id="roomName" value={roomName} onChange={(e) => setRoomName(e.target.value)} className="block w-full px-4 py-3 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-700 dark:to-slate-700/50 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" placeholder="e.g., #gaming, #project-alpha" disabled={isCreating} />
                </div>
                {privacy === 'password_protected' && (<div className="animate-fade-in-scale space-y-4">
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Room Password</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full px-4 py-3 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-700 dark:to-slate-700/50 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" placeholder="Min. 4 characters" disabled={isCreating} />
                    </div>
                </div>)}

                {/* Add Members Section - For All Room Types */}
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Add Members (Optional)</label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"><SearchIcon className="h-5 w-5" /></span>
                        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search users by name..." className="w-full pl-10 pr-4 py-3 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-700 dark:to-slate-700/50 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" disabled={isCreating} />
                    </div>

                    {/* Selected Members Chips */}
                    {selectedMembers.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {selectedMembers.map(member => (
                                <div key={member.id} className="flex items-center space-x-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                                    <span>{member.name}</span>
                                    <button onClick={() => toggleMember(member)} disabled={isCreating} className="hover:text-red-500"><XIcon className="h-4 w-4" /></button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Available Users List */}
                    <div className="max-h-48 overflow-y-auto space-y-2 border border-gray-100 dark:border-slate-700 rounded-lg p-2">
                        {usersToDisplay.length > 0 ? (
                            usersToDisplay.map(user => {
                                const isSelected = selectedMembers.some(m => m.id === user.id);
                                return (
                                    <button
                                        key={user.id}
                                        onClick={() => toggleMember(user)}
                                        disabled={isCreating}
                                        className={`w-full flex items-center space-x-3 p-2 rounded-lg transition-colors ${isSelected ? 'bg-primary/5 dark:bg-primary/20' : 'hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                                    >
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${isSelected ? 'bg-primary' : 'bg-gray-400'}`}>
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="text-left flex-1">
                                            <p className={`text-sm font-semibold ${isSelected ? 'text-primary' : 'text-gray-800 dark:text-gray-200'}`}>{user.name}</p>
                                        </div>
                                        {isSelected && <div className="h-2 w-2 rounded-full bg-primary"></div>}
                                    </button>
                                );
                            })
                        ) : (
                            <p className="text-center text-sm text-gray-400 py-2">No users found.</p>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex justify-end space-x-4 p-6 bg-gradient-to-r from-gray-50/80 to-blue-50/80 dark:from-slate-700/50 dark:to-slate-700/30 rounded-b-2xl mt-auto border-t border-gray-200/50 dark:border-slate-700/50">
                <button onClick={onClose} className="px-6 py-2.5 text-sm font-semibold rounded-full hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500">Cancel</button>
                <button onClick={handleSubmit} disabled={isSubmitDisabled} className="px-6 py-2.5 text-sm font-semibold text-white bg-primary rounded-full hover:bg-indigo-700 disabled:opacity-50 flex justify-center items-center w-32">
                    {isCreating ? <SpinnerIcon className="animate-spin h-5 w-5 text-white" /> : 'Create Room'}
                </button>
            </div>
        </div>
    </div>);
};
export default CreateRoomModal;
