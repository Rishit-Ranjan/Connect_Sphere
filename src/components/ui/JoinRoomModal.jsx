import React, { useState } from 'react';
import { XIcon, LockClosedIcon, SpinnerIcon } from '../Icons';
const JoinRoomModal = ({ roomName, onClose, onJoin }) => {
    const [password, setPassword] = useState('');
    const [isJoining, setIsJoining] = useState(false);
    const [error, setError] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!password.trim() || isJoining)
            return;
        setIsJoining(true);
        setError('');
        try {
            const success = await onJoin(password);
            if (!success) {
                setError('Incorrect password.');
            }
        }
        catch (err) {
            console.error(err);
            setError('An error occurred.');
        }
        finally {
            setIsJoining(false);
        }
    };
    return (<div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm transform animate-fade-in-scale flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200/50 dark:border-slate-700/50">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Join "{roomName}"</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <XIcon className="h-6 w-6"/>
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">This room is password-protected. Please enter the password to join.</p>
          {error && <p className="text-center text-sm text-red-500 -mb-2">{error}</p>}
          <div>
            <label htmlFor="roomPassword" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <LockClosedIcon className="h-5 w-5"/>
              </span>
              <input type="password" id="roomPassword" value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full pl-10 pr-4 py-3 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-700 dark:to-slate-700/50 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" placeholder="Room password" autoFocus disabled={isJoining}/>
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-4 p-6 bg-gradient-to-r from-gray-50/80 to-blue-50/80 dark:from-slate-700/50 dark:to-slate-700/30 rounded-b-2xl border-t border-gray-200/50 dark:border-slate-700/50">
          <button type="button" onClick={onClose} className="px-6 py-2.5 text-sm font-semibold rounded-full hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500">Cancel</button>
          <button type="submit" disabled={!password.trim() || isJoining} className="px-6 py-2.5 text-sm font-semibold text-white bg-primary rounded-full hover:bg-indigo-700 disabled:opacity-50 flex justify-center items-center w-24">
            {isJoining ? <SpinnerIcon className="animate-spin h-5 w-5 text-white"/> : 'Join'}
          </button>
        </div>
      </form>
    </div>);
};
export default JoinRoomModal;
