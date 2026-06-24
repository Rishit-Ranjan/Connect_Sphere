/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from "react";
import {
  Shield,
  Sparkles,
  Mail,
  BookOpen,
  Calendar,
  MapPin,
  Activity,
  FileText,
  Users,
  Save,
  Heart,
  MessageSquare,
  ChevronRight,
  Fingerprint,
  TrendingUp,
  Sliders,
  CheckCircle2,
  Lock,
} from "lucide-react";
export default function ProfileView({
  currentUser,
  users,
  posts,
  resources,
  onUpdateProfile,
  onNavigateTab,
}) {
  const [activeSubTab, setActiveSubTab] = useState("overview");
  // Edit Profile States
  const [name, setName] = useState(currentUser.name);
  const [bio, setBio] = useState(currentUser.bio || "");
  const [department, setDepartment] = useState(
    currentUser.department || "Computer Science",
  );
  const [email, setEmail] = useState(currentUser.email);
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl);
  const [saveSuccess, setSaveSuccess] = useState(false);
  // Profile avatar presets removed (avoid hardcoded image placeholders)

  // Derive counts
  const myPosts = posts.filter((p) => p.author.id === currentUser.id);
  const myResources = resources.filter(
    (r) => r.uploadedBy === currentUser.name,
  );
  const totalLikesOnMyPosts = myPosts.reduce((acc, p) => acc + p.likesCount, 0);
  // Follower standing counts
  const followingCount = users.filter((u) => u.following).length;
  const connectionsCount = users.filter((u) => u.connected).length;
  const handleSave = (e) => {
    e.preventDefault();
    const updated = {
      ...currentUser,
      name,
      bio,
      department,
      email,
      avatarUrl,
    };
    onUpdateProfile(updated);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setActiveSubTab("overview");
    }, 1200);
  };
  const isAdmin = currentUser.role === "admin";
  return (
    <div
      className="flex-1 p-6 space-y-6 max-w-4xl mx-auto font-sans relative"
      id="profile-container"
    >
      {/* 1. Styled Header Hero Banner */}
      <div
        className={`relative h-44 rounded-3xl overflow-hidden shadow-sm flex items-end p-6 border ${
          isAdmin
            ? "bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 border-amber-200/20"
            : "bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 border-slate-200"
        }`}
        id="profile-hero"
      >
        {/* Abstract background blobs */}
        <div className="absolute top-[-40%] right-[-10%] w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-30%] left-[-5%] w-60 h-60 bg-slate-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Cover Photo Floating Meta details */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full z-10 gap-4">
          <div className="flex items-center gap-4.5">
            <div className="relative">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className={`w-20 h-20 rounded-full object-cover border-4 bg-white ${isAdmin ? "border-amber-400" : "border-indigo-500"}`}
                referrerPolicy="no-referrer"
                id="profile-avatar-display"
              />
              {isAdmin ? (
                <span
                  className="absolute bottom-0 right-0 bg-amber-500 text-slate-950 p-1 rounded-full border border-white shadow-sm"
                  title="Certified Admin"
                >
                  <Shield size={12} className="fill-current" />
                </span>
              ) : (
                <span
                  className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1 rounded-full border border-white shadow-sm"
                  title="Active Student"
                >
                  <Sparkles size={12} className="animate-pulse" />
                </span>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-display font-extrabold text-white truncate leading-none">
                  {currentUser.name}
                </h1>
                {isAdmin ? (
                  <span className="text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded uppercase tracking-wider">
                    SYSTEM ADMIN
                  </span>
                ) : (
                  <span className="text-[9px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded uppercase tracking-wider">
                    STUDENT
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300/80 font-mono mt-1">
                @{currentUser.handle}
              </p>
              <p className="text-xs text-slate-400 font-medium mt-1 flex items-center gap-1">
                <MapPin size={11} className="text-slate-400" />
                {currentUser.department || "General Department"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveSubTab("overview")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all cursor-pointer ${
                activeSubTab === "overview"
                  ? "bg-white/15 text-white backdrop-blur-sm border border-white/10"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
              id="profile-btn-overview"
            >
              Overview
            </button>
            <button
              onClick={() => setActiveSubTab("edit")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all cursor-pointer ${
                activeSubTab === "edit"
                  ? "bg-white/15 text-white backdrop-blur-sm border border-white/10"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
              id="profile-btn-edit"
            >
              Edit Card
            </button>
          </div>
        </div>
      </div>

      {/* 2. Sub-Tab Layout Panels */}
      {activeSubTab === "overview" ? (
        <div className="grid md:grid-cols-3 gap-6" id="profile-overview-panel">
          {/* Left Columns - Stats & Info Card (1/3 Width) */}
          <div className="space-y-6 md:col-span-1">
            {/* Biography Bento */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-display font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Fingerprint size={13} className="text-indigo-600" />
                Campus Bio
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed italic bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                "
                {currentUser.bio ||
                  `Welcome! I'm ${currentUser.name}, and I'm glad to connect with fellow peers.`}
                "
              </p>
              <div className="space-y-2.5 pt-1 text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <Mail size={12} className="text-slate-400" />
                  <span className="truncate">{currentUser.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={12} className="text-slate-400" />
                  <span>Joined Semester: Autumn 2026</span>
                </div>
              </div>
            </div>

            {/* Standings/Social Stat Grid */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-display font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Users size={13} className="text-emerald-500" />
                Network Standing
              </h3>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl">
                  <span className="block text-lg font-black text-slate-900">
                    {followingCount}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    Following
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl">
                  <span className="block text-lg font-black text-slate-900">
                    {connectionsCount}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    Connections
                  </span>
                </div>
              </div>

              {/* Suggestions quick navigate link */}
              <button
                onClick={() => onNavigateTab("feed")}
                className="w-full py-2 border border-slate-200 rounded-xl hover:border-indigo-500 text-[10px] font-bold text-indigo-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                Discover more people
                <ChevronRight size={10} />
              </button>
            </div>

            {/* Admin Exclusive panel inside the left sidebar */}
            {isAdmin && (
              <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-display font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock size={13} className="text-amber-600" />
                  Admin Credentials
                </h3>
                <ul className="space-y-2 text-[10px] text-amber-800 leading-normal font-medium">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={11} className="text-emerald-600" />{" "}
                    Direct Broadcast Posting
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={11} className="text-emerald-600" /> Ban
                    & Role Promotion Authority
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={11} className="text-emerald-600" /> Full
                    Resource Moderation
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Right Columns - Achievements & Contributions (2/3 Width) */}
          <div className="space-y-6 md:col-span-2">
            {/* Bento statistics grid */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
              <h3 className="text-xs font-display font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 mb-4">
                <TrendingUp size={13} className="text-indigo-600" />
                Engagement Overview
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50/60 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <FileText size={15} />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Posts Created
                    </span>
                    <span className="text-lg font-black text-slate-900 leading-none">
                      {myPosts.length}
                    </span>
                  </div>
                </div>

                <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50/60 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
                    <Heart size={15} />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Likes Received
                    </span>
                    <span className="text-lg font-black text-slate-900 leading-none">
                      {totalLikesOnMyPosts}
                    </span>
                  </div>
                </div>

                <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50/60 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <BookOpen size={15} />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Uploads Shared
                    </span>
                    <span className="text-lg font-black text-slate-900 leading-none">
                      {myResources.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Contributions Tab */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-display font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity size={13} className="text-indigo-600" />
                  Recent Contributions
                </h3>
                <span className="text-[10px] font-mono text-slate-400">
                  ACTIVITIES
                </span>
              </div>

              {myPosts.length === 0 && myResources.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-400 mb-2">
                    <FileText size={18} />
                  </div>
                  <p className="text-xs font-semibold text-slate-500">
                    No postings discovered
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-xs mx-auto">
                    Your updates, files, and lectures will show up here once you
                    post.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                  {/* Render Posts */}
                  {myPosts.map((post) => (
                    <div
                      key={post.id}
                      className="border border-slate-100 bg-slate-50/30 p-3 rounded-2xl space-y-2"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span className="font-bold text-indigo-600 uppercase">
                          FEED POST
                        </span>
                        <span>
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-800 leading-relaxed font-medium line-clamp-3">
                        {post.text}
                      </p>
                      <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-100/60">
                        <span className="flex items-center gap-1">
                          <Heart size={11} className="text-rose-500" />{" "}
                          {post.likesCount} Likes
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare size={11} className="text-slate-400" />{" "}
                          {post.comments.length} Comments
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Render Resources */}
                  {myResources.map((res) => (
                    <div
                      key={res.id}
                      className="border border-slate-100 bg-slate-50/30 p-3 rounded-2xl space-y-2"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span className="font-bold text-emerald-600 uppercase">
                          RESOURCE FILE
                        </span>
                        <span>
                          {new Date(res.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          {res.title}
                        </h4>
                        <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">
                          {res.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 pt-1 border-t border-slate-100/60">
                        <span>
                          Type: {res.fileType} • Size: {res.fileSize}
                        </span>
                        <span className="font-bold text-slate-600">
                          {res.downloadCount} Downloads
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Edit Profile Mode Form console */
        <div
          className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm max-w-2xl mx-auto"
          id="profile-edit-panel"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <div>
              <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-1.5">
                <Sliders size={16} className="text-indigo-600" />
                Customize Campus Presence
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">
                Update your student ID details, profile image, and description
                bio.
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              EDIT PROFILE
            </span>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            {/* Success alert toast inside the card */}
            {saveSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-4 py-3 rounded-2xl flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 size={14} className="text-emerald-600" />
                Profile updated successfully! Syncing details...
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors bg-slate-50 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors bg-slate-50 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Department / Division
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors bg-slate-50 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Account Role
                </label>
                <input
                  type="text"
                  disabled
                  value={
                    currentUser.role === "admin"
                      ? "System Administrator (Managed)"
                      : "Student Participant"
                  }
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-100 text-slate-500 cursor-not-allowed font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Campus Bio Description
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share something about your studies or campus lifestyle..."
                className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors h-20 resize-none bg-slate-50 focus:bg-white"
              />
            </div>



            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveSubTab("overview")}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 px-6 rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <Save size={13} />
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
