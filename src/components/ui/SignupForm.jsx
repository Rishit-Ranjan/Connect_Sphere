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
        onError('');
        if (signupPassword !== signupConfirmPassword) {
            onError('Passwords do not match.');
            return;
        }
        if (signupPassword.length < 6) {
            onError('Password must be at least 6 characters long.');
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
            } else {
                onError('Could not create account. The email might already be in use.');
            }
        } catch (err) {
            onError('An unexpected error occurred during signup.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const inputClasses = "block w-full px-4 py-3 bg-white/5 text-white border border-white/10 focus:border-indigo-500 rounded-xl focus:outline-none transition-all duration-200 placeholder:text-slate-500 disabled:opacity-50";
    const labelClasses = "block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2";

    return (
        <form onSubmit={handleSignupSubmit} className="space-y-4">
            <div>
                <label className={labelClasses}>Full Name</label>
                <input
                    type="text"
                    value={signupName}
                    onChange={e => setSignupName(e.target.value)}
                    required
                    className={inputClasses}
                    placeholder="John Doe"
                    disabled={isLoading}
                />
            </div>

            <div>
                <label className={labelClasses}>Email</label>
                <input
                    type="email"
                    value={signupEmail}
                    onChange={e => setSignupEmail(e.target.value)}
                    required
                    className={inputClasses}
                    placeholder="you@example.com"
                    disabled={isLoading}
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className={labelClasses}>Password</label>
                    <input
                        type="password"
                        value={signupPassword}
                        onChange={e => setSignupPassword(e.target.value)}
                        required
                        className={inputClasses}
                        placeholder="Min. 6 chars"
                        disabled={isLoading}
                    />
                </div>
                <div>
                    <label className={labelClasses}>Confirm</label>
                    <input
                        type="password"
                        value={signupConfirmPassword}
                        onChange={e => setSignupConfirmPassword(e.target.value)}
                        required
                        className={inputClasses}
                        placeholder="••••••••"
                        disabled={isLoading}
                    />
                </div>
            </div>

            <div>
                <label className={labelClasses}>Gender</label>
                <select
                    value={signupGender}
                    onChange={e => setSignupGender(e.target.value)}
                    required
                    className={`${inputClasses} cursor-pointer`}
                    disabled={isLoading}
                    style={{ colorScheme: 'dark' }}
                >
                    <option value="prefer_not_to_say">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                </select>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex justify-center items-center shadow-lg shadow-indigo-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {isLoading ? <SpinnerIcon className="animate-spin h-5 w-5 text-white" /> : 'Create Account'}
            </button>

            <p className="text-center text-sm text-slate-500">
                Already have an account?{' '}
                <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                >
                    Log in →
                </button>
            </p>
        </form>
    );
};

export default SignupForm;
