import React, { useState, useEffect } from 'react';
import { LogoIcon, ArrowLeftIcon, SpinnerIcon } from './Icons';
import SignupForm from './ui/SignupForm';

const AuthScreen = ({ initialView, onLogin, onSignup, onBack, allowSignupToggle = true, authFlow }) => {
  const [view, setView] = useState(initialView);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isAdmin = authFlow === 'admin';
  const demoCredentials = isAdmin
    ? { email: 'admin@connectsphere.com', pass: 'adminpassword' }
    : { email: 'user@connectsphere.com', pass: 'userpassword' };

  useEffect(() => {
    setView(initialView);
    setError('');
  }, [initialView]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const success = await onLogin({ email, password });
      if (!success) setError('Invalid email or password, or account is revoked.');
    } catch (err) {
      setError('An unexpected error occurred during login.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchToLogin = () => { setView('login'); setError(''); };
  const handleSwitchToSignup = () => { setView('signup'); setError(''); };

  const inputClasses = "block w-full px-4 py-3 bg-white/5 text-white border border-white/10 focus:border-indigo-500 rounded-xl focus:outline-none focus:ring-0 transition-all duration-200 placeholder:text-slate-500 disabled:opacity-50";

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
          onClick={onBack}
          className="flex items-center space-x-1 text-slate-400 hover:text-white transition-colors mb-6 group"
          aria-label="Go back"
        >
          <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-sm">Back</span>
        </button>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">

          {/* Header */}
          <div className="flex flex-col items-center space-y-3 text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/40 rounded-xl blur-lg scale-150" />
              <div className="relative bg-indigo-600 p-3 rounded-xl">
                <LogoIcon className="h-7 w-7 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">
                {view === 'login' ? 'Welcome back' : 'Create your account'}
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                {isAdmin
                  ? '🔐 Administrator access'
                  : view === 'login'
                  ? 'Sign in to your ConnectSphere account'
                  : 'Join the ConnectSphere community'}
              </p>
            </div>
          </div>

          {/* Admin badge */}
          {isAdmin && (
            <div className="flex items-center justify-center space-x-2 bg-red-500/10 border border-red-500/20 rounded-xl py-2 px-4">
              <span className="text-red-400 text-xs font-bold uppercase tracking-widest">Admin Portal</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center space-x-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              <span className="text-red-400 text-sm">⚠️ {error}</span>
            </div>
          )}

          {/* Login Form */}
          {view === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className={inputClasses}
                  placeholder="you@example.com"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className={inputClasses}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>

              {/* Demo credentials */}
              {authFlow && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-slate-400 space-y-1">
                  <p className="font-bold text-slate-300">Demo credentials</p>
                  <p>📧 {demoCredentials.email}</p>
                  <p>🔑 {demoCredentials.pass}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex justify-center items-center shadow-lg shadow-indigo-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? <SpinnerIcon className="animate-spin h-5 w-5 text-white" /> : 'Log In'}
              </button>

              <div className="flex items-center justify-between text-sm pt-1">
                <button
                  type="button"
                  onClick={() => alert('Password reset functionality is not yet implemented.')}
                  className="text-slate-400 hover:text-indigo-400 transition-colors"
                >
                  Forgot password?
                </button>
                {allowSignupToggle && (
                  <button
                    type="button"
                    onClick={handleSwitchToSignup}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                  >
                    Create account →
                  </button>
                )}
              </div>
            </form>
          ) : (
            <SignupForm onSignup={onSignup} onSwitchToLogin={handleSwitchToLogin} onError={setError} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
