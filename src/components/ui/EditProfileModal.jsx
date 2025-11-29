import React, { useState, useRef } from 'react';
import { XIcon, CameraIcon, SpinnerIcon } from '../Icons';
const EditProfileModal = ({ user, onSave, onClose }) => {
    const [name, setName] = useState(user.name);
    const [newAvatar, setNewAvatar] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef(null);
    const handleAvatarChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewAvatar(reader.result);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    const handleSave = async () => {
        if (!name.trim() || isSaving)
            return;
        setIsSaving(true);
        try {
            await onSave({ name, avatar: newAvatar || user.avatar });
            onClose();
        }
        catch (error) {
            console.error("Failed to save profile", error);
        }
        finally {
            setIsSaving(false);
        }
    };
    return (<div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
            <div className="bg-white dark:bg-secondary rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale border border-gray-200 dark:border-gray-700">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Edit Profile</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <XIcon className="h-6 w-6"/>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    <div className="flex flex-col items-center space-y-4">
                        <div className={`relative group ${isSaving ? 'cursor-not-allowed' : 'cursor-pointer'}`} onClick={() => !isSaving && fileInputRef.current?.click()}>
                            <img className="h-28 w-28 rounded-full object-cover ring-4 ring-white dark:ring-secondary" src={newAvatar || user.avatar} alt="Avatar preview"/>
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-full flex items-center justify-center transition-opacity duration-300">
                                <CameraIcon className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
                            </div>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" disabled={isSaving}/>
                    </div>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Name</label>
                        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="block w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-2 border-transparent focus:border-primary rounded-lg shadow-sm focus:outline-none focus:ring-0 transition disabled:opacity-50" placeholder="Your name" disabled={isSaving}/>
                    </div>
                </div>
                
                {/* Footer */}
                <div className="flex justify-end space-x-4 p-6 bg-gray-50 dark:bg-secondary/50 rounded-b-2xl">
                    <button onClick={onClose} className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-gray-200/80 rounded-full hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors duration-200">
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={isSaving} className="px-6 py-2.5 text-sm font-semibold text-white bg-primary rounded-full hover:bg-indigo-700 transition-colors duration-200 transform hover:scale-105 disabled:opacity-50 flex justify-center items-center w-36">
                        {isSaving ? <SpinnerIcon className="animate-spin h-5 w-5 text-white"/> : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>);
};
export default EditProfileModal;
