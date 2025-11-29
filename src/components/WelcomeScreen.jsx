import React from 'react';
import { LogoIcon, ArrowLeftIcon } from './Icons';
const WelcomeScreen = ({ onLoginClick, onSignupClick, onBack, authFlow }) => {
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
        <button onClick={onBack} className="absolute top-4 left-4 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition z-10 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Go back to profile selection">
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
            {authFlow === 'participant' && (<button onClick={onSignupClick} className="w-full py-3 px-4 font-semibold text-primary dark:text-indigo-400 bg-primary/10 dark:bg-primary/20 rounded-full hover:bg-primary/20 dark:hover:bg-primary/30 transition-transform transform hover:scale-105">
              Sign Up
            </button>)}
          </div>
        </div>
      </div>
    </div>);
};
export default WelcomeScreen;
