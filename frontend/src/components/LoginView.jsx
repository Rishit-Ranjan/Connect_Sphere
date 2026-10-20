/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginView() {
  const { login, register, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('signin');

  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [email, setEmail] = useState('');
  const [newRegNo, setNewRegNo] = useState('');
  const [department, setDepartment] = useState('');
  const [bio, setBio] = useState('');
  const [password, setPassword] = useState('');

  const [regNo, setRegNo] = useState(
    () => localStorage.getItem('connectsphere.registrationNumber') || ''
  );
  const [signInPassword, setSignInPassword] = useState('');
  const [signInError, setSignInError] = useState('');
  const [createError, setCreateError] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState('');
  const [empId, setEmpId] = useState(
    () => localStorage.getItem('connectsphere.employeeId') || ''
  );
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [showForgotHelp, setShowForgotHelp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setSignInError('');

    if (!regNo.trim() || !signInPassword.trim()) {
      setSignInError('Please enter both registration number and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(regNo.trim(), signInPassword.trim(), 'registrationNumber');
    } catch (error) {
      console.error('Login error:', error);
      setSignInError(error.message || 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setCreateError('');

    if (!name.trim() || !email.trim() || !newRegNo.trim() || !password.trim()) {
      setCreateError('Please fill in all required fields.');
      return;
    }

    const newUser = {
      name: name.trim(),
      registrationNumber: newRegNo.trim(),
      handle: handle.trim().toLowerCase() || name.replace(/\s+/g, '').toLowerCase(),
      email: email.trim().toLowerCase(),
      password: password.trim(),
      department: department.trim(),
      bio: bio.trim()
    };

    try {
      setIsSubmitting(true);
      await register(newUser);
      setRegNo(newUser.registrationNumber);
      localStorage.setItem('connectsphere.registrationNumber', newUser.registrationNumber);
      setSignInPassword('');
      setPassword('');
      setCreateError('');
      setRegistrationSuccess('Account created. Sign in with your registration number and password.');
      setActiveTab('signin');
    } catch (error) {
      console.error('Registration error:', error);
      setCreateError(error.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminSignIn = async (e) => {
    e.preventDefault();
    setAdminError('');

    if (!empId.trim() || !adminPassword.trim()) {
      setAdminError('Please enter both employee ID and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      const user = await login(empId.trim(), adminPassword.trim(), 'employeeId');

      // The admin portal only accepts accounts flagged as admin.
      if (!user || user.role !== 'admin') {
        logout();
        setAdminError('This account does not have administrator access.');
        return;
      }

      setAdminPassword('');
    } catch (error) {
      console.error('Admin login error:', error);
      setAdminError(error.message || 'Admin login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f6fc] p-3 sm:p-6 relative overflow-hidden font-sans">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-48 -left-40 w-[34rem] h-[34rem] rounded-full bg-indigo-200/35 blur-[110px]" />
        <div className="absolute -bottom-52 -right-40 w-[38rem] h-[38rem] rounded-full bg-violet-200/35 blur-[120px]" />
        <div className="absolute top-1/3 right-1/3 w-72 h-72 rounded-full bg-sky-100/50 blur-[100px]" />
      </div>

      <div className="w-full max-w-5xl grid md:grid-cols-5 bg-white border border-white rounded-[1.75rem] shadow-[0_32px_90px_-35px_rgba(30,41,59,0.35)] overflow-hidden relative z-10">
        <div
          className="flex h-44 shrink-0 md:min-h-[650px] md:h-full md:col-span-2 text-slate-100 p-5 sm:p-6 lg:p-8 flex-col justify-between relative overflow-hidden"
        >
          <img
            src="/welcome-abstract.png"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#17134f]/75 via-indigo-900/45 to-blue-950/65" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3 md:mb-8">
              <div className="w-9 h-9 rounded-xl bg-white/95 flex items-center justify-center text-indigo-600 font-display font-extrabold text-lg shadow-sm">
                C
              </div>
              <span className="font-display font-bold tracking-tight text-xl text-white">ConnectSphere</span>
            </div>

            <div className="hidden md:inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-white/85 mb-5">
              Your campus, connected
            </div>
            <h1 className="font-display font-semibold text-xl md:text-[2.1rem] tracking-tight leading-[1.12] mb-2 md:mb-4 text-white">
              Where your campus comes together.
            </h1>
            <p className="hidden md:block text-white/80 text-[13px] leading-6 mb-6">
              Connect with peers, view academic schedules, coordinate placements, download course material, and message directly in a highly cohesive local network.
            </p>
          </div>

          <div className="relative z-10 hidden md:block space-y-3">
            <div className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-xl bg-slate-900/60 flex items-center justify-center text-sm shrink-0">📢</div>
              <div>
                <h4 className="text-xs font-semibold text-white">Instant Broadcasts</h4>
                <p className="text-white/65 text-[11px] mt-1">Lecture schedules and placement updates</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-xl bg-slate-900/60 flex items-center justify-center text-sm shrink-0">💬</div>
              <div>
                <h4 className="text-xs font-semibold text-white">Live Messenger</h4>
                <p className="text-white/65 text-[11px] mt-1">Group rooms and direct conversations</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-xl bg-slate-900/60 flex items-center justify-center text-sm shrink-0">📁</div>
              <div>
                <h4 className="text-xs font-semibold text-white">Resource Library</h4>
                <p className="text-white/65 text-[11px] mt-1">Share notes, lectures, and study material</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 hidden md:flex pt-5 border-t border-white/25 mt-5 items-center justify-between text-white/70 text-[10px] font-mono">
            <span>© 2026 ConnectSphere</span>
          </div>
        </div>

        <div className="md:col-span-3 p-5 sm:p-8 lg:p-10 flex flex-col justify-between bg-white">
          <div>
            <div className="flex items-center gap-1 rounded-2xl border border-slate-100 bg-slate-50 p-1.5 mb-7 sm:mb-10">
              <button
                type="button"
                onClick={() => {
                  setSignInError('');
                  setActiveTab('signin');
                }}
                aria-pressed={activeTab === 'signin'}
                className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold tracking-tight rounded-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'signin'
                    ? 'text-indigo-700 bg-white shadow-sm ring-1 ring-slate-200/70'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Sparkles size={16} />
                Sign In
              </button>

              <button
                type="button"
                onClick={() => {
                  setAdminError('');
                  setActiveTab('admin');
                }}
                aria-pressed={activeTab === 'admin'}
                className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold tracking-tight rounded-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'admin'
                    ? 'text-amber-700 bg-white shadow-sm ring-1 ring-slate-200/70'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <ShieldCheck size={16} />
                Admin
              </button>
            </div>

            {activeTab === 'signin' ? (
              <form onSubmit={handleSignIn} className="space-y-5 py-1 animate-fadeIn">
                <div className="mb-6">
                  <h3 className="font-display font-bold text-2xl tracking-tight text-slate-900 mb-2">
                    Welcome back
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Sign in with your student registration number to continue.
                  </p>
                </div>

                {signInError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs px-3.5 py-2.5 rounded-xl font-medium">
                    ⚠️ {signInError}
                  </div>
                )}

                {registrationSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3.5 py-2.5 rounded-xl font-medium">
                    {registrationSuccess}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-[0.12em]">
                    Registration number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2023CS101"
                    value={regNo}
                    onChange={(e) => {
                      setRegNo(e.target.value);
                      localStorage.setItem('connectsphere.registrationNumber', e.target.value);
                      setRegistrationSuccess('');
                      if (signInError) setSignInError('');
                    }}
                    className="w-full text-sm px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-[0.12em]">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter your password"
                    value={signInPassword}
                    onChange={(e) => {
                      setSignInPassword(e.target.value);
                      if (signInError) setSignInError('');
                    }}
                    className="w-full text-sm px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:from-indigo-400 disabled:to-violet-400 text-white text-sm font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 cursor-pointer"
                >
                  <ArrowRight size={14} />
                  {isSubmitting ? 'Signing In...' : 'Sign In & Sync'}
                </button>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowForgotHelp((prev) => !prev)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>

                {showForgotHelp && (
                  <div className="bg-indigo-50 border border-indigo-100 text-indigo-900 text-[11px] px-3.5 py-2.5 rounded-xl leading-relaxed">
                    Password resets are handled by your campus administrator. Contact them from
                    your registered campus address, or ask your department office to reset it.
                  </div>
                )}

                <div className="pt-5 mt-2 border-t border-slate-100 text-center text-xs text-slate-500">
                  New to ConnectSphere?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setCreateError('');
                      setRegistrationSuccess('');
                      setActiveTab('create');
                    }}
                    className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                  >
                    create here
                  </button>
                </div>
              </form>
            ) : activeTab === 'create' ? (
              <form onSubmit={handleCreateAccount} className="space-y-4 py-2 animate-fadeIn">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-display font-bold text-lg text-slate-900 mb-1">
                      Create your ConnectSphere account
                    </h3>
                    <p className="text-slate-500 text-xs">
                      Join your campus community and start connecting with peers.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCreateError('');
                      setActiveTab('signin');
                    }}
                    className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>

                {createError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs px-3.5 py-2.5 rounded-xl font-medium">
                    ⚠️ {createError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Username *(Handle)
                    </label>
                    <input
                      type="text"
                      placeholder="janedoe"
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                      className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="jane@connectsphere.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Reg. No. *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 2023CS101"
                      value={newRegNo}
                      onChange={(e) => setNewRegNo(e.target.value)}
                      className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Department / Branch
                    </label>
                    <input
                      type="text"
                      placeholder="Literature, Freshman"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Password *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Choose a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Campus Bio
                  </label>
                  <input
                    type="text"
                    placeholder="Coffee addict, studying algorithms..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  {isSubmitting ? 'Creating Account...' : 'Register & Sign In'}
                </button>

                <div className="pt-4 mt-2 border-t border-slate-100 text-center text-[11px] text-slate-500">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setSignInError('');
                      setActiveTab('signin');
                    }}
                    className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                  >
                    sign in here
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleAdminSignIn} className="space-y-4 py-2 animate-fadeIn">
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                      <ShieldCheck size={16} className="text-amber-600" />
                    </span>
                    <h3 className="font-display font-bold text-lg text-slate-900">
                      Administrator portal
                    </h3>
                  </div>
                  <p className="text-slate-500 text-xs mt-2">
                    Restricted access. Sign in with an admin-flagged account to manage users, notices,
                    resources, campus rooms, and moderation tools.
                  </p>
                </div>

                {adminError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs px-3.5 py-2.5 rounded-xl font-medium">
                    ⚠️ {adminError}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Emp ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your employee ID"
                    value={empId}
                    onChange={(e) => {
                      setEmpId(e.target.value);
                      localStorage.setItem('connectsphere.employeeId', e.target.value);
                      if (adminError) setAdminError('');
                    }}
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Admin Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter administrator password"
                    value={adminPassword}
                    onChange={(e) => {
                      setAdminPassword(e.target.value);
                      if (adminError) setAdminError('');
                    }}
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-6 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <ShieldCheck size={14} />
                  {isSubmitting ? 'Verifying Admin...' : 'Enter Admin Portal'}
                </button>

              </form>
            )}
          </div>

          <div className="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between text-[11px] font-medium text-slate-500" />
        </div>
      </div>
    </div>
  );
}