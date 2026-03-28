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
      <div className="min-h-screen flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden bg-slate-950">

        {/* Animated gradient orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/30 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/20 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[40%] right-[10%] w-[300px] h-[300px] rounded-full bg-blue-500/10 blur-[90px] animate-pulse" style={{ animationDelay: '2s' }} />

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}
        />

        {/* Content card */}
        <div className="w-full max-w-md mx-auto relative z-10">

          {/* Logo + brand */}
          <div className="flex flex-col items-center space-y-4 mb-10 text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/40 rounded-2xl blur-xl scale-150" />
              <div className="relative bg-indigo-600 p-4 rounded-2xl shadow-2xl shadow-indigo-500/40">
                <LogoIcon className="h-10 w-10 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-white tracking-tight">
                Connect<span className="text-indigo-400">Sphere</span>
              </h1>
              <p className="text-slate-400 mt-2 text-base">Where your community comes together.</p>
            </div>
          </div>

          {/* Feature pills */}
          <div className="flex justify-center flex-wrap gap-2 mb-8">
            {['💬 Rooms', '📢 Announcements', '🤝 Connect', '🤖 AI Assistant'].map(f => (
              <span key={f} className="px-3 py-1 text-xs font-semibold bg-white/5 text-slate-300 border border-white/10 rounded-full backdrop-blur-sm">
                {f}
              </span>
            ))}
          </div>

          {/* Main CTA card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <button
              onClick={() => handleSelect('participant')}
              className="w-full flex items-center p-4 space-x-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-500/30 group"
            >
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center text-2xl flex-shrink-0">
                👤
              </div>
              <div className="text-left flex-1">
                <p className="font-bold text-lg text-white">Get Started</p>
                <p className="text-sm text-indigo-200">Log in or create your account</p>
              </div>
              <svg className="w-5 h-5 text-indigo-200 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <p className="text-center text-slate-500 text-xs">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>

          {/* Subtle admin link */}
          <div className="text-center mt-6">
            <button
              onClick={() => handleSelect('admin')}
              className="text-xs text-slate-500 hover:text-slate-100 transition-colors underline underline-offset-2"
            >
              If you are an Administrator, Sign in here
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden bg-slate-950">

      {/* Animated gradient orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/30 blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/20 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}
      />

      <div className="w-full max-w-md mx-auto relative z-10">

        {/* Back button */}
        <button
          onClick={() => setSelection(null)}
          className="flex items-center space-x-1 text-slate-400 hover:text-white transition-colors mb-6 group"
          aria-label="Go back"
        >
          <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-sm">Back</span>
        </button>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl space-y-8 text-center">

          {/* Logo */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/40 rounded-2xl blur-xl scale-150" />
              <div className="relative bg-indigo-600 p-4 rounded-2xl shadow-2xl shadow-indigo-500/40">
                <LogoIcon className="h-10 w-10 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Connect<span className="text-indigo-400">Sphere</span>
              </h1>
              <p className="text-slate-400 mt-1 text-sm">Your new community awaits.</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              onClick={onLoginClick}
              className="w-full py-3 px-4 font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-500/30"
            >
              Log In
            </button>
            {(selection === 'participant' || selection === 'admin') && (
              <button
                onClick={onSignupClick}
                className="w-full py-3 px-4 font-bold text-indigo-400 hover:text-white bg-white/5 hover:bg-indigo-600/30 border border-white/10 hover:border-indigo-500/50 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Sign Up
              </button>
            )}
          </div>

          <p className="text-xs text-slate-600">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
