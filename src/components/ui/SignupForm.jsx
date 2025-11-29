import React, { useState } from 'react';
import { SpinnerIcon } from '../Icons';
const SignupForm = ({ onSignup, onSwitchToLogin, onError }) => {
    const [signupName, setSignupName] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
    const [signupGender, setSignupGender] = useState('prefer_not_to_say');
    const [isLoading, setIsLoading] = useState(false);
    const handleSignupSubmit = async (e) => {
        e.preventDefault();
        onError(''); // Clear previous errors
        if (signupPassword !== signupConfirmPassword) {
            onError("Passwords do not match.");
            return;
        }
        if (signupPassword.length < 6) {
            onError("Password must be at least 6 characters long.");
            return;
        }
        setIsLoading(true);
        try {
            const success = await onSignup({
                name: signupName,
                email: signupEmail,
                password: signupPassword,
                gender: signupGender,
            });
            if (success) {
                alert('Account created successfully! Please log in.');
                onSwitchToLogin();
            }
            else {
                onError("Could not create account. The email might already be in use.");
            }
        }
        catch (err) {
            onError("An unexpected error occurred during signup.");
            console.error(err);
        }
        finally {
            setIsLoading(false);
        }
    };
    const commonInputClasses = "block w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-2 border-transparent focus:border-primary rounded-lg shadow-sm focus:outline-none focus:ring-0 transition disabled:opacity-50";
    return (<form onSubmit={handleSignupSubmit} className="space-y-4">
       <div>
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Full Name</label>
        <input type="text" value={signupName} onChange={e => setSignupName(e.target.value)} required className={commonInputClasses} placeholder="John Doe" disabled={isLoading}/>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Email</label>
        <input type="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} required className={commonInputClasses} placeholder="you@example.com" disabled={isLoading}/>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Password</label>
        <input type="password" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} required className={commonInputClasses} placeholder="Minimum 6 characters" disabled={isLoading}/>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Confirm Password</label>
        <input type="password" value={signupConfirmPassword} onChange={e => setSignupConfirmPassword(e.target.value)} required className={commonInputClasses} placeholder="••••••••" disabled={isLoading}/>
      </div>
       <div>
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Gender</label>
        <select value={signupGender} onChange={e => setSignupGender(e.target.value)} required className={commonInputClasses} disabled={isLoading}>
            <option value="prefer_not_to_say">Prefer not to say</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
        </select>
      </div>
      <button type="submit" disabled={isLoading} className="w-full py-3 px-4 font-semibold text-white bg-primary rounded-full hover:bg-indigo-700 transition-transform transform hover:scale-105 flex justify-center items-center disabled:opacity-75 disabled:cursor-not-allowed">
        {isLoading ? <SpinnerIcon className="animate-spin h-5 w-5 text-white"/> : 'Create Account'}
      </button>
      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        Already have an account?{' '}
        <button type="button" onClick={onSwitchToLogin} className="font-semibold text-primary hover:underline">
          Log In
        </button>
      </p>
    </form>);
};
export default SignupForm;
