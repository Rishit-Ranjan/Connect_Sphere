import React, { useState, useRef } from 'react';
import { PhotoIcon, PaperclipIcon, MegaphoneIcon } from '../Icons';
import UserAvatar from './UserAvatar';

const CreatePost = ({ onAddPost, currentUser }) => {
    const [content, setContent] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [file, setFile] = useState(null);
    const [fileType, setFileType] = useState(null);
    const [isAnnouncement, setIsAnnouncement] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const imageInputRef = useRef(null);
    const fileInputRef = useRef(null);
    const editorRef = useRef(null);

    const handleImageSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setImagePreview(URL.createObjectURL(selectedFile));
            setFileType('image');
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setImagePreview(null);
            setFileType('file');
            setContent('');
            if (editorRef.current) editorRef.current.innerHTML = '';
        }
    };

    const getPlainText = () => {
        if (!editorRef.current) return '';
        // Walk text nodes to get combined text preserving newlines from <br>
        let text = '';
        const walk = (node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                text += node.textContent;
            } else if (node.nodeName === 'BR') {
                text += '\n';
            } else {
                node.childNodes.forEach(walk);
            }
        };
        walk(editorRef.current);
        return text;
    };

    const saveCaretOffset = () => {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0 || !editorRef.current) return 0;
        const range = sel.getRangeAt(0);
        const pre = range.cloneRange();
        pre.selectNodeContents(editorRef.current);
        pre.setEnd(range.endContainer, range.endOffset);
        return pre.toString().length;
    };

    const restoreCaretOffset = (offset) => {
        if (!editorRef.current) return;
        const walker = document.createTreeWalker(editorRef.current, NodeFilter.SHOW_TEXT);
        let pos = 0;
        let node;
        while ((node = walker.nextNode())) {
            const len = node.textContent.length;
            if (pos + len >= offset) {
                const range = document.createRange();
                const sel = window.getSelection();
                range.setStart(node, offset - pos);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
                return;
            }
            pos += len;
        }
        // fallback: place caret at end
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
    };

    const applyHighlighting = () => {
        if (!editorRef.current) return;
        const text = getPlainText();
        setContent(text);

        const caretOffset = saveCaretOffset();

        const escaped = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        const highlighted = escaped
            .replace(
                /#([a-zA-Z0-9_]+)/g,
                '<span style="color:#6366f1;font-weight:700;">#$1</span>'
            )
            .replace(/\n/g, '<br>');

        editorRef.current.innerHTML = highlighted;
        restoreCaretOffset(caretOffset);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const text = getPlainText();
        if (!text.trim() && !file) return;
        setIsSubmitting(true);

        if (fileType === 'file') {
            await onAddPost(null, file);
        } else {
            const extractedHashtags = text.match(/#[a-zA-Z0-9_]+/g);
            const processedHashtags = extractedHashtags
                ? extractedHashtags.map(h => h.toLowerCase())
                : [];
            await onAddPost(
                {
                    content: text,
                    hashtags: processedHashtags,
                    isAnnouncement: isAnnouncement && currentUser.role === 'admin',
                },
                file
            );
        }

        if (editorRef.current) editorRef.current.innerHTML = '';
        setContent('');
        setImagePreview(null);
        setFile(null);
        setFileType(null);
        setIsAnnouncement(false);
        setIsSubmitting(false);
        if (imageInputRef.current) imageInputRef.current.value = '';
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="bg-white dark:bg-secondary p-4 rounded-2xl shadow-sm mb-6">
            <form onSubmit={handleSubmit}>
                <div className="flex items-start space-x-4">
                    <UserAvatar user={currentUser} />
                    <div className="flex-1 min-w-0">
                        {fileType === 'file' ? (
                            <p className="text-gray-400 dark:text-gray-500 text-lg py-2">
                                Uploading:{' '}
                                <span className="font-semibold text-primary">{file?.name}</span>
                            </p>
                        ) : (
                            <div
                                ref={editorRef}
                                contentEditable
                                suppressContentEditableWarning
                                onInput={applyHighlighting}
                                className="w-full min-h-[4.5rem] focus:outline-none text-lg text-gray-800 dark:text-gray-200 leading-relaxed"
                                style={{ wordBreak: 'break-word' }}
                                data-placeholder={`What's on your mind, ${currentUser.name}?`}
                            />
                        )}
                        {/* Placeholder via CSS since contentEditable doesn't support it natively */}
                        {!content && fileType !== 'file' && (
                            <p
                                className="absolute pointer-events-none text-lg text-gray-400 dark:text-gray-500"
                                style={{ marginTop: '-4.5rem' }}
                            >
                                {`What's on your mind, ${currentUser.name}?`}
                            </p>
                        )}
                        {imagePreview && (
                            <img src={imagePreview} alt="Preview" className="mt-2 rounded-lg max-h-60" />
                        )}
                    </div>
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2">
                        <input
                            type="file"
                            accept="image/*"
                            ref={imageInputRef}
                            onChange={handleImageSelect}
                            className="hidden"
                        />
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => imageInputRef.current.click()}
                            className="p-2 text-gray-500 hover:text-primary rounded-full hover:bg-primary/10 transition"
                            title="Add Image"
                        >
                            <PhotoIcon className="h-6 w-6" />
                        </button>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current.click()}
                            className="p-2 text-gray-500 hover:text-primary rounded-full hover:bg-primary/10 transition"
                            title="Attach File"
                        >
                            <PaperclipIcon className="h-6 w-6" />
                        </button>
                        {currentUser.role === 'admin' && (
                            <button
                                type="button"
                                onClick={() => setIsAnnouncement(!isAnnouncement)}
                                className={`p-2 rounded-full transition ${
                                    isAnnouncement
                                        ? 'text-white bg-primary'
                                        : 'text-gray-500 hover:text-primary hover:bg-primary/10'
                                }`}
                                title="Mark as Announcement"
                            >
                                <MegaphoneIcon className="h-6 w-6" />
                            </button>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting || (!content.trim() && !file)}
                        className="bg-primary text-white font-semibold px-6 py-2 rounded-full hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                    >
                        {isSubmitting ? 'Posting...' : 'Post'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreatePost;