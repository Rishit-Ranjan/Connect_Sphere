/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useRef, useEffect } from 'react';
import { Send, Users, Hash, Sparkles, Plus, Globe, Lock, Eye, EyeOff, Trash2, X, Check } from 'lucide-react';

export default function RoomsView({
  currentUser,
  rooms,
  roomMessages,
  onAddRoomMessage,
  onCreateRoom,
  onVerifyRoomPassword,
  onDeleteRoom,
  unlockedRoomIds,
  users,
  selectedRoomId,
  setSelectedRoomId
}) {
  const [typedMessage, setTypedMessage] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomDescription, setRoomDescription] = useState('');
  const [roomVisibility, setRoomVisibility] = useState('public');
  const [roomPassword, setRoomPassword] = useState('');
  const [showRoomPassword, setShowRoomPassword] = useState(false);
  const [createError, setCreateError] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [showJoinPassword, setShowJoinPassword] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [pendingDeleteRoomId, setPendingDeleteRoomId] = useState('');
  const [isDeletingRoom, setIsDeletingRoom] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const chatBottomRef = useRef(null);

  const isAdmin = currentUser?.role === 'admin';
  const currentUserId = currentUser?.id || currentUser?._id;

  // Admins can delete any room; everyone else can delete rooms they created.
  // Rooms without an owner (created before ownership tracking) are deletable by anyone.
  const canDeleteRoom = (room) => {
    if (!room) return false;
    if (isAdmin) return true;
    if (!room.createdBy) return true;
    return Boolean(currentUserId && room.createdBy === currentUserId);
  };

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);
  const isSelectedPrivate = selectedRoom && (selectedRoom.isPrivate || selectedRoom.visibility === 'private');
  const isSelectedUnlocked = !isSelectedPrivate || unlockedRoomIds.includes(selectedRoomId);
  const currentMessages = roomMessages.filter((m) => m.roomId === selectedRoomId);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  useEffect(() => {
    if (!selectedRoomId && rooms.length > 0) {
      setSelectedRoomId(rooms[0].id);
    }
  }, [rooms, selectedRoomId, setSelectedRoomId]);

  const resetCreateRoomForm = () => {
    setRoomName('');
    setRoomDescription('');
    setRoomVisibility('public');
    setRoomPassword('');
    setShowRoomPassword(false);
    setCreateError('');
    setShowCreateRoom(false);
  };

  const handleCreateRoomSubmit = async (e) => {
    e.preventDefault();
    setCreateError('');
    if (!roomName.trim()) return;
    if (roomVisibility === 'private' && !roomPassword.trim()) {
      setCreateError('Private rooms require a password.');
      return;
    }

    const result = await onCreateRoom({
      name: roomName.trim(),
      description: roomDescription.trim(),
      visibility: roomVisibility,
      password: roomVisibility === 'private' ? roomPassword.trim() : ''
    });

    if (result && result.ok === false) {
      setCreateError(result.message || 'Failed to create room.');
      return;
    }

    setRoomName('');
    setRoomDescription('');
    setRoomVisibility('public');
    setRoomPassword('');
    setShowRoomPassword(false);
    setShowCreateRoom(false);
  };

  // Clear join-password state whenever the selection changes
  useEffect(() => {
    setJoinPassword('');
    setJoinError('');
    setShowJoinPassword(false);
  }, [selectedRoomId]);

  const handleJoinPrivateRoom = async (e) => {
    e.preventDefault();
    setJoinError('');
    if (!joinPassword.trim() || !selectedRoomId) return;
    setIsVerifying(true);
    const result = await onVerifyRoomPassword(selectedRoomId, joinPassword.trim());
    setIsVerifying(false);
    if (!result || result.ok === false) {
      setJoinError((result && result.message) || 'Incorrect room password.');
      return;
    }
    setJoinPassword('');
  };

  const confirmDeleteRoom = async (roomId) => {
    setIsDeletingRoom(true);
    setDeleteError('');
    const result = await onDeleteRoom(roomId);
    setIsDeletingRoom(false);
    setPendingDeleteRoomId('');
    if (result && result.ok === false) {
      setDeleteError(result.message || 'Failed to delete room.');
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!typedMessage.trim() || !selectedRoomId) return;

    onAddRoomMessage(selectedRoomId, typedMessage);
    setTypedMessage('');
  };

  if (rooms.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white border border-slate-200 rounded-3xl m-2 sm:m-3 shadow-sm">
        <div className="w-full max-w-md px-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-50 flex items-center justify-center">
            <Hash size={28} className="text-indigo-600" />
          </div>

          <h2 className="text-xl font-display font-bold text-slate-900">
            No campus rooms yet
          </h2>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            Create the first room for academics, placements, events, projects, or peer discussions.
          </p>

          <form onSubmit={handleCreateRoomSubmit} className="mt-6 space-y-3 text-left">
            <input
              type="text"
              placeholder="Room name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full text-sm px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />

            <textarea
              placeholder="Room description"
              value={roomDescription}
              onChange={(e) => setRoomDescription(e.target.value)}
              rows={4}
              className="w-full text-sm px-4 py-3 rounded-xl border border-slate-200 bg-white resize-none focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRoomVisibility('public')}
                className={`flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2.5 rounded-xl border transition-all cursor-pointer ${roomVisibility === 'public' ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
              >
                <Globe size={13} />
                Public
              </button>
              <button
                type="button"
                onClick={() => setRoomVisibility('private')}
                className={`flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2.5 rounded-xl border transition-all cursor-pointer ${roomVisibility === 'private' ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
              >
                <Lock size={13} />
                Private
              </button>
            </div>

            {roomVisibility === 'private' && (
              <div className="relative">
                <input
                  type={showRoomPassword ? 'text' : 'password'}
                  placeholder="Set a room password (required)"
                  value={roomPassword}
                  onChange={(e) => setRoomPassword(e.target.value)}
                  className="w-full text-sm px-4 py-3 pr-11 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowRoomPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showRoomPassword ? 'Hide password' : 'Show password'}
                >
                  {showRoomPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            )}

            {createError && (
              <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                {createError}
              </p>
            )}

            <button
              type="submit"
              disabled={!roomName.trim() || (roomVisibility === 'private' && !roomPassword.trim())}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all cursor-pointer"
            >
              Create first room
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100dvh-4rem-2px)] overflow-hidden font-sans bg-slate-50 gap-3 p-2 sm:p-3">
      <div className="w-full lg:w-72 bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col justify-between shrink-0 overflow-hidden max-h-[38vh] lg:max-h-none">
        <div className="flex flex-col min-h-0 flex-1">
          <div className="p-5 pb-4">
            <h3 className="font-display font-bold text-slate-900 text-sm tracking-tight flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
                <Users size={14} className="text-white" />
              </span>
              Campus Channels
            </h3>
            <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
              Multi-user branch rooms &amp; interest categories
            </p>
          </div>

          <div className="px-4 pb-3">
            {!showCreateRoom ? (
              <button
                onClick={() => setShowCreateRoom(true)}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                <Plus size={14} />
                Create Room
              </button>
            ) : (
              <form onSubmit={handleCreateRoomSubmit} className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2">
                <input
                  type="text"
                  placeholder="Room name"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
                />

                <textarea
                  placeholder="Room description"
                  value={roomDescription}
                  onChange={(e) => setRoomDescription(e.target.value)}
                  rows={3}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 resize-none focus:outline-none focus:border-indigo-500"
                />

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRoomVisibility('public')}
                    className={`flex items-center justify-center gap-1.5 text-[11px] font-semibold px-2 py-2 rounded-xl border transition-all cursor-pointer ${roomVisibility === 'public' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                  >
                    <Globe size={12} />
                    Public
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoomVisibility('private')}
                    className={`flex items-center justify-center gap-1.5 text-[11px] font-semibold px-2 py-2 rounded-xl border transition-all cursor-pointer ${roomVisibility === 'private' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                  >
                    <Lock size={12} />
                    Private
                  </button>
                </div>

                {roomVisibility === 'private' && (
                  <div className="relative">
                    <input
                      type={showRoomPassword ? 'text' : 'password'}
                      placeholder="Room password (required)"
                      value={roomPassword}
                      onChange={(e) => setRoomPassword(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 pr-9 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRoomPassword((prev) => !prev)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title={showRoomPassword ? 'Hide password' : 'Show password'}
                    >
                      {showRoomPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                )}

                {createError && (
                  <p className="text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                    {createError}
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={!roomName.trim() || (roomVisibility === 'private' && !roomPassword.trim())}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold px-3 py-2 rounded-xl cursor-pointer transition-all"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={resetCreateRoomForm}
                    className="flex-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl cursor-pointer transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="px-3 pb-3 space-y-1.5 overflow-y-auto flex-1 min-h-0">
            {deleteError && (
              <p className="text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                {deleteError}
              </p>
            )}
            {rooms.map((room) => {
              const isSelected = room.id === selectedRoomId;
              const isPrivateRoom = room.isPrivate || room.visibility === 'private';
              const isPendingDelete = pendingDeleteRoomId === room.id;

              if (isPendingDelete) {
                return (
                  <div
                    key={room.id}
                    className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs bg-rose-50 border border-rose-200"
                  >
                    <Trash2 size={13} className="text-rose-600 shrink-0" />
                    <span className="flex-1 min-w-0 font-semibold text-rose-700 truncate">
                      Delete &quot;{room.name}&quot;?
                    </span>
                    <button
                      onClick={() => confirmDeleteRoom(room.id)}
                      disabled={isDeletingRoom}
                      className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 cursor-pointer shrink-0"
                      title="Confirm delete"
                    >
                      <Check size={12} />
                    </button>
                    <button
                      onClick={() => setPendingDeleteRoomId('')}
                      disabled={isDeletingRoom}
                      className="p-1.5 rounded-lg bg-white border border-rose-200 text-rose-600 hover:bg-rose-100 disabled:opacity-50 cursor-pointer shrink-0"
                      title="Cancel"
                    >
                      <X size={12} />
                    </button>
                  </div>
                );
              }

              return (
                <div
                  key={room.id}
                  className={`group flex items-stretch rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm'
                      : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-50 hover:border-slate-200'
                  }`}
                >
                  <button
                    onClick={() => setSelectedRoomId(room.id)}
                    className="flex-1 min-w-0 flex items-center gap-2.5 px-3.5 py-3 rounded-2xl text-xs text-left transition-all font-semibold cursor-pointer"
                  >
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      {isPrivateRoom ? <Lock size={13} /> : <Hash size={14} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="block truncate">{room.name}</span>
                        {isPrivateRoom && (
                          <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border shrink-0 ${isSelected ? 'bg-white/20 border-white/30 text-white' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                            Private
                          </span>
                        )}
                      </span>
                      <span
                        className={`block text-[10px] font-medium truncate mt-0.5 ${
                          isSelected ? 'text-indigo-100' : 'text-slate-400'
                        }`}
                      >
                        {room.participantsCount || 0} online peers
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={() => setPendingDeleteRoomId(room.id)}
                    className="self-center px-2.5 shrink-0 text-slate-300 hover:text-rose-600 transition-colors cursor-pointer"
                    title={canDeleteRoom(room) ? 'Delete room' : 'Delete room (admin or room creator only)'}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="m-3 mt-0 p-4 rounded-2xl bg-indigo-900 text-white relative overflow-hidden shrink-0">
          <div className="absolute top-[-50%] left-[-20%] w-20 h-20 bg-indigo-500/20 rounded-full blur-xl opacity-80" />
          <div className="flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider mb-1.5 relative z-10">
            <Sparkles size={11} className="text-amber-300" />
            <span>Campus Tip</span>
          </div>
          <p className="leading-relaxed text-[11px] text-indigo-100 relative z-10">
            Need private tutoring? Look up contacts in the Direct Messenger tab for 1-on-1 chats.
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col h-full min-h-0 bg-white border border-slate-200 rounded-3xl shadow-sm relative overflow-hidden min-w-0">
        {selectedRoom ? (
          <>
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white z-10 shrink-0">
              <div className="min-w-0 flex items-center gap-3">
                <span className="w-9 h-9 rounded-2xl bg-slate-900 flex items-center justify-center shrink-0">
                  {isSelectedPrivate ? <Lock size={14} className="text-white" /> : <Hash size={15} className="text-white" />}
                </span>
                <div className="min-w-0">
                  <h2 className="font-display font-extrabold text-slate-900 text-sm truncate tracking-tight flex items-center gap-2">
                    {selectedRoom.name}
                    {isSelectedPrivate && (
                      <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-900 text-white shrink-0">
                        Private
                      </span>
                    )}
                  </h2>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {selectedRoom.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1.5 text-[10px] font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active Channel
                </div>

                <button
                  onClick={() => setPendingDeleteRoomId(selectedRoom.id)}
                  className="flex items-center gap-1.5 text-[10px] font-bold bg-white border border-slate-200 hover:border-rose-300 hover:bg-rose-50 px-2.5 py-1 rounded-full text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                  title={canDeleteRoom(selectedRoom) ? 'Delete room' : 'Delete room (admin or room creator only)'}
                >
                  <Trash2 size={12} />
                  Delete
                </button>
              </div>
            </div>

            {!isSelectedUnlocked ? (
              <div className="flex-1 flex items-center justify-center p-6 bg-slate-50/60 min-h-0">
                <form onSubmit={handleJoinPrivateRoom} className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-center">
                  <span className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 flex items-center justify-center">
                    <Lock size={20} className="text-indigo-600" />
                  </span>
                  <h3 className="font-display font-bold text-slate-900 text-sm mt-3">
                    This room is private
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Enter the room password to view messages and join the conversation.
                  </p>
                  <div className="relative mt-4">
                    <input
                      type={showJoinPassword ? 'text' : 'password'}
                      placeholder="Room password"
                      value={joinPassword}
                      onChange={(e) => setJoinPassword(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 pr-10 bg-slate-100 border border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-indigo-300 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowJoinPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title={showJoinPassword ? 'Hide password' : 'Show password'}
                    >
                      {showJoinPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {joinError && (
                    <p className="text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 mt-3">
                      {joinError}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={!joinPassword.trim() || isVerifying}
                    className="w-full mt-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold py-2.5 rounded-xl transition-all cursor-pointer shadow-sm"
                  >
                    {isVerifying ? 'Verifying...' : 'Unlock Room'}
                  </button>
                </form>
              </div>
            ) : (
            <>
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/60 min-h-0">
              {currentMessages.length > 0 ? (
                currentMessages.map((msg) => {
                  const isMe = msg.sender.id === currentUser.id;

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                    >
                      <img
                        src={msg.sender.avatarUrl}
                        alt={msg.sender.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-100 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="flex items-center gap-1.5 mb-1 text-[10px]">
                          <span className="font-extrabold text-slate-900">{msg.sender.name}</span>
                          {msg.sender.role === 'admin' && (
                            <span className="text-[8px] font-mono font-bold bg-amber-50 border border-amber-200 text-amber-700 px-1 rounded">
                              Admin
                            </span>
                          )}
                          <span className="text-slate-400 font-mono text-[9px]">
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>

                        <div
                          className={`text-xs p-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                            isMe
                              ? 'bg-indigo-600 text-white rounded-tr-none'
                              : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-24 text-slate-400 text-xs font-semibold">
                  <Hash size={24} className="mx-auto text-slate-300 mb-2" />
                  Nothing has been posted in this room yet. Send the first greeting!
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            <div className="p-4 bg-white border-t border-slate-100 shrink-0">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  placeholder={isSelectedUnlocked ? `Send a message to #${selectedRoom?.name || 'room'}...` : 'Unlock this room to send messages...'}
                  value={typedMessage}
                  onChange={(e) => setTypedMessage(e.target.value)}
                  disabled={!isSelectedUnlocked}
                  className="flex-1 text-xs px-4 py-2.5 bg-slate-100 border border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-indigo-300 placeholder-slate-400 transition-all min-w-0 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={!typedMessage.trim() || !isSelectedUnlocked}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-45 text-white p-2.5 rounded-xl flex items-center justify-center cursor-pointer transition-all shadow-sm shrink-0"
                >
                  <Send size={14} />
                </button>
              </form>
            </div>
            </>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center px-6">
            <div className="text-center text-slate-400">
              <Hash size={28} className="mx-auto text-slate-300 mb-3" />
              <p className="text-sm font-bold">No room selected.</p>
              <p className="text-xs mt-1">
                Select a room from the left panel or create a new one.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}