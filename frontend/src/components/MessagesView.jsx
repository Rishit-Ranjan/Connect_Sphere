/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useRef, useEffect } from 'react';
import { Send, Search, CheckCheck, MessageSquare, Compass, ShieldCheck, Paperclip, Mic, Square, X } from 'lucide-react';
import { resolveApiAssetUrl } from '../config/api';
import { getAuthToken } from '../utils/authToken';

function MessageAttachment({ attachment }) {
    const [mediaUrl, setMediaUrl] = useState('');
    const [loadError, setLoadError] = useState('');

    useEffect(() => {
        let objectUrl;
        let cancelled = false;
        setMediaUrl('');
        setLoadError('');

        fetch(resolveApiAssetUrl(attachment.url), {
            headers: { Authorization: `Bearer ${getAuthToken()}` }
        })
            .then((response) => {
                if (!response.ok) throw new Error('Unable to load this attachment.');
                return response.blob();
            })
            .then((blob) => {
                if (cancelled) return;
                objectUrl = URL.createObjectURL(blob);
                setMediaUrl(objectUrl);
            })
            .catch((error) => {
                if (!cancelled) setLoadError(error.message);
            });

        return () => {
            cancelled = true;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [attachment.url]);

    if (loadError) {
        return <p role="alert" className="mt-2 text-[10px] text-rose-100">{loadError}</p>;
    }
    if (!mediaUrl) {
        return <p className="mt-2 text-[10px] opacity-75">Loading attachment...</p>;
    }

    if (attachment.mimeType.startsWith('image/')) {
        return (
            <img
                src={mediaUrl}
                alt={attachment.filename}
                className="mt-2 max-h-64 max-w-full rounded-xl object-contain"
            />
        );
    }
    if (attachment.mimeType.startsWith('video/')) {
        return (
            <video
                src={mediaUrl}
                controls
                preload="metadata"
                className="mt-2 max-h-64 max-w-full rounded-xl"
              />
        );
    }
    if (attachment.mimeType.startsWith('audio/')) {
        return <audio src={mediaUrl} controls preload="metadata" className="mt-2 max-w-full" />;
    }

    return (
        <a
            href={mediaUrl}
            download={attachment.filename}
            className="mt-2 block text-xs font-semibold underline"
        >
            Download {attachment.filename}
        </a>
    );
}

export default function MessagesView({ currentUser, users, directMessages, onSendDirectMessage, selectedRecipient, setSelectedRecipient, isDrawer = false }) {
    const [searchText, setSearchText] = useState('');
    const [typedMessage, setTypedMessage] = useState('');
    const [pendingAttachment, setPendingAttachment] = useState(null);
    const [messageError, setMessageError] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const messageEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const recorderRef = useRef(null);
    const recordingStreamRef = useRef(null);
    const recordingChunksRef = useRef([]);
    // Find contacts (excluding myself)
    const contacts = users.filter((u) => String(u.id || u._id) !== String(currentUser.id || currentUser._id));
    // Set default recipient to first contact if none selected
    useEffect(() => {
        if (!selectedRecipient && contacts.length > 0) {
            setSelectedRecipient(contacts[0]);
        }
    }, [contacts, selectedRecipient, setSelectedRecipient]);
    // Messages between current user and selected recipient
    const currentUserId = String(currentUser.id || currentUser._id || '');
    const recipientId = String(selectedRecipient?.id || selectedRecipient?._id || '');
    const activeChatMessages = directMessages.filter((msg) =>
        (String(msg.senderId) === currentUserId && String(msg.receiverId) === recipientId) ||
        (String(msg.senderId) === recipientId && String(msg.receiverId) === currentUserId));
    // Scroll to bottom of chat
    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeChatMessages]);
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if ((!typedMessage.trim() && !pendingAttachment) || !selectedRecipient || isRecording || isSending)
            return;
        setMessageError('');
        setIsSending(true);
        try {
            await onSendDirectMessage(selectedRecipient.id || selectedRecipient._id, typedMessage, pendingAttachment);
            setTypedMessage('');
            setPendingAttachment(null);
        } catch (error) {
            setMessageError(error.message || 'Failed to send message.');
        } finally {
            setIsSending(false);
        }
    };

    const handleSelectAttachment = (event) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;
        if (!/^(image|video|audio)\//.test(file.type)) {
            setMessageError('Choose an image, video, or audio file.');
            return;
        }
        if (file.size > 20 * 1024 * 1024) {
            setMessageError('Choose a media file no larger than 20 MB.');
            return;
        }
        setMessageError('');
        setPendingAttachment(file);
    };

    const startVoiceRecording = async () => {
        setMessageError('');
        if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
            setMessageError('Voice recording is not supported in this browser.');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            recordingStreamRef.current = stream;
            recordingChunksRef.current = [];
            const recorder = new MediaRecorder(stream);
            recorderRef.current = recorder;
            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) recordingChunksRef.current.push(event.data);
            };
            recorder.onerror = () => {
                setMessageError('Voice recording failed. Please try again.');
                setIsRecording(false);
                stream.getTracks().forEach((track) => track.stop());
            };
            recorder.onstop = () => {
                const blob = new Blob(recordingChunksRef.current, {
                    type: recorder.mimeType || 'audio/webm'
                });
                if (blob.size > 20 * 1024 * 1024) {
                    setMessageError('This recording is over the 20 MB limit.');
                } else if (blob.size > 0) {
                    const extension = blob.type.includes('ogg') ? 'ogg'
                        : blob.type.includes('mp4') ? 'm4a' : 'webm';
                    setPendingAttachment(new File([blob], `voice-message-${Date.now()}.${extension}`, { type: blob.type }));
                }
                recordingStreamRef.current?.getTracks().forEach((track) => track.stop());
                recordingStreamRef.current = null;
                setIsRecording(false);
            };
            recorder.start();
            setIsRecording(true);
        } catch (error) {
            setMessageError(error.message || 'Allow microphone access to record a voice message.');
            recordingStreamRef.current?.getTracks().forEach((track) => track.stop());
            recordingStreamRef.current = null;
        }
    };

    const stopVoiceRecording = () => {
        if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    };

    useEffect(() => () => {
        const recorder = recorderRef.current;
        if (recorder && recorder.state !== 'inactive') {
            recorder.onstop = null;
            recorder.stop();
        }
        recordingStreamRef.current?.getTracks().forEach((track) => track.stop());
    }, []);
    const filteredContacts = contacts.filter((c) => c.name.toLowerCase().includes(searchText.toLowerCase()) ||
        c.handle.toLowerCase().includes(searchText.toLowerCase()));
    return (<div className={`flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden font-sans bg-white ${isDrawer ? 'h-full w-full' : 'h-[calc(100dvh-4rem-2px)] border border-slate-200 rounded-3xl m-2 sm:m-3 shadow-sm'}`}>
      
      {/* Messenger Contacts Sidebar */}
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col bg-slate-50/50 shrink-0 max-h-[45vh] md:max-h-none">
        <div className="p-4 border-b border-slate-200 space-y-3 bg-white">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare size={14} className="text-indigo-600"/>
              Messenger Contacts
            </h3>
            <span className="text-[10px] font-mono text-slate-400 font-bold">{contacts.length} peers</span>
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
              <Search size={13}/>
            </span>
            <input type="text" placeholder="Search contacts..." value={searchText} onChange={(e) => setSearchText(e.target.value)} className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:bg-white"/>
          </div>
        </div>

        {/* Contacts directory list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredContacts.map((contact) => {
            const isSelected = selectedRecipient?.id === contact.id;
            // Get the last message preview
            const lastMsg = directMessages
                .filter((m) => (String(m.senderId) === currentUserId && String(m.receiverId) === String(contact.id || contact._id)) ||
                (String(m.senderId) === String(contact.id || contact._id) && String(m.receiverId) === currentUserId))
                .pop();
            const lastMessagePreview = lastMsg?.text || (lastMsg?.attachment
                ? (lastMsg.attachment.mimeType.startsWith('audio/') ? 'Voice message' : 'Media attachment')
                : 'Start a friendly private chat...');
            return (<button key={contact.id} onClick={() => setSelectedRecipient(contact)} className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all relative ${isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/50'}`}>
                <div className="relative shrink-0">
                  <img src={contact.avatarUrl || null} alt={contact.name || 'User Avatar'} className="w-10 h-10 rounded-full object-cover border border-slate-100" referrerPolicy="no-referrer"/>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"/>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold truncate leading-tight">{contact.name}</h4>
                    {contact.role === 'admin' && (<span className="text-[8px] font-mono font-bold bg-amber-100/35 border border-amber-300 text-amber-700 px-1 rounded ml-1">Admin</span>)}
                  </div>
                  <p className="text-[10px] truncate mt-0.5 opacity-80 font-mono">@{contact.handle}</p>
                  <p className={`text-[10px] truncate mt-1 leading-snug ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                    {lastMessagePreview}
                  </p>
                </div>
              </button>);
        })}
        </div>
      </div>

      {/* Main Messenger Panel */}
      <div className="flex-1 flex flex-col justify-between h-full min-h-0 bg-white relative">
        {selectedRecipient ? (<>
            {/* Active Contact Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white z-10 shadow-sm">
              <div className="flex items-center gap-3 min-w-0">
                <img src={selectedRecipient.avatarUrl || null} alt={selectedRecipient.name || 'User Avatar'} className="w-10 h-10 rounded-full object-cover border border-slate-100 shrink-0" referrerPolicy="no-referrer"/>
                <div className="min-w-0">
                  <h2 className="font-display font-extrabold text-slate-900 text-sm truncate leading-none">
                    {selectedRecipient.name}
                  </h2>
                  <span className="text-[10px] text-slate-500 truncate block mt-1 font-mono">
                    @{selectedRecipient.handle} • {selectedRecipient.department || (selectedRecipient.role === 'admin' ? 'Administrator' : 'Student')}
                  </span>
                </div>
              </div>

              {selectedRecipient.role === 'admin' ? (<div className="flex items-center gap-1 text-[9px] font-mono bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-bold">
                  <ShieldCheck size={11}/>
                  ADMIN
                </div>) : (<div className="flex items-center gap-1 text-[9px] font-mono bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded font-medium">
                  <Compass size={11} className="text-slate-400"/>
                  PEER MEMBER
                </div>)}
            </div>

            {/* Conversation Messages Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/20">
              
              {/* Little visual introductory message */}
              <div className="text-center py-6 border-b border-slate-100 max-w-md mx-auto">
                <img src={selectedRecipient.avatarUrl || null} alt={selectedRecipient.name || 'User Avatar'} className="w-12 h-12 rounded-full object-cover mx-auto border border-slate-200 shadow-sm mb-2" referrerPolicy="no-referrer"/>
                <h3 className="text-xs font-extrabold text-slate-900">This is the start of your chat history</h3>
                {selectedRecipient.bio && (
                  <p className="text-[10px] text-slate-400 leading-normal mt-1.5">
                    {selectedRecipient.bio}
                  </p>
                )}
              </div>

              {activeChatMessages.map((msg) => {
                const isMe = String(msg.senderId) === currentUserId;
                return (<div key={msg.id} className={`flex gap-2.5 max-w-[75%] ${isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                    <img src={(isMe ? currentUser.avatarUrl : selectedRecipient.avatarUrl) || null} alt="Avatar" className="w-7 h-7 rounded-full object-cover border border-slate-100 shrink-0" referrerPolicy="no-referrer"/>
                    <div>
                      <div className={`text-xs p-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${isMe
                        ? 'bg-indigo-600 text-slate-100 rounded-tr-none'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'}`}>
                        {msg.text && <p>{msg.text}</p>}
                        {msg.attachment && <MessageAttachment attachment={msg.attachment} />}
                      </div>
                      
                      <div className={`flex items-center gap-1 mt-1 text-[8px] font-mono text-slate-400 ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <span>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMe && <CheckCheck size={11} className="text-slate-400"/>}
                      </div>
                    </div>
                  </div>);
            })}
              <div ref={messageEndRef}/>
            </div>

            {/* Message Composer Footer Input */}
            <div className="p-4 bg-white border-t border-slate-150">
              {pendingAttachment && (
                <div className="mb-2 flex items-center justify-between gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-[11px] text-indigo-800">
                  <span className="min-w-0 truncate">{pendingAttachment.name}</span>
                  <button
                    type="button"
                    onClick={() => setPendingAttachment(null)}
                    className="shrink-0 rounded p-1 hover:bg-indigo-100"
                    aria-label="Remove attachment"
                  >
                    <X size={13} />
                  </button>
                </div>
              )}
              {messageError && (
                <p role="alert" className="mb-2 text-[11px] font-medium text-rose-600">{messageError}</p>
              )}
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime,audio/mpeg,audio/wav,audio/x-wav,audio/ogg,audio/webm,audio/mp4,audio/x-m4a,audio/aac"
                  onChange={handleSelectAttachment}
                  className="hidden"
                  aria-label="Choose image, video, or audio attachment"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSending || isRecording}
                  className="shrink-0 rounded-xl border border-slate-200 p-2.5 text-slate-500 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-50"
                  aria-label="Attach media"
                  title="Attach image, video, or audio"
                >
                  <Paperclip size={15} />
                </button>
                <button
                  type="button"
                  onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                  disabled={isSending}
                  className={`shrink-0 rounded-xl border p-2.5 transition-colors disabled:opacity-50 ${
                    isRecording
                      ? 'border-rose-300 bg-rose-50 text-rose-600'
                      : 'border-slate-200 text-slate-500 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600'
                  }`}
                  aria-label={isRecording ? 'Stop voice recording' : 'Record voice message'}
                  aria-pressed={isRecording}
                  title={isRecording ? 'Stop recording' : 'Record voice message'}
                >
                  {isRecording ? <Square size={15} /> : <Mic size={15} />}
                </button>
                <input
                  type="text"
                  placeholder={isRecording ? 'Recording voice message...' : `Write a message to ${selectedRecipient.name.split(' ')[0]}...`}
                  value={typedMessage}
                  onChange={(event) => setTypedMessage(event.target.value)}
                  disabled={isRecording || isSending}
                  className="min-w-0 flex-1 text-xs px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={(!typedMessage.trim() && !pendingAttachment) || isSending || isRecording}
                  className="shrink-0 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-45 text-white px-4 py-2.5 rounded-xl flex items-center justify-center cursor-pointer transition-all"
                  aria-label="Send message"
                >
                  <Send size={13}/>
                </button>
              </form>
            </div>
          </>) : (<div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <MessageSquare size={36} className="text-slate-300 mb-2.5"/>
            <h3 className="font-display font-extrabold text-slate-900 text-sm">No active chat selected</h3>
            <p className="text-[11px] text-slate-500 max-w-xs mt-1.5">
              Select a peer contact on the left-hand directory to begin a direct live dialogue.
            </p>
          </div>)}
      </div>
    </div>);
}
