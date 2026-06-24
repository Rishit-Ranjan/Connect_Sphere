/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useRef, useEffect } from 'react';
import { Send, Search, CheckCheck, MessageSquare, Compass, ShieldCheck } from 'lucide-react';
export default function MessagesView({ currentUser, users, directMessages, onSendDirectMessage, selectedRecipient, setSelectedRecipient }) {
    const [searchText, setSearchText] = useState('');
    const [typedMessage, setTypedMessage] = useState('');
    const messageEndRef = useRef(null);
    // Find contacts (excluding myself)
    const contacts = users.filter((u) => u.id !== currentUser.id);
    // Set default recipient to first contact if none selected
    useEffect(() => {
        if (!selectedRecipient && contacts.length > 0) {
            setSelectedRecipient(contacts[0]);
        }
    }, [contacts, selectedRecipient, setSelectedRecipient]);
    // Messages between current user and selected recipient
    const activeChatMessages = directMessages.filter((msg) => (msg.senderId === currentUser.id && msg.receiverId === selectedRecipient?.id) ||
        (msg.senderId === selectedRecipient?.id && msg.receiverId === currentUser.id));
    // Scroll to bottom of chat
    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeChatMessages]);
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!typedMessage.trim() || !selectedRecipient)
            return;
        const currentRecipientId = selectedRecipient.id;
        onSendDirectMessage(currentRecipientId, typedMessage);
        const textSent = typedMessage;
        setTypedMessage('');
        // Trigger customized Simulated Reply based on recipient persona in 1.2 seconds!
        setTimeout(() => {
            let simulatedReply = "Hi! Thanks for reaching out. I'm currently busy with lectures but I'll get back to you shortly!";
            const lower = textSent.toLowerCase();
            if (currentRecipientId === 'admin-1') {
                simulatedReply = "Hello! ConnectSphere Server is operational. Let me know if you need student permissions, notice pinning, or help clearing inappropriate feeds.";
                if (lower.includes('post') || lower.includes('delete') || lower.includes('feed')) {
                    simulatedReply = "Understood. As administrator, I can instantly delete any feed or comment. Please send me the post ID or author name to moderate.";
                }
                else if (lower.includes('pin') || lower.includes('announcement') || lower.includes('notice')) {
                    simulatedReply = "No problem! I will ensure important notices are featured in the right-hand announcement carousel for maximum student visibility.";
                }
            }
            else if (currentRecipientId === 'user-1') {
                // Rhodimus Prime
                simulatedReply = "Hey there! I'm coordinating team signups for the campus Hackathon. Are you looking to join a team, or do you have a prototype idea ready?";
                if (lower.includes('code') || lower.includes('react') || lower.includes('react native') || lower.includes('developer')) {
                    simulatedReply = "Awesome! I primarily code in React Native and TypeScript. We have a CS room where we review parser conflicts and compiler guides. Join us there!";
                }
                else if (lower.includes('placement') || lower.includes('google') || lower.includes('job')) {
                    simulatedReply = "Google's hiring drive is active! Download my consolidated 'Google Recruitment Prep Kit' ZIP file from the Resource Library tab. It includes extensive algorithmic questions.";
                }
            }
            else if (currentRecipientId === 'user-2') {
                // Clara Oswald
                simulatedReply = "Hi! I'm sitting by the window in the central library, sipping a cinnamon latte and reading some romantic philosophy. What are you up to?";
                if (lower.includes('book') || lower.includes('study') || lower.includes('exam') || lower.includes('write')) {
                    simulatedReply = "Studying can be hectic! I find wrapping up summaries with Alan Watts concepts really keeps the stress down. Let me know if you want to share coffee!";
                }
                else if (lower.includes('hackathon') || lower.includes('design')) {
                    simulatedReply = "I'm joining the hackathon for UI/UX wireframing and user stories! Multi-disciplinary student teams make the best designs.";
                }
            }
            else if (currentRecipientId === 'user-3') {
                // Dr. Julian Bashir
                simulatedReply = "Greetings! I'm currently grading research outlines in computational genomics. Let me know if you need guidance on seq-alignment algorithms.";
                if (lower.includes('quiz') || lower.includes('exam') || lower.includes('test') || lower.includes('slide')) {
                    simulatedReply = "Make sure to review seq-alignment matrices and dynamic programming algorithms. I've uploaded the full BMS-402 PDF slide deck under the Resources tab. Download it!";
                }
            }
            else if (currentRecipientId === 'user-4') {
                // Sarah Chen
                simulatedReply = "Hey! Coding under the stars here. Wrapping up a React website project. Are you building anything interesting?";
            }
            onSendDirectMessage(currentUser.id, simulatedReply);
            // Ensure the senderId is simulated as recipient
            // Wait, in onSendDirectMessage, the function takes: (receiverId, text, optional senderId)
            // Let's adjust the state callback in App.tsx to handle simulating recipient replying to me.
            // We will define a general onSendDirectMessage that handles custom sender/receiver easily.
        }, 1200);
    };
    const filteredContacts = contacts.filter((c) => c.name.toLowerCase().includes(searchText.toLowerCase()) ||
        c.handle.toLowerCase().includes(searchText.toLowerCase()));
    return (<div className="flex-1 flex h-[calc(100vh-2px)] overflow-hidden font-sans bg-white border border-slate-200 rounded-3xl m-3 shadow-sm">
      
      {/* Messenger Contacts Sidebar */}
      <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50/50 shrink-0">
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
                .filter((m) => (m.senderId === currentUser.id && m.receiverId === contact.id) ||
                (m.senderId === contact.id && m.receiverId === currentUser.id))
                .pop();
            return (<button key={contact.id} onClick={() => setSelectedRecipient(contact)} className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all relative ${isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/50'}`}>
                <div className="relative shrink-0">
                  <img src={contact.avatarUrl} alt={contact.name} className="w-10 h-10 rounded-full object-cover border border-slate-100" referrerPolicy="no-referrer"/>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"/>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold truncate leading-tight">{contact.name}</h4>
                    {contact.role === 'admin' && (<span className="text-[8px] font-mono font-bold bg-amber-100/35 border border-amber-300 text-amber-700 px-1 rounded ml-1">Admin</span>)}
                  </div>
                  <p className="text-[10px] truncate mt-0.5 opacity-80 font-mono">@{contact.handle}</p>
                  <p className={`text-[10px] truncate mt-1 leading-snug ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                    {lastMsg ? lastMsg.text : 'Start a friendly private chat...'}
                  </p>
                </div>
              </button>);
        })}
        </div>
      </div>

      {/* Main Messenger Panel */}
      <div className="flex-1 flex flex-col justify-between h-full bg-white relative">
        {selectedRecipient ? (<>
            {/* Active Contact Header */}
            <div className="p-4.5 border-b border-slate-200 flex items-center justify-between bg-white z-10 shadow-sm">
              <div className="flex items-center gap-3 min-w-0">
                <img src={selectedRecipient.avatarUrl} alt={selectedRecipient.name} className="w-10 h-10 rounded-full object-cover border border-slate-100 shrink-0" referrerPolicy="no-referrer"/>
                <div className="min-w-0">
                  <h2 className="font-display font-extrabold text-slate-900 text-sm truncate leading-none">
                    {selectedRecipient.name}
                  </h2>
                  <span className="text-[10px] text-slate-500 truncate block mt-1 font-mono">
                    @{selectedRecipient.handle} • {selectedRecipient.department || 'Faculty'}
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
                <img src={selectedRecipient.avatarUrl} alt={selectedRecipient.name} className="w-12 h-12 rounded-full object-cover mx-auto border border-slate-200 shadow-sm mb-2" referrerPolicy="no-referrer"/>
                <h3 className="text-xs font-extrabold text-slate-900">This is the start of your chat history</h3>
                <p className="text-[10px] text-slate-400 leading-normal mt-1.5">
                  {selectedRecipient.bio || `ConnectSphere Peer. Send messages to check placements, discuss homework, or clear syllabus requirements.`}
                </p>
              </div>

              {activeChatMessages.map((msg) => {
                const isMe = msg.senderId === currentUser.id;
                return (<div key={msg.id} className={`flex gap-2.5 max-w-[75%] ${isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                    <img src={isMe ? currentUser.avatarUrl : selectedRecipient.avatarUrl} alt="Avatar" className="w-7 h-7 rounded-full object-cover border border-slate-100 shrink-0" referrerPolicy="no-referrer"/>
                    <div>
                      <div className={`text-xs p-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${isMe
                        ? 'bg-indigo-600 text-slate-100 rounded-tr-none'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'}`}>
                        {msg.text}
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
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input type="text" placeholder={`Write a message to ${selectedRecipient.name.split(' ')[0]}...`} value={typedMessage} onChange={(e) => setTypedMessage(e.target.value)} className="flex-1 text-xs px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"/>
                <button type="submit" disabled={!typedMessage.trim()} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-45 text-white px-4 rounded-xl flex items-center justify-center cursor-pointer transition-all">
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
