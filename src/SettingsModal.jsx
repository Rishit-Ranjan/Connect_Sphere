import React, { useState, useRef, useEffect } from 'react';
import { X, User, Bell } from 'lucide-react';

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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div ref={modalRef} className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-700">
                <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Settings</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto">
                    {/* Account Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center">
                            <User className="h-5 w-5 mr-2" />
                            Account
                        </h3>
                        <div className="flex items-center space-x-4">
                            <img src={currentUser.avatar} alt={currentUser.name} className="h-16 w-16 rounded-full object-cover border-2 border-slate-200 dark:border-slate-600" />
                            <div>
                                <p className="font-bold">{currentUser.name}</p>
                                <p className="text-sm text-slate-500">{currentUser.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Notifications Section */}
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
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;