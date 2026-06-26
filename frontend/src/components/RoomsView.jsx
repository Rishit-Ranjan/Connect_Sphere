/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useRef, useEffect } from 'react';
import { Send, Users, Hash, Sparkles } from 'lucide-react';
export default function RoomsView({ currentUser, rooms, roomMessages, onAddRoomMessage, users }) {
    const [selectedRoomId, setSelectedRoomId] = useState(rooms[0]?.id || '');
    const [typedMessage, setTypedMessage] = useState('');
    const chatBottomRef = useRef(null);
    const selectedRoom = rooms.find((r) => r.id === selectedRoomId);
    const currentMessages = roomMessages.filter((m) => m.roomId === selectedRoomId);
    // Auto scroll to chat bottom
    useEffect(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [currentMessages]);
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!typedMessage.trim() || !selectedRoomId)
            return;
        onAddRoomMessage(selectedRoomId, typedMessage, currentUser);
        const textToSend = typedMessage;
        setTypedMessage('');
        // Note: Real-time chat responses should come from actual users
        // Simulated responses removed to eliminate hardcoded placeholder data
    };
    return (<div className="flex-1 flex h-[calc(100vh-2px)] overflow-hidden font-sans bg-white border border-slate-200 rounded-3xl m-3 shadow-sm">
      
      {/* Rooms List Sub-Sidebar */}
      <div className="w-64 border-r border-slate-200 bg-slate-50/50 flex flex-col justify-between shrink-0">
        <div>
          <div className="p-4.5 border-b border-slate-200">
            <h3 className="font-display font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Users size={14} className="text-indigo-600"/>
              Campus Channels
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">Multi-user branch rooms & interest categories</p>
          </div>

          <div className="p-2 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
            {rooms.map((room) => {
            const isSelected = room.id === selectedRoomId;
            return (<button key={room.id} onClick={() => setSelectedRoomId(room.id)} className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-2xl text-xs text-left transition-all font-semibold ${isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'}`}>
                  <Hash size={15} className={isSelected ? 'text-white' : 'text-slate-400'}/>
                  <div className="min-w-0 flex-1">
                    <span className="block truncate">{room.name}</span>
                    <span className={`block text-[9px] font-medium truncate mt-0.5 ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                      {room.participantsCount} online peers
                    </span>
                  </div>
                </button>);
        })}
          </div>
        </div>

        {/* Small tips at bottom of rooms */}
        <div className="p-4 border-t border-slate-200 text-[10px] text-slate-500 bg-white">
          <div className="flex items-center gap-1 font-bold text-slate-850 text-[9px] uppercase tracking-wider mb-1">
            <Sparkles size={11} className="text-amber-500 animate-pulse"/>
            <span>Campus Tip</span>
          </div>
          <p className="leading-relaxed text-[10px] text-slate-500">
            Need private tutoring? Look up contacts in the Direct Messenger tab for 1-on-1 chats.
          </p>
        </div>
      </div>

      {/* Main Chat Stream Container */}
      <div className="flex-1 flex flex-col justify-between h-full bg-white relative">
        
        {/* Chat Area Header */}
        {selectedRoom ? (<div className="p-4.5 border-b border-slate-200 flex items-center justify-between bg-white z-10 shadow-sm">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Hash size={16} className="text-slate-850"/>
                <h2 className="font-display font-extrabold text-slate-900 text-sm truncate">
                  {selectedRoom.name}
                </h2>
              </div>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">
                {selectedRoom.description}
              </p>
            </div>

            <div className="text-[9px] font-mono bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded text-indigo-700 font-bold shrink-0">
              Active Channel
            </div>
          </div>) : (<div className="p-4.5 border-b border-slate-200">
            <p className="text-xs text-slate-400 font-bold">No room selected.</p>
          </div>)}

        {/* Chat message streams */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/20">
          {currentMessages.length > 0 ? (currentMessages.map((msg) => {
            const isMe = msg.sender.id === currentUser.id;
            return (<div key={msg.id} className={`flex gap-3 max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                  <img src={msg.sender.avatarUrl} alt={msg.sender.name} className="w-8 h-8 rounded-full object-cover border border-slate-100 shrink-0" referrerPolicy="no-referrer"/>
                  <div>
                    {/* User handle/info row */}
                    <div className="flex items-center gap-1.5 mb-1 text-[10px]">
                      <span className="font-extrabold text-slate-900">{msg.sender.name}</span>
                      {msg.sender.role === 'admin' && (<span className="text-[8px] font-mono font-bold bg-amber-50 border border-amber-200 text-amber-700 px-1 rounded">Admin</span>)}
                      <span className="text-slate-400 font-mono text-[9px]">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Chat Bubble card */}
                    <div className={`text-xs p-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${isMe
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'}`}>
                      {msg.text}
                    </div>
                  </div>
                </div>);
        })) : (<div className="text-center py-24 text-slate-400 text-xs font-semibold">
              <Hash size={24} className="mx-auto text-slate-300 mb-2"/>
              Nothing has been posted in this room yet. Send the first greeting!
            </div>)}
          <div ref={chatBottomRef}/>
        </div>

        {/* Messaging Composer inputs */}
        <div className="p-4 bg-white border-t border-slate-150">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input type="text" placeholder={`Send a message to #${selectedRoom?.name || 'room'}...`} value={typedMessage} onChange={(e) => setTypedMessage(e.target.value)} className="flex-1 text-xs px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"/>
            <button type="submit" disabled={!typedMessage.trim()} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-45 text-white px-4 rounded-xl flex items-center justify-center cursor-pointer transition-all">
              <Send size={13}/>
            </button>
          </form>
        </div>

      </div>
    </div>);
}
