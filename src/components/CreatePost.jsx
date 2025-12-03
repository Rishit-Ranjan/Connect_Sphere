import React, { useState, useRef } from 'react';
import { PhotoIcon, PaperclipIcon, MegaphoneIcon } from '../Icons';
import UserAvatar from './UserAvatar';

const CreatePost = ({ onAddPost, currentUser }) => {
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [file, setFile] = useState(null);
    const [isAnnouncement, setIsAnnouncement] = useState(false);
    const imageInputRef = useRef(null);
    const fileInputRef = useRef(null);

    const handleImageSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
                setFile(null);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setImage(null);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!content.trim() && !image && !file) return;

        onAddPost({
            content,
            imageUrl: image,
            fileName: file?.name,
            fileUrl: file ? URL.createObjectURL(file) : null,
            isAnnouncement: isAnnouncement && currentUser.role === 'admin',
        });

        setContent('');
        setImage(null);
        setFile(null);
        setIsAnnouncement(false);
        if (imageInputRef.current) imageInputRef.current.value = '';
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="bg-white dark:bg-secondary p-4 rounded-2xl shadow-sm mb-6">
            <form onSubmit={handleSubmit}>
                <div className="flex items-start space-x-4">
                    <UserAvatar user={currentUser} />
                    <div className="flex-1">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full bg-transparent focus:outline-none text-lg placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                            placeholder={`What's on your mind, ${currentUser.name}?`}
                            rows="3"
                        />
                        {image && <img src={image} alt="Preview" className="mt-2 rounded-lg max-h-60" />}
                        {file && <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">Attached: {file.name}</div>}
                    </div>
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2">
                        <input type="file" accept="image/*" ref={imageInputRef} onChange={handleImageSelect} className="hidden" />
                        <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                        <button type="button" onClick={() => imageInputRef.current.click()} className="p-2 text-gray-500 hover:text-primary rounded-full hover:bg-primary/10 transition" title="Add Image">
                            <PhotoIcon className="h-6 w-6" />
                        </button>
                        <button type="button" onClick={() => fileInputRef.current.click()} className="p-2 text-gray-500 hover:text-primary rounded-full hover:bg-primary/10 transition" title="Attach File">
                            <PaperclipIcon className="h-6 w-6" />
                        </button>
                        {currentUser.role === 'admin' && (
                            <button
                                type="button"
                                onClick={() => setIsAnnouncement(!isAnnouncement)}
                                className={`p-2 rounded-full transition ${isAnnouncement ? 'text-white bg-primary' : 'text-gray-500 hover:text-primary hover:bg-primary/10'}`}
                                title="Mark as Announcement"
                            >
                                <MegaphoneIcon className="h-6 w-6" />
                            </button>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={!content.trim() && !image && !file}
                        className="bg-primary text-white font-semibold px-6 py-2 rounded-full hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                    >
                        Post
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreatePost;