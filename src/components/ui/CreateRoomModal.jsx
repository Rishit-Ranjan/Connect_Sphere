import React, { useState } from 'react';
import { XIcon, LockClosedIcon, UserPlusIcon, SpinnerIcon } from '../Icons';
const CreateRoomModal = ({ onCreateRoom, onClose }) => {
    const [roomName, setRoomName] = useState('');
    const [privacy, setPrivacy] = useState('invite_only');
    const [password, setPassword] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const handleSubmit = async () => {
        if (!roomName.trim() || isCreating)
            return;
        if (privacy === 'password_protected' && !password.trim())
            return;
        setIsCreating(true);
        try {
            await onCreateRoom(roomName, privacy, password);
            onClose();
        }
        catch (error) {
            console.error("Failed to create room", error);
        }
        finally {
            setIsCreating(false);
        }
    };
    const isSubmitDisabled = !roomName.trim() || (privacy === 'password_protected' && password.length < 4) || isCreating;
    return (<div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-secondary rounded-2xl shadow-2xl w-full max-w-md transform animate-fade-in-scale flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Create a New Room</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <XIcon className="h-6 w-6"/>
                    </button>
                </div>
                <div className="p-6 space-y-6">
                     <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Room Type</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => setPrivacy('invite_only')} disabled={isCreating} className={`p-4 rounded-lg border-2 text-left transition ${privacy === 'invite_only' ? 'border-primary bg-primary/10' : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'} disabled:opacity-50 disabled:cursor-not-allowed`}>
                                <UserPlusIcon className="h-6 w-6 mb-2 text-primary"/>
                                <p className="font-semibold text-gray-800 dark:text-white">Invite-Only</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Completely private. Only invited members can see and join.</p>
                            </button>
                            <button onClick={() => setPrivacy('password_protected')} disabled={isCreating} className={`p-4 rounded-lg border-2 text-left transition ${privacy === 'password_protected' ? 'border-primary bg-primary/10' : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'} disabled:opacity-50 disabled:cursor-not-allowed`}>
                                <LockClosedIcon className="h-6 w-6 mb-2 text-primary"/>
                                <p className="font-semibold text-gray-800 dark:text-white">Password</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Discoverable, but requires a password to join.</p>
                            </button>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="roomName" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Room Name</label>
                        <input type="text" id="roomName" value={roomName} onChange={(e) => setRoomName(e.target.value)} className="block w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" placeholder="e.g., #gaming, #project-alpha" disabled={isCreating}/>
                    </div>
                    {privacy === 'password_protected' && (<div className="animate-fade-in-scale space-y-4">
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Room Password</label>
                                <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" placeholder="Min. 4 characters" disabled={isCreating}/>
                            </div>
                             <div className="bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg text-sm text-gray-600 dark:text-gray-400">
                                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">For Demo</h4>
                                <p>You can join the existing 'Design Lounge' room using the password: <strong>design</strong></p>
                             </div>
                        </div>)}
                </div>
                <div className="flex justify-end space-x-4 p-6 bg-gray-50 dark:bg-secondary/50 rounded-b-2xl mt-auto">
                    <button onClick={onClose} className="px-6 py-2.5 text-sm font-semibold rounded-full hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500">Cancel</button>
                    <button onClick={handleSubmit} disabled={isSubmitDisabled} className="px-6 py-2.5 text-sm font-semibold text-white bg-primary rounded-full hover:bg-indigo-700 disabled:opacity-50 flex justify-center items-center w-32">
                        {isCreating ? <SpinnerIcon className="animate-spin h-5 w-5 text-white"/> : 'Create Room'}
                    </button>
                </div>
            </div>
        </div>);
};
export default CreateRoomModal;
