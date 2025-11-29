import React, { useState } from 'react';
import { XIcon, LockClosedIcon, UserIcon, BellIcon } from '../Icons';

const SettingsModal = ({ onClose, currentUser, onUpdateUser }) => {
    const [activeTab, setActiveTab] = useState('account');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPrivate, setIsPrivate] = useState(currentUser?.isPrivate || false);
    const [emailNotifications, setEmailNotifications] = useState(true);

    const handleSavePassword = (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert("New passwords do not match.");
            return;
        }
        if (oldPassword !== currentUser.password) {
            alert("Incorrect old password.");
            return;
        }
        onUpdateUser({ password: newPassword });
        alert("Password updated successfully!");
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    const handleSavePrivacy = () => {
        onUpdateUser({ isPrivate });
        alert("Privacy settings updated.");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white dark:bg-secondary w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[600px] animate-slide-up">

                {/* Sidebar */}
                <div className="w-full md:w-1/3 bg-gray-50 dark:bg-gray-800/50 p-6 border-r border-gray-100 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Settings</h2>
                    <nav className="space-y-2">
                        <button
                            onClick={() => setActiveTab('account')}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'account' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                        >
                            <LockClosedIcon className="h-5 w-5" />
                            <span className="font-medium">Security</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('privacy')}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'privacy' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                        >
                            <UserIcon className="h-5 w-5" />
                            <span className="font-medium">Privacy</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('notifications')}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'notifications' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                        >
                            <BellIcon className="h-5 w-5" />
                            <span className="font-medium">Notifications</span>
                        </button>
                    </nav>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-8 relative overflow-y-auto">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <XIcon className="h-6 w-6" />
                    </button>

                    {activeTab === 'account' && (
                        <div className="space-y-6 animate-fade-in">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Change Password</h3>
                            <form onSubmit={handleSavePassword} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                                    <input
                                        type="password"
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-primary hover:bg-indigo-600 text-white font-semibold rounded-lg shadow-lg shadow-primary/30 transition-all transform hover:scale-105"
                                    >
                                        Update Password
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'privacy' && (
                        <div className="space-y-6 animate-fade-in">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Privacy Settings</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-white">Private Account</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Only followers can see your posts and photos.</p>
                                    </div>
                                    <button
                                        onClick={() => setIsPrivate(!isPrivate)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${isPrivate ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-600'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPrivate ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                                <div className="pt-4">
                                    <button
                                        onClick={handleSavePrivacy}
                                        className="px-6 py-2 bg-primary hover:bg-indigo-600 text-white font-semibold rounded-lg shadow-lg shadow-primary/30 transition-all transform hover:scale-105"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="space-y-6 animate-fade-in">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Notification Preferences</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-white">Email Notifications</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Receive emails about your account activity.</p>
                                    </div>
                                    <button
                                        onClick={() => setEmailNotifications(!emailNotifications)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${emailNotifications ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-600'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${emailNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
