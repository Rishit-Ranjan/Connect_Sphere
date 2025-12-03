import React, { useState, useRef, useEffect } from 'react';
import { XIcon, UserIcon, BellIcon } from '../Icons';
import UserAvatar from './UserAvatar';

const SettingsModal = ({ currentUser, onUpdateUser, onClose }) => {
    const modalRef = useRef(null);
    // Initialize state from currentUser, defaulting to true if undefined
    const [emailNotifications, setEmailNotifications] = useState(currentUser.emailNotifications ?? true);

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
        // Call the update function passed from App.jsx
        onUpdateUser({ ...currentUser, emailNotifications: newValue });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-fast">
            <div ref={modalRef} className="bg-white dark:bg-secondary rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Settings</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto">
                    {/* Account Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                            <UserIcon className="h-5 w-5 mr-2" />
                            Account
                        </h3>
                        <div className="flex items-center space-x-4">
                            <UserAvatar user={currentUser} className="h-16 w-16" />
                            <div>
                                <p className="font-bold">{currentUser.name}</p>
                                <p className="text-sm text-gray-500">{currentUser.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Notifications Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                            <BellIcon className="h-5 w-5 mr-2" />
                            Notifications
                        </h3>
                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                            <div>
                                <p className="font-medium text-gray-800 dark:text-gray-200">Email Notifications</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications for likes, comments, and messages via email.</p>
                            </div>
                            <button
                                onClick={handleToggle}
                                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-secondary ${emailNotifications ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
                            >
                                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${emailNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;