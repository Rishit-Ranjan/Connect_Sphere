import React, { useState } from 'react';
import { LogoIcon, ArrowLeftIcon } from './Icons';
const WelcomeScreen = ({ onLoginClick, onSignupClick, onSetAuthFlow }) => {
  const [selection, setSelection] = useState(null); // 'admin' or 'participant'

  const handleSelect = (flow) => {
    onSetAuthFlow(flow);
    setSelection(flow);
  };

  if (!selection) {
    return (
      <div className="min-h-screen bg-light dark:bg-dark flex flex-col items-center justify-center p-4 font-sans transition-colors duration-300">
        <div className="w-full max-w-md mx-auto space-y-8 bg-white dark:bg-secondary p-10 rounded-2xl shadow-2xl">
          <div className="flex flex-col items-center space-y-4 text-center">
            <LogoIcon className="h-16 w-16 text-primary" />
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Welcome to ConnectSphere</h1>
            <p className="text-lg text-gray-500 dark:text-gray-400">Select a profile to continue</p>
          </div>
          <div className="space-y-4">
            <button onClick={() => handleSelect('admin')} className="w-full flex items-center p-4 space-x-4 bg-white dark:bg-gray-800/50 rounded-xl shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50">
              <img className="h-14 w-14 rounded-full object-cover" src="https://picsum.photos/seed/admin/100" alt="Admin" />
              <div className="text-left">
                <p className="font-bold text-lg text-gray-800 dark:text-white">Admin User</p>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">admin</span>
              </div>
            </button>
            <button onClick={() => handleSelect('participant')} className="w-full flex items-center p-4 space-x-4 bg-white dark:bg-gray-800/50 rounded-xl shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50">
              <img className="h-14 w-14 rounded-full object-cover" src="https://picsum.photos/seed/participant-generic/100" alt="Participant" />
              <div className="text-left">
                <p className="font-bold text-lg text-gray-800 dark:text-white">Participant User</p>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">participant</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light dark:bg-dark flex flex-col items-center justify-center p-4 font-sans transition-colors duration-300 relative overflow-hidden">
      {/* Background Graphics */}
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1920&q=80"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm" />
      </div>
      <div className="w-full max-w-md mx-auto relative">
        <button onClick={() => setSelection(null)} className="absolute top-4 left-4 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition z-10 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Go back to profile selection">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <div className="bg-white dark:bg-secondary shadow-2xl rounded-2xl p-8 space-y-8 text-center overflow-hidden">
          <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6 overflow-hidden relative group">
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80"
              alt="Community"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
          <div className="flex flex-col items-center space-y-2">
            <LogoIcon className="h-12 w-12 text-primary" />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Welcome to ConnectSphere
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Your new community awaits.
            </p>
          </div>
          <div className="space-y-4">
            <button onClick={onLoginClick} className="w-full py-3 px-4 font-semibold text-white bg-primary rounded-full hover:bg-indigo-700 transition-transform transform hover:scale-105">
              Log In
            </button>
            {selection === 'participant' && (<button onClick={onSignupClick} className="w-full py-3 px-4 font-semibold text-primary dark:text-indigo-400 bg-primary/10 dark:bg-primary/20 rounded-full hover:bg-primary/20 dark:hover:bg-primary/30 transition-transform transform hover:scale-105">
              Sign Up
            </button>)}
          </div>
        </div>
      </div>
    </div>);
};
export default WelcomeScreen;
