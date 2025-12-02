import React, { useState, useRef } from 'react';
import { PhotoIcon, PaperclipIcon, XIcon, SpinnerIcon } from '../Icons';
import UserAvatar from './UserAvatar';

const CreatePost = ({ onAddPost, currentUser }) => {
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [file, setFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const imageInputRef = useRef(null);
    const fileInputRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if ((!content.trim() && !image && !file) || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await onAddPost({
                content,
                imageUrl: image || undefined,
                fileName: file?.name,
                fileUrl: file ? URL.createObjectURL(file) : undefined
            });
            setContent('');
            setImage(null);
            setFile(null);
            if (imageInputRef.current) imageInputRef.current.value = "";
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (error) {
            console.error("Failed to add post", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImageSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    return (
        <div className="bg-white/85 dark:bg-slate-800/70 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-white/40 dark:border-slate-700/50 mb-8 transition-all hover:shadow-2xl hover:bg-white/95 dark:hover:bg-slate-800/80">
            <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                    <UserAvatar user={currentUser} className="h-12 w-12 ring-2 ring-primary/20" />
                </div>
                <div className="flex-1">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full p-4 border-none rounded-xl bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-700 dark:to-slate-700/50 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary/50 transition-all resize-none text-lg placeholder:text-gray-400"
                        rows={3}
                        placeholder={`What's on your mind, ${currentUser.name}?`}
                        disabled={isSubmitting}
                    />
                </div>
            </div>

            {image && (
                <div className="mt-4 relative group">
                    <div className="absolute inset-0 bg-black/10 rounded-xl group-hover:bg-black/20 transition-colors pointer-events-none" />
                    <img src={image} alt="Preview" className="rounded-xl max-h-80 w-full object-cover shadow-md" />
                    <button
                        onClick={() => setImage(null)}
                        className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 backdrop-blur-sm transition-all transform hover:scale-110"
                        disabled={isSubmitting}
                    >
                        <XIcon className="h-5 w-5" />
                    </button>
                </div>
            )}

            {file && (
                <div className="mt-4 flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
                    <div className="flex items-center space-x-3 overflow-hidden">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-800/50 rounded-lg">
                            <PaperclipIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                        </div>
                        <span className="text-sm font-medium text-indigo-900 dark:text-indigo-200 truncate">{file.name}</span>
                    </div>
                    <button
                        onClick={() => setFile(null)}
                        className="text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 p-1 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-800/50 transition-colors"
                        disabled={isSubmitting}
                    >
                        <XIcon className="h-5 w-5" />
                    </button>
                </div>
            )}

            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                <div className="flex space-x-2">
                    <input type="file" accept="image/*" ref={imageInputRef} onChange={handleImageSelect} className="hidden" disabled={isSubmitting} />
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" disabled={isSubmitting} />

                    <button
                        onClick={() => imageInputRef.current?.click()}
                        className="flex items-center space-x-2 px-4 py-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all group disabled:opacity-50"
                        disabled={isSubmitting}
                    >
                        <PhotoIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                        <span className="font-medium text-sm">Photo</span>
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center space-x-2 px-4 py-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all group disabled:opacity-50"
                        disabled={isSubmitting}
                    >
                        <PaperclipIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                        <span className="font-medium text-sm">File</span>
                    </button>
                </div>
                <button
                    onClick={handleSubmit}
                    className="bg-primary hover:bg-indigo-600 text-white font-bold px-8 py-2.5 rounded-full shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:shadow-none disabled:transform-none flex items-center justify-center min-w-[100px]"
                    disabled={(!content.trim() && !image && !file) || isSubmitting}
                >
                    {isSubmitting ? <SpinnerIcon className="animate-spin h-5 w-5 text-white" /> : 'Post'}
                </button>
            </div>
        </div>
    );
};

export default CreatePost;
