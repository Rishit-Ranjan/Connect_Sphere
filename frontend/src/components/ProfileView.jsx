/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useRef, useState } from "react";
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
  Palette,
  ImagePlus,
  Upload,
  Trash2,
  X,
} from "lucide-react";

const BANNER_GRADIENTS = [
  {
    id: "emerald",
    name: "Emerald",
    className: "bg-gradient-to-r from-emerald-800 via-green-900 to-teal-950",
  },
  {
    id: "ocean",
    name: "Ocean",
    className: "bg-gradient-to-r from-sky-700 via-cyan-800 to-blue-950",
  },
  {
    id: "violet",
    name: "Violet",
    className: "bg-gradient-to-r from-violet-800 via-purple-900 to-indigo-950",
  },
  {
    id: "rose",
    name: "Rose",
    className: "bg-gradient-to-r from-rose-700 via-pink-900 to-red-950",
  },
  {
    id: "sunset",
    name: "Sunset",
    className: "bg-gradient-to-r from-orange-700 via-rose-800 to-fuchsia-950",
  },
  {
    id: "amber",
    name: "Amber",
    className: "bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900",
  },
];

const AVATAR_PRESETS = [
  { name: "Blue", src: "/avatars/avatar-blue.svg" },
  { name: "Green", src: "/avatars/avatar-green.svg" },
  { name: "Orange", src: "/avatars/avatar-orange.svg" },
  { name: "Purple", src: "/avatars/avatar-purple.svg" },
  { name: "Rose", src: "/avatars/avatar-rose.svg" },
  { name: "Teal", src: "/avatars/avatar-teal.svg" },
];
const DEFAULT_AVATAR_URL = AVATAR_PRESETS[0].src;

