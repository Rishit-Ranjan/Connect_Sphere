import React, { useState, useRef, useEffect } from 'react';
import { X, User, Bell, KeyRound } from 'lucide-react';

const SettingsModal = ({ currentUser, onUpdateUser, onClose, onUpdatePassword }) => {
    const modalRef = useRef(null);
    const [emailNotifications, setEmailNotifications] = useState(currentUser.emailNotifications ?? true);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const handleToggle = () => {
        const newValue = !emailNotifications;
        setEmailNotifications(newValue);
        onUpdateUser({ ...currentUser, emailNotifications: newValue });
    };

    const handlePasswordChangeSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert("New passwords do not match.");
            return;
        }
        if (newPassword.length < 6) {
            alert("New password must be at least 6 characters long.");
            return;
        }

        setIsUpdatingPassword(true);
        const success = await onUpdatePassword(currentPassword, newPassword);
        setIsUpdatingPassword(false);

        if (success) {
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div ref={modalRef} className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-700">
                <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Settings</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 space-y-8 overflow-y-auto">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center">
                            <User className="h-5 w-5 mr-2" />
                            Account
                        </h3>
                        <div className="flex items-center space-x-4">
                            <img src={currentUser.avatar} alt={currentUser.name} className="h-16 w-16 rounded-full object-cover border-2 border-slate-200 dark:border-slate-600" />
                            <div>
                                <p className="font-bold text-lg">{currentUser.name}</p>
                                <p className="text-sm text-slate-500">{currentUser.email}</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center">
                            <Bell className="h-5 w-5 mr-2" />
                            Notifications
                        </h3>
                        <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg">
                            <div>
                                <p className="font-medium text-slate-800 dark:text-slate-200">Email Notifications</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Receive notifications for likes, comments, and messages via email.</p>
                            </div>
                            <button
                                onClick={handleToggle}
                                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:focus:ring-offset-slate-800 ${emailNotifications ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                            >
                                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${emailNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center">
                            <KeyRound className="h-5 w-5 mr-2" />
                            Change Password
                        </h3>
                        <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Current Password</label>
                                <input 
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">New Password</label>
                                <input 
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                    required
                                />
                            </div>
                            <div className="flex justify-end">
                                <button 
                                    type="submit"
                                    disabled={isUpdatingPassword}
                                    className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;