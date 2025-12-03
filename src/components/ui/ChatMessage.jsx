import React, { useState, useEffect } from 'react';
import * as cryptoService from '../../services/cryptoService';
import { PaperclipIcon } from '../Icons';
import UserAvatar from './UserAvatar';
const ChatMessage = ({ message, secret, currentUser, allUsers }) => {
    const [content, setContent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const sender = allUsers.find(u => u.id === message.senderId);
    useEffect(() => {
        const processMessage = async () => {
            setIsLoading(true);
            if (message.encryptedData && secret) {
                try {
                    const decrypted = await cryptoService.decrypt(secret, message.encryptedData);
                    setContent(JSON.parse(decrypted));
                }
                catch (e) {
                    console.error("Failed to decrypt message:", e);
                    setContent({ text: "⚠️ Could not decrypt message." });
                }
                finally {
                    setIsLoading(false);
                }
            }
            else if (message.content) {
                setContent(message.content);
                setIsLoading(false);
            }
            else if (!secret && message.encryptedData) {
                setContent({ text: "Establishing secure connection..." });
                setIsLoading(false);
            }
        };
        processMessage();
    }, [message, secret]);
    if (isLoading || !sender || !content) {
        return (<div className="flex items-end gap-2 justify-center">
            <div className="max-w-xs md:max-w-md lg:max-w-lg rounded-2xl p-3 bg-gray-200 dark:bg-gray-600 animate-pulse">
                <div className="h-4 w-32 bg-gray-300 dark:bg-gray-500 rounded"></div>
            </div>
        </div>);
    }
    const isFromCurrentUser = message.senderId === currentUser.id;
    return (<div className={`flex items-start gap-2 ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}>
        {!isFromCurrentUser && (<div className="flex flex-col items-center">
            <UserAvatar user={sender} className="h-8 w-8" />
            <p className="text-xs text-gray-400 mt-1">{sender.name.split(' ')[0]}</p>
        </div>)}
        <div className={`flex flex-col max-w-xs md:max-w-md lg:max-w-lg rounded-2xl overflow-hidden shadow-sm ${isFromCurrentUser ? 'bg-gradient-to-br from-primary to-indigo-600 text-white rounded-br-none' : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200 dark:border-slate-600'}`}>
            {content.imageUrl && (<img src={content.imageUrl} alt="attached content" className="w-full h-auto object-cover" />)}
            {content.fileName && content.fileUrl && (<a href={content.fileUrl} download={content.fileName} className={`flex items-center space-x-2 p-3 transition ${isFromCurrentUser ? 'hover:bg-indigo-500' : 'hover:bg-gray-300 dark:hover:bg-gray-500'}`}>
                <PaperclipIcon className="h-6 w-6 flex-shrink-0" />
                <div className="overflow-hidden">
                    <p className="text-sm font-medium truncate">{content.fileName}</p>
                    <p className="text-xs opacity-80">Click to download</p>
                </div>
            </a>)}
            {content.text && <p className="px-3 py-2 break-words">{content.text}</p>}
        </div>
    </div>);
};
export default ChatMessage;