export default function ProfileView({
  currentUser: signedInUser,
  viewedUser,
  users,
  posts,
  resources,
  onUpdateProfile,
  onUpdateAvatar,
  onDeleteAccount,
  onNavigateTab,
}) {
  const currentUser = viewedUser || signedInUser;
  const currentUserId = currentUser.id || currentUser._id;
  const signedInUserId = signedInUser.id || signedInUser._id;
  const isOwnProfile = !viewedUser || (
    (currentUserId && signedInUserId && String(currentUserId) === String(signedInUserId)) ||
    (currentUser.handle && currentUser.handle === signedInUser.handle)
  );
  const [activeSubTab, setActiveSubTab] = useState("overview");
  const [activeContributionTab, setActiveContributionTab] = useState("posts");
  // Edit Profile States
  const [name, setName] = useState(currentUser.name);
  const [bio, setBio] = useState(currentUser.bio || "");
  const [department, setDepartment] = useState(currentUser.department || "");
  const [email, setEmail] = useState(currentUser.email);
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl);
  const [bannerGradient, setBannerGradient] = useState(
    currentUser.bannerGradient || (currentUser.role === "admin" ? "amber" : "emerald"),
  );
  const [isBannerPickerOpen, setIsBannerPickerOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const avatarInputRef = useRef(null);
  // Profile avatar presets removed (avoid hardcoded image placeholders)

  // Derive counts
  const myPosts = posts.filter((post) =>
    String(post.author?.id || post.author?._id || '') === String(currentUserId || '')
  );
  const myComments = posts.flatMap((post) =>
    (post.comments || [])
      .filter((comment) =>
        String(comment.author?.id || comment.author?._id || comment.user?.id || comment.user?._id || '') ===
        String(currentUserId || '')
      )
      .map((comment) => ({ ...comment, post }))
  ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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
      bannerGradient,
    };
    onUpdateProfile(updated);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setActiveSubTab("overview");
    }, 1200);
  };
  const handleBannerGradientChange = (gradientId) => {
    setBannerGradient(gradientId);
    onUpdateProfile({ ...currentUser, bannerGradient: gradientId });
    setIsBannerPickerOpen(false);
  };
  const handleAvatarSelection = async (avatar) => {
    setAvatarError("");
    setIsUpdatingAvatar(true);
    try {
      const savedAvatarUrl = await onUpdateAvatar(avatar);
      setAvatarUrl(savedAvatarUrl);
    } catch (error) {
      setAvatarError(error.message || "Unable to update your profile photo.");
    } finally {
      setIsUpdatingAvatar(false);
    }
  };
  const handleAvatarFileChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setAvatarError("Choose a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Choose an image no larger than 5 MB.");
      return;
    }
    handleAvatarSelection(file);
  };
  const handleDeleteAccount = async (event) => {
    event.preventDefault();
    setDeleteError("");
    setIsDeletingAccount(true);
    try {
      await onDeleteAccount(deletePassword);
    } catch (error) {
      setDeleteError(error.message || "Unable to delete your account.");
      setIsDeletingAccount(false);
    }
  };
  const isAdmin = currentUser.role === "admin";
  const selectedBannerGradient =
    BANNER_GRADIENTS.find((gradient) => gradient.id === bannerGradient) ||
    BANNER_GRADIENTS[0];
  return (
    <div
      className="flex-1 p-4 sm:p-6 space-y-6 max-w-4xl mx-auto font-sans relative"
      id="profile-container"
    >
      {/* 1. Styled Header Hero Banner */}
      <div
        className={`relative h-44 rounded-3xl shadow-sm flex items-end p-6 border ${selectedBannerGradient.className} ${
          isAdmin ? "border-amber-200/20" : "border-slate-200"
        }`}
        id="profile-hero"
      >
        {/* Abstract background blobs */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
          <div className="absolute top-[-40%] right-[-10%] w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-[-30%] left-[-5%] w-60 h-60 bg-white/10 rounded-full blur-2xl" />
        </div>

        {isOwnProfile && <div className="absolute top-3 right-3 z-20">
          <button
            type="button"
            onClick={() => setIsBannerPickerOpen((open) => !open)}
            aria-label="Change profile banner gradient"
            aria-expanded={isBannerPickerOpen}
            aria-controls="profile-banner-gradient-picker"
            className="flex items-center gap-1.5 rounded-full border border-white/20 bg-slate-950/40 px-3 py-2 text-[10px] font-semibold text-white shadow-sm backdrop-blur-sm transition-colors hover:bg-slate-950/60"
          >
            <Palette size={13} />
            Edit banner
          </button>
          {isBannerPickerOpen && (
            <div
              id="profile-banner-gradient-picker"
              className="absolute right-0 top-11 w-52 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl"
            >
              <p className="mb-2 text-[9px] font-bold uppercase tracking-wider text-slate-600">
                Banner gradient
              </p>
              <div className="grid grid-cols-3 gap-2">
                {BANNER_GRADIENTS.map((gradient) => (
                  <button
                    key={gradient.id}
                    type="button"
                    aria-label={`${gradient.name} banner gradient`}
                    aria-pressed={bannerGradient === gradient.id}
                    onClick={() => handleBannerGradientChange(gradient.id)}
                    className={`rounded-lg border p-1 transition-colors ${
                      bannerGradient === gradient.id
                        ? "border-emerald-600 bg-emerald-50"
                        : "border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    <span
                      className={`block h-6 rounded-md ${gradient.className}`}
                    />
                    <span className="mt-1 block text-center text-[8px] font-medium text-slate-700">
                      {gradient.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>}

        {/* Cover Photo Floating Meta details */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full z-10 gap-4">
          <div className="flex items-center gap-4.5">
            <div className="relative">
              <img
                src={avatarUrl || null}
                alt={currentUser.name || 'User Avatar'}
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
              {currentUser.department && (
                <p className="text-xs text-slate-400 font-medium mt-1 flex items-center gap-1">
                  <MapPin size={11} className="text-slate-400" />
                  {currentUser.department}
                </p>
              )}
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
            {isOwnProfile && <button
              onClick={() => setActiveSubTab("edit")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all cursor-pointer ${
                activeSubTab === "edit"
                  ? "bg-white/15 text-white backdrop-blur-sm border border-white/10"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
              id="profile-btn-edit"
            >
              Edit Card
            </button>}
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
                {isOwnProfile && (
                  <div className="flex items-center gap-2">
                    <Mail size={12} className="text-slate-400" />
                    <span className="truncate">{currentUser.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar size={12} className="text-slate-400" />
                  <span>Joined Semester: </span>
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

            {isOwnProfile && (
              <div className="rounded-3xl border border-rose-200 bg-rose-50/60 p-5 shadow-sm">
                <h3 className="text-xs font-display font-bold uppercase tracking-wider text-rose-800">
                  Account management
                </h3>
                <p className="mt-2 text-[11px] leading-relaxed text-slate-600">
                  Permanently delete your account and its posts, uploads, messages, and other content.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setDeletePassword("");
                    setDeleteError("");
                    setIsDeleteDialogOpen(true);
                  }}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-3.5 py-2 text-xs font-bold text-rose-700 transition-colors hover:bg-rose-600 hover:text-white"
                >
                  <Trash2 size={13} />
                  Delete account
                </button>
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

              <div className="space-y-4">
                <div role="tablist" aria-label="Recent contribution type" className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeContributionTab === "posts"}
                    onClick={() => setActiveContributionTab("posts")}
                    className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
                      activeContributionTab === "posts"
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
                    }`}
                  >
                    Posts <span className="ml-1 opacity-75">{myPosts.length}</span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeContributionTab === "comments"}
                    onClick={() => setActiveContributionTab("comments")}
                    className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
                      activeContributionTab === "comments"
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
                    }`}
                  >
                    Comments <span className="ml-1 opacity-75">{myComments.length}</span>
                  </button>
                </div>

                <div role="tabpanel" className="max-h-[350px] space-y-2.5 overflow-y-auto pr-1">
                  {activeContributionTab === "posts" ? (
                    myPosts.length > 0 ? myPosts.map((post) => (
                      <article
                        key={post.id}
                        className="rounded-2xl border border-slate-100 bg-slate-50/40 p-3"
                      >
                        <div className="flex items-center justify-between gap-3 text-[10px] font-mono text-slate-400">
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                          <span>{post.comments?.length || 0} comments</span>
                        </div>
                        <p className="mt-2 whitespace-pre-wrap break-words text-xs font-medium leading-relaxed text-slate-800">
                          {post.text}
                        </p>
                        <div className="mt-2 flex items-center gap-4 border-t border-slate-100 pt-2 text-[10px] font-mono text-slate-500">
                          <span className="flex items-center gap-1">
                            <Heart size={11} className="text-rose-500" />
                            {post.likesCount || 0} likes
                          </span>
                        </div>
                      </article>
                    )) : (
                      <p className="rounded-xl border border-dashed border-slate-200 px-3 py-6 text-center text-[11px] text-slate-400">
                        No posts yet.
                      </p>
                    )
                  ) : (
                    myComments.length > 0 ? myComments.map((comment) => (
                      <article
                        key={`${comment.post.id}-${comment.id}`}
                        className="rounded-2xl border border-slate-100 bg-violet-50/30 p-3"
                      >
                        <div className="flex items-center justify-between gap-3 text-[10px] font-mono text-slate-400">
                          <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                          <span className="shrink-0">On a post</span>
                        </div>
                        <p className="mt-2 whitespace-pre-wrap break-words text-xs font-medium leading-relaxed text-slate-800">
                          {comment.text}
                        </p>
                        <p className="mt-2 border-t border-violet-100 pt-2 text-[10px] leading-relaxed text-slate-500">
                          On: {comment.post.text}
                        </p>
                      </article>
                    )) : (
                      <p className="rounded-xl border border-dashed border-slate-200 px-3 py-6 text-center text-[11px] text-slate-400">
                        No comments yet.
                      </p>
                    )
                  )}
                </div>

                {myResources.length > 0 && (
                  <section aria-labelledby="profile-resources-heading" className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 id="profile-resources-heading" className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-700">
                        <BookOpen size={12} className="text-emerald-600" />
                        Shared resources
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400">{myResources.length}</span>
                    </div>
                    <div className="space-y-2.5">
                      {myResources.map((resource) => (
                        <article
                          key={resource.id}
                          className="rounded-2xl border border-slate-100 bg-slate-50/40 p-3"
                        >
                          <div className="flex items-center justify-between gap-3 text-[10px] font-mono text-slate-400">
                            <span>Resource file</span>
                            <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
                          </div>
                          <h5 className="mt-2 text-xs font-bold text-slate-900">{resource.title}</h5>
                          {resource.description && (
                            <p className="mt-1 line-clamp-2 text-[10px] text-slate-500">{resource.description}</p>
                          )}
                          <div className="mt-2 flex justify-between border-t border-slate-100 pt-2 text-[9px] font-mono text-slate-400">
                            <span>{resource.fileType} · {resource.fileSize}</span>
                            <span>{resource.downloadCount} downloads</span>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : isOwnProfile ? (
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

            <fieldset className="border-b border-slate-100 pb-5">
              <legend className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Profile photo
              </legend>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-indigo-100 bg-slate-50">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Profile photo preview" className="h-full w-full object-cover" />
                    ) : (
                      <ImagePlus size={22} className="text-slate-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Choose a photo or avatar</p>
                    <p className="mt-1 text-[10px] text-slate-500">
                      JPG, PNG, or WebP · up to 5 MB. Changes save immediately.
                    </p>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleAvatarFileChange}
                      className="hidden"
                      aria-label="Upload profile photo"
                    />
                    <button
                      type="button"
                      disabled={isUpdatingAvatar}
                      onClick={() => avatarInputRef.current?.click()}
                      className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-slate-700 transition-colors hover:border-indigo-200 hover:bg-indigo-50 disabled:opacity-50"
                    >
                      <Upload size={12} />
                      {isUpdatingAvatar ? "Saving photo..." : "Upload from device"}
                    </button>
                    {avatarUrl && avatarUrl !== DEFAULT_AVATAR_URL && (
                      <button
                        type="button"
                        disabled={isUpdatingAvatar}
                        onClick={() => handleAvatarSelection(DEFAULT_AVATAR_URL)}
                        className="mt-2 ml-2 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-50"
                      >
                        Remove photo
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="mb-2 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    Or pick a custom avatar
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {AVATAR_PRESETS.map((avatar) => (
                      <button
                        key={avatar.src}
                        type="button"
                        disabled={isUpdatingAvatar}
                        onClick={() => handleAvatarSelection(avatar.src)}
                        aria-label={`Use ${avatar.name} avatar`}
                        aria-pressed={avatarUrl === avatar.src}
                        className={`flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 bg-white transition-all hover:scale-105 disabled:opacity-50 ${
                          avatarUrl === avatar.src
                            ? "border-indigo-600 ring-2 ring-indigo-100"
                            : "border-slate-200 hover:border-indigo-300"
                        }`}
                      >
                        <img src={avatar.src} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {avatarError && (
                <p role="alert" className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600">
                  {avatarError}
                </p>
              )}
            </fieldset>

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
      ) : null}

      {isOwnProfile && isDeleteDialogOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/55 p-4">
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
            aria-describedby="delete-account-description"
            className="w-full max-w-md rounded-2xl border border-rose-100 bg-white p-5 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="rounded-xl bg-rose-50 p-2 text-rose-600">
                  <Trash2 size={18} />
                </span>
                <div>
                  <h2 id="delete-account-title" className="text-base font-bold text-slate-900">
                    Delete your account?
                  </h2>
                  <p id="delete-account-description" className="mt-2 text-xs leading-relaxed text-slate-600">
                    This permanently removes your profile, posts, uploaded resources, messages, notices, and rooms you created. This cannot be undone.
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isDeletingAccount}
                onClick={() => setIsDeleteDialogOpen(false)}
                aria-label="Close account deletion dialog"
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleDeleteAccount} className="mt-5 space-y-3">
              {deleteError && (
                <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
                  {deleteError}
                </p>
              )}
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600">
                Enter your password to confirm
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={deletePassword}
                  onChange={(event) => setDeletePassword(event.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm normal-case tracking-normal outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10"
                />
              </label>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  disabled={isDeletingAccount}
                  onClick={() => setIsDeleteDialogOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDeletingAccount || !deletePassword}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 size={13} />
                  {isDeletingAccount ? "Deleting..." : "Permanently delete"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
