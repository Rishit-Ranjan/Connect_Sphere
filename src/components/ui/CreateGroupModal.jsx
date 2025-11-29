import React, { useState } from 'react';
import { XIcon, SpinnerIcon } from '../Icons';
import UserAvatar from './UserAvatar';
const CreateGroupModal = ({ currentUser, users, onCreateGroup, onClose }) => {
    const [groupName, setGroupName] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const handleMemberToggle = (user) => {
        setSelectedMembers(prev => prev.some(member => member.id === user.id)
            ? prev.filter(member => member.id !== user.id)
            : [...prev, user]);
    };
    const handleSubmit = async () => {
        if (!groupName.trim() || selectedMembers.length === 0 || isCreating)
            return;
        setIsCreating(true);
        try {
            await onCreateGroup(groupName, selectedMembers);
            onClose();
        }
        catch (error) {
            console.error("Failed to create group", error);
            // Optionally show an error to the user
        }
        finally {
            setIsCreating(false);
        }
    };
    const availableUsers = users.filter(u => u.id !== currentUser.id && u.status === 'active');
    return (<div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-secondary rounded-2xl shadow-2xl w-full max-w-md transform animate-fade-in-scale flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Create a Group Chat</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <XIcon className="h-6 w-6"/>
                    </button>
                </div>
                <div className="p-6 space-y-6 overflow-y-auto">
                    <div>
                        <label htmlFor="groupName" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Group Name</label>
                        <input type="text" id="groupName" value={groupName} onChange={(e) => setGroupName(e.target.value)} className="block w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" placeholder="My awesome group" disabled={isCreating}/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Select Members</label>
                        <div className="space-y-2 max-h-60 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            {availableUsers.map(user => (<label key={user.id} htmlFor={`user-${user.id}`} className={`flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg ${isCreating ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                                    <input type="checkbox" id={`user-${user.id}`} checked={selectedMembers.some(m => m.id === user.id)} onChange={() => handleMemberToggle(user)} className="h-5 w-5 rounded text-primary focus:ring-primary" disabled={isCreating}/>
                                    <UserAvatar user={user} className="h-8 w-8"/>
                                    <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">{user.name}</span>
                                </label>))}
                        </div>
                    </div>
                </div>
                <div className="flex justify-end space-x-4 p-6 bg-gray-50 dark:bg-secondary/50 rounded-b-2xl mt-auto">
                    <button onClick={onClose} className="px-6 py-2.5 text-sm font-semibold rounded-full hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500">Cancel</button>
                    <button onClick={handleSubmit} disabled={!groupName.trim() || selectedMembers.length === 0 || isCreating} className="px-6 py-2.5 text-sm font-semibold text-white bg-primary rounded-full hover:bg-indigo-700 disabled:opacity-50 flex justify-center items-center w-32">
                        {isCreating ? <SpinnerIcon className="animate-spin h-5 w-5 text-white"/> : 'Create Group'}
                    </button>
                </div>
            </div>
        </div>);
};
export default CreateGroupModal;
