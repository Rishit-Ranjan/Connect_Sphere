/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { ArrowRight, UserPlus, Sparkles } from 'lucide-react';


export default function LoginView({ onLogin, users, onAddUser }) {
    const [activeTab, setActiveTab] = useState('signin');

    const [name, setName] = useState('');
    const [handle, setHandle] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');
    const [department, setDepartment] = useState('');
    const [bio, setBio] = useState('');

    // Sign In States
    const [signInQuery, setSignInQuery] = useState('');

    const [signInError, setSignInError] = useState('');

    const handleSignIn = (e) => {
        e.preventDefault();
        if (!signInQuery.trim())
            return;

        const query = signInQuery.trim().toLowerCase();
        const cleanQuery = query.startsWith('@') ? query.slice(1) : query;

        const found = users.find((u) =>
            u.handle?.toLowerCase() === cleanQuery ||
            u.email?.toLowerCase() === query
        );

        if (found) {
            onLogin(found);
        }
        else {
            setSignInError('No profile found with that handle or email. Try another or register a new one.');
        }
    };

    const handleCreateAccount = (e) => {
        e.preventDefault();
        if (!name || !email)
            return;

        const newUser = {
            id: `user-${Date.now()}`,
            name,
            handle: handle.toLowerCase() || name.replace(/\s+/g, '').toLowerCase(),
            email,
            role,
            department,
            bio: bio || `Hi! I'm ${name}, a new participant in ConnectSphere.`,
            // No avatar selector UI anymore; allow null avatar.
            avatarUrl: null,
            connected: false,
            following: false
        };

        onAddUser(newUser);
        onLogin(newUser);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden font-sans">
            {/* Human-crafted background: soft circles and radial grids */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-slate-200/50 filter blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-50/70 filter blur-[100px]" />
                <div className="absolute top-[40%] right-[15%] w-[300px] h-[300px] rounded-full bg-slate-200/40 filter blur-[80px]" />
            </div>

            <div className="w-full max-w-4xl grid md:grid-cols-5 bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden relative z-10">
                {/* Left Editorial Sidebar in Login Form */}
                <div className="md:col-span-2 bg-slate-900 text-slate-100 p-8 flex flex-col justify-between relative">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                    <div>
                        <div className="flex items-center gap-2 mb-8">
                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-indigo-600 font-display font-extrabold text-lg shadow-sm">
                                C
                            </div>
                            <span className="font-display font-bold tracking-tight text-xl text-white">ConnectSphere</span>
                        </div>

                        <h1 className="font-display font-semibold text-3xl tracking-tight leading-tight mb-4 text-white">
                            Where your campus comes together.
                        </h1>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6">
                            Connect with peers, view academic schedules, coordinate placements, download course material, and message directly in a highly cohesive local network.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-md bg-slate-800 flex items-center justify-center text-xs">📢</div>
                            <div>
                                <h4 className="text-xs font-semibold text-slate-200">Instant Broadcasts</h4>
                                <p className="text-slate-400 text-[11px]">Seamless lecture schedule and placement updates</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-md bg-slate-800 flex items-center justify-center text-xs">💬</div>
                            <div>
                                <h4 className="text-xs font-semibold text-slate-200">Live Messenger</h4>
                                <p className="text-slate-400 text-[11px]">Real-time chat rooms and direct communication</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-md bg-slate-800 flex items-center justify-center text-xs">📁</div>
                            <div>
                                <h4 className="text-xs font-semibold text-slate-200">Resource Library</h4>
                                <p className="text-slate-400 text-[11px]">Download class lectures and exam syllabus papers</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-800 mt-6 flex items-center justify-between text-slate-500 text-[10px] font-mono">
                        <span>© 2025 ConnectSphere</span>
                    </div>

                </div>

                {/* Right Form Console */}
                <div className="md:col-span-3 p-8 flex flex-col justify-between bg-white">
                    <div>
                        {/* Tabs selector */}
                        <div className="flex border-b border-slate-200 mb-8">
                            <button onClick={() => {
                                setSignInError('');
                                setActiveTab('signin');
                            }} className={`pb-3 text-sm font-semibold tracking-tight relative transition-all mr-6 flex items-center gap-2 cursor-pointer ${activeTab === 'signin' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
                                <Sparkles size={16}/>
                                Sign In
                            </button>
                            <button onClick={() => setActiveTab('create')} className={`pb-3 text-sm font-semibold tracking-tight relative transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'create' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
                                <UserPlus size={16}/>
                                Create Account
                            </button>
                        </div>


                        {/* Content: SIGN IN WITH CARD */}
                        {activeTab === 'signin' ? (<form onSubmit={handleSignIn} className="space-y-4 py-2 animate-fadeIn">

                <div className="mb-4">
                  <h3 className="font-display font-bold text-lg text-slate-900 mb-1">
                    Sign in with your campus card
                  </h3>
                  <p className="text-slate-500 text-xs">
                    Enter your digital student handle or registered email to sign back into your session.
                  </p>
                </div>

                {signInError && (<div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs px-3.5 py-2.5 rounded-xl font-medium">
                    ⚠️ {signInError}
                  </div>)}

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Campus Handle or Email *</label>
                  <input type="text" required placeholder="e.g. janedoe or jane@connectsphere.edu" value={signInQuery} onChange={(e) => {
                setSignInQuery(e.target.value);
                if (signInError)
                    setSignInError('');
            }} className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"/>
                </div>

                <button type="submit" className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer">
                  <ArrowRight size={14}/>
                  Sign In & Sync
                </button>
              </form>) : activeTab === 'select' ? (<div>
                <div className="mb-6">
                  <h3 className="font-display font-bold text-lg text-slate-900 mb-1">
                    Select a curated profile
                  </h3>
                  <p className="text-slate-500 text-xs">
                    Test the system under different roles: Admin controls, student postings, notices, and messaging.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                  {users.map((u) => (<button key={u.id} onClick={() => onLogin(u)} className="flex items-center text-left p-3.5 border border-slate-100 rounded-2xl hover:border-indigo-500 hover:bg-slate-50/50 transition-all group relative cursor-pointer">
                      <img src={u.avatarUrl} alt={u.name} referrerPolicy="no-referrer" className="w-10 h-10 rounded-full object-cover border border-slate-100 mr-3"/>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900 truncate tracking-tight">{u.name}</h4>
                          {u.role === 'admin' ? (<span className="text-[9px] px-1.5 py-0.5 font-mono bg-amber-50 text-amber-700 rounded border border-amber-200 font-medium">Admin</span>) : (<span className="text-[9px] px-1.5 py-0.5 font-mono bg-slate-50 text-slate-600 rounded border border-slate-200 font-medium">Student</span>)}
                        </div>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">@{u.handle}</p>
                        <p className="text-[9px] text-slate-400 truncate mt-0.5">{u.department}</p>
                      </div>
                      <div className="absolute right-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400">
                        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform"/>
                      </div>
                    </button>))}
                </div>
              </div>) : (
        /* Content: CREATE ACCOUNT */
        <form onSubmit={handleCreateAccount} className="space-y-4">
                <div className="mb-4">
                  <h3 className="font-display font-bold text-lg text-slate-900 mb-1">
                    Build your campus card
                  </h3>
                  <p className="text-slate-500 text-xs">
                    Choose your department, role, and personalize your digital presence.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Full Name *</label>
                    <input type="text" required placeholder="Jane Doe" value={name} onChange={(e) => setName(e.target.value)} className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"/>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Username (Handle)</label>
                    <input type="text" placeholder="janedoe" value={handle} onChange={(e) => setHandle(e.target.value)} className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"/>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address *</label>
                    <input type="email" required placeholder="jane@connectsphere.edu" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"/>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Department / Branch</label>
                    <input type="text" placeholder="Literature, Freshman" value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"/>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Role Type</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-white cursor-pointer">
                      <option value="participant">Participant/ User</option>

                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Campus Bio</label>
                    <input type="text" placeholder="Coffee addict, studying algorithms..." value={bio} onChange={(e) => setBio(e.target.value)} className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"/>
                  </div>
                </div>

                {/* Avatar Selection Picker removed (no preset selection) */}
                <button type="submit" className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer">
                  Register & Sign In
                </button>
              </form>)}
          </div>

          <div className="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between text-[11px] font-medium text-slate-500">
            {/* Removed bottom navigation buttons for Sign In / Create Account */}
          </div>

        </div>
      </div>
    </div>);
}
