import React, { useState } from 'react';
import { XIcon, LockClosedIcon, UserPlusIcon, SpinnerIcon, UsersIcon } from '../Icons';
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
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md transform animate-fade-in-scale flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-200/50 dark:border-slate-700/50">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Create a New Room</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <XIcon className="h-6 w-6" />
                </button>
            </div>
            <div className="p-6 space-y-6">
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
                <div>
                    <label htmlFor="roomName" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Room Name</label>
                    <input type="text" id="roomName" value={roomName} onChange={(e) => setRoomName(e.target.value)} className="block w-full px-4 py-3 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-700 dark:to-slate-700/50 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" placeholder="e.g., #gaming, #project-alpha" disabled={isCreating} />
                </div>
                {privacy === 'password_protected' && (<div className="animate-fade-in-scale space-y-4">
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Room Password</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full px-4 py-3 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-700 dark:to-slate-700/50 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" placeholder="Min. 4 characters" disabled={isCreating} />
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-700/50 dark:to-slate-700/30 p-3 rounded-lg text-sm text-gray-600 dark:text-gray-400 border border-blue-200/50 dark:border-slate-600/50">
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">For Demo</h4>
                        <p>You can join the existing 'Design Lounge' room using the password: <strong>design</strong></p>
                    </div>
                </div>)}
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
