import React, { useState } from 'react';
import { XIcon, TrashIcon, SearchIcon, SpinnerIcon } from '../Icons';
import UserAvatar from './UserAvatar';
const ManageRoomModal = ({ room, allUsers, onClose, onSaveMembers, onSaveSettings, onDeleteRoom }) => {
  const [activeTab, setActiveTab] = useState('members');
  // State for Members Tab
  const [members, setMembers] = useState(room.participants);
  const [searchQuery, setSearchQuery] = useState('');
  // State for Settings Tab
  const [messagingPermission, setMessagingPermission] = useState(room.messagingPermission || 'all');
  const [mediaSharePermission, setMediaSharePermission] = useState(room.mediaSharePermission || 'all');
  const [isSaving, setIsSaving] = useState(false);
  const handleRemoveMember = (userId) => {
    if (userId === room.adminId)
      return;
    setMembers(prev => prev.filter(m => m.id !== userId));
  };
  const handleAddMember = (user) => {
    if (!members.some(m => m.id === user.id)) {
      setMembers(prev => [...prev, user]);
    }
    setSearchQuery('');
  };
  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      await Promise.all([
        onSaveMembers(room.id, members),
        onSaveSettings(room.id, { messagingPermission, mediaSharePermission })
      ]);
      onClose();
    }
    catch (error) {
      console.error("Failed to save room settings", error);
    }
    finally {
      setIsSaving(false);
    }
  };
  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to permanently delete the room "${room.name}"? This will remove the room and all its messages for all participants. This action cannot be undone.`)) {
      setIsSaving(true);
      try {
        const success = await onDeleteRoom(room.id);
        if (success) {
          onClose();
        } else {
          setIsSaving(false);
        }
      }
      catch (error) {
        console.error("Failed to delete room", error);
        setIsSaving(false);
      }
    }
  };
  const availableToAdd = allUsers.filter(u => !members.some(m => m.id === u.id) &&
    u.status === 'active' &&
    u.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const TabButton = ({ label, value }) => (<button onClick={() => setActiveTab(value)} className={`px-4 py-2 text-sm font-semibold rounded-md transition ${activeTab === value ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`} disabled={isSaving}>
    {label}
  </button>);
  return (<div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg transform animate-fade-in-scale flex flex-col max-h-[90vh]">
      <div className="flex justify-between items-center p-6 border-b border-gray-200/50 dark:border-slate-700/50">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Manage "{room.name}"</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <XIcon className="h-6 w-6" />
        </button>
      </div>

      <div className="p-4 border-b border-gray-200/50 dark:border-slate-700/50">
        <div className="flex items-center space-x-2">
          <TabButton label="Members" value="members" />
          <TabButton label="Settings" value="settings" />
        </div>
      </div>

      <div className="p-6 space-y-6 overflow-y-auto">
        {/* Members Tab */}
        {activeTab === 'members' && (<div className="space-y-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Add New Members</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"><SearchIcon className="h-5 w-5" /></span>
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search for users to add..." className="w-full pl-10 pr-4 py-2 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-700 dark:to-slate-700/50 text-gray-800 dark:text-gray-200 border-2 border-transparent focus:border-primary rounded-full focus:outline-none focus:ring-0 transition" disabled={isSaving} />
            </div>
            {searchQuery && (<div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
              {availableToAdd.length > 0 ? availableToAdd.map(user => (<button key={user.id} onClick={() => handleAddMember(user)} className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700">
                <UserAvatar user={user} className="h-8 w-8" />
                <span className="font-semibold text-sm">{user.name}</span>
              </button>)) : <p className="p-3 text-sm text-center text-gray-500">No users found.</p>}
            </div>)}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Current Members ({members.length})</label>
            <div className="space-y-2 max-h-60 overflow-y-auto p-2 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-700/50 dark:to-slate-700/30 rounded-lg">
              {members.map(user => (<div key={user.id} className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <UserAvatar user={user} className="h-8 w-8" />
                  <span className="font-semibold text-sm">{user.name}</span>
                  {user.id === room.adminId && <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Admin</span>}
                </div>
                {user.id !== room.adminId && (<button onClick={() => handleRemoveMember(user.id)} className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition" title={`Remove ${user.name}`} disabled={isSaving}><TrashIcon className="h-4 w-4" /></button>)}
              </div>))}
            </div>
          </div>
        </div>)}

        {/* Settings Tab */}
        {activeTab === 'settings' && (<div className={`space-y-6 ${isSaving ? 'opacity-50' : ''}`}>
          <div>
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Who can send messages?</h4>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2"><input type="radio" name="messaging" value="all" checked={messagingPermission === 'all'} onChange={() => setMessagingPermission('all')} className="h-4 w-4 text-primary focus:ring-primary" disabled={isSaving} /><span>All Members</span></label>
              <label className="flex items-center space-x-2"><input type="radio" name="messaging" value="admin_only" checked={messagingPermission === 'admin_only'} onChange={() => setMessagingPermission('admin_only')} className="h-4 w-4 text-primary focus:ring-primary" disabled={isSaving} /><span>Admins Only</span></label>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Who can share media (images/files)?</h4>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2"><input type="radio" name="media" value="all" checked={mediaSharePermission === 'all'} onChange={() => setMediaSharePermission('all')} className="h-4 w-4 text-primary focus:ring-primary" disabled={isSaving} /><span>All Members</span></label>
              <label className="flex items-center space-x-2"><input type="radio" name="media" value="admin_only" checked={mediaSharePermission === 'admin_only'} onChange={() => setMediaSharePermission('admin_only')} className="h-4 w-4 text-primary focus:ring-primary" disabled={isSaving} /><span>Admins Only</span></label>
            </div>
          </div>
          <div className="border-t border-red-500/30 pt-4">
            <h4 className="font-bold text-red-600 dark:text-red-400">Danger Zone</h4>
            <div className="flex items-center justify-between mt-2">
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Delete this room</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Once deleted, it's gone forever.</p>
              </div>
              <button onClick={handleDelete} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-full hover:bg-red-700 transition disabled:opacity-50" disabled={isSaving}>Delete Room</button>
            </div>
          </div>
        </div>)}
      </div>

      <div className="flex justify-end space-x-4 p-6 bg-gradient-to-r from-gray-50/80 to-blue-50/80 dark:from-slate-700/50 dark:to-slate-700/30 rounded-b-2xl mt-auto border-t border-gray-200/50 dark:border-slate-700/50">
        <button onClick={onClose} className="px-6 py-2.5 text-sm font-semibold rounded-full hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500">Cancel</button>
        <button onClick={handleSaveChanges} className="px-6 py-2.5 text-sm font-semibold text-white bg-primary rounded-full hover:bg-indigo-700 disabled:opacity-50 flex justify-center items-center w-36" disabled={isSaving}>
          {isSaving ? <SpinnerIcon className="animate-spin h-5 w-5 text-white" /> : 'Save Changes'}
        </button>
      </div>
    </div>
  </div>);
};
export default ManageRoomModal;
