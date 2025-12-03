import React, { useState, useEffect } from 'react';
import { LogoIcon, ArrowLeftIcon, SpinnerIcon } from './Icons';
import SignupForm from './ui/SignupForm'; // Import the new component
const AuthScreen = ({ initialView, onLogin, onSignup, onBack, allowSignupToggle = true, authFlow }) => {
  const [view, setView] = useState(initialView);
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const demoCredentials = authFlow === 'admin'
    ? { email: 'admin@connectsphere.com', pass: 'adminpassword' }
    : { email: 'user@connectsphere.com', pass: 'userpassword' };
  useEffect(() => {
    setView(initialView);
    setError('');
  }, [initialView]);
  // Fix: Made handleLoginSubmit async to await the result of onLogin.
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const success = await onLogin({ email, password });
      if (!success) {
        setError('Invalid email or password, or account is revoked.');
      }
    }
    catch (err) {
      setError('An unexpected error occurred during login.');
      console.error(err);
    }
    finally {
      setIsLoading(false);
    }
  };
  const handleSwitchToLogin = () => {
    setView('login');
    setError('');
  };
  const handleSwitchToSignup = () => {
    setView('signup');
    setError('');
  };
  const commonInputClasses = "block w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-2 border-transparent focus:border-primary rounded-lg shadow-sm focus:outline-none focus:ring-0 transition-all duration-300 disabled:opacity-50";
  return (<div className="min-h-screen bg-light dark:bg-dark flex flex-col items-center justify-center p-4 font-sans transition-colors duration-300">
    <div className="w-full max-w-md mx-auto relative">
      <button onClick={onBack} className="absolute top-4 left-4 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-all duration-300 z-10 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="Go back to welcome screen">
        <ArrowLeftIcon className="w-6 h-6"/>
      </button>
      <div className="bg-white dark:bg-secondary shadow-2xl rounded-2xl p-8 space-y-6 overflow-hidden">
        <div className="w-full h-40 bg-gray-100 dark:bg-gray-800 rounded-xl mb-4 overflow-hidden relative group">
          <img
            src="https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=800&q=80"
            alt="Security"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          /> 
          <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent mix-blend-overlay" />
        </div>
        <div className="flex flex-col items-center space-y-2">
          <LogoIcon className="h-12 w-12 text-primary" />
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            {view === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
        </div>

        {error && <p className="text-center text-sm text-red-500 bg-red-500/10 p-3 rounded-lg">{error}</p>}

        {view === 'login' ? (<form onSubmit={handleLoginSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className={commonInputClasses} placeholder="you@example.com" disabled={isLoading} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className={commonInputClasses} placeholder="••••••••" disabled={isLoading} />
          </div>

          {authFlow && (<div className="bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg text-sm text-gray-600 dark:text-gray-400">
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">For Demo</h4>
            <p><strong>Email:</strong> {demoCredentials.email}</p>
            <p><strong>Password:</strong> {demoCredentials.pass}</p>
          </div>)}

          <button type="submit" disabled={isLoading} className="w-full py-3 px-4 font-semibold text-white bg-primary rounded-full hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 flex justify-center items-center disabled:opacity-75 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary">
            {isLoading ? <SpinnerIcon className="animate-spin h-5 w-5 text-white" /> : 'Log In'}
          </button>
          <div className="space-y-3 text-center text-sm">
            <button type="button" onClick={() => alert('Password reset functionality is not yet implemented.')} className="font-semibold text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
              Forgot Password?
            </button>
            {allowSignupToggle && (<p className="text-gray-500 dark:text-gray-400">
              Don't have an account?{' '}
              <button type="button" onClick={handleSwitchToSignup} className="font-semibold text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
                Sign Up
              </button>
            </p>)}
          </div>
        </form>) : (<SignupForm onSignup={onSignup} onSwitchToLogin={handleSwitchToLogin} onError={setError} />)}
      </div>
    </div>
  </div>);
};
export default AuthScreen;
