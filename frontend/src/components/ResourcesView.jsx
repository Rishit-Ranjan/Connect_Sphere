/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { Search, Trash2, FileText, Upload, FolderOpen, Filter, ArrowDownToLine, Loader2 } from 'lucide-react';
export default function ResourcesView({ currentUser, resources, onAddResource, onDeleteResource, onDownloadResource }) {
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Lecture Slides');
    const [file, setFile] = useState(null);
    const [downloadingId, setDownloadingId] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [resourceError, setResourceError] = useState('');
    const categories = ['All', 'Lecture Slides', 'Assignments', 'Reference Books', 'Exam Material'];
    const handleUpload = async (e) => {
        e.preventDefault();
        setResourceError('');
        if (!title.trim() || !description.trim() || !file) {
            setResourceError('Enter a title and description, then choose a file to upload.');
            return;
        }
        try {
            setIsUploading(true);
            await onAddResource({ title: title.trim(), description: description.trim(), category, file });
            setTitle('');
            setDescription('');
            setCategory('Lecture Slides');
            setFile(null);
            setShowUploadForm(false);
        } catch (error) {
            setResourceError(error.message || 'Failed to upload resource.');
        } finally {
            setIsUploading(false);
        }
    };
    const downloadResource = async (resource) => {
        setResourceError('');
        setDownloadingId(resource.id);
        try {
            await onDownloadResource(resource);
        } catch (error) {
            setResourceError(error.message || 'Failed to download resource.');
        } finally {
            setDownloadingId(null);
        }
    };
    const filteredResources = resources.filter((res) => {
        const matchesSearch = res.title.toLowerCase().includes(searchText.toLowerCase()) ||
            res.description.toLowerCase().includes(searchText.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || res.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });
    return (<div className="flex-1 p-4 sm:p-6 space-y-6 max-w-4xl mx-auto font-sans relative">

      {/* Header block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 className="font-display font-extrabold text-slate-900 text-2xl tracking-tight flex items-center gap-2">
            <FolderOpen className="text-indigo-600" size={22}/>
            Course Resource Library
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">Download or upload curriculum guidelines, textbook chapters, mock exams, and lecture slides.</p>
        </div>

        <button onClick={() => {
          setResourceError('');
          setShowUploadForm(!showUploadForm);
        }} className="self-start sm:self-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-sm transition-all shrink-0 cursor-pointer">
          <Upload size={14}/>
          <span>Upload Material</span>
        </button>
      </div>

      {/* Upload Form Box */}
      {showUploadForm && (<div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md space-y-4">
          <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs uppercase tracking-wider">
            <FileText size={14} className="text-indigo-600 animate-pulse"/>
            <span>Contribute to Community Resource Hub</span>
          </div>

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Resource / File Title</label>
                <input type="text" required placeholder="e.g. Adv. Database Systems Midterm Prep Kit" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-slate-50/50"/>
              </div>

              <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full text-xs px-2 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white">
                    <option value="Lecture Slides">Lecture Slides</option>
                    <option value="Assignments">Assignments</option>
                    <option value="Reference Books">Reference Books</option>
                    <option value="Exam Material">Exam Material</option>
                  </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Quick description of contents</label>
                <input type="text" required placeholder="What is included? e.g. Questions 1-5, answer key, and recommended reading bibliography." value={description} onChange={(e) => setDescription(e.target.value)} className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-slate-50/50"/>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">File (PDF, ZIP, EPUB, PPTX, DOCX; max 25 MB)</label>
                <input
                  type="file"
                  required
                  accept=".pdf,.zip,.epub,.pptx,.docx"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-slate-50/50"
                />
              </div>
            </div>

            {resourceError && (
              <p role="alert" className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                {resourceError}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={() => {
                setFile(null);
                setResourceError('');
                setShowUploadForm(false);
              }} className="px-4 py-2 border border-slate-200 hover:border-slate-400 text-xs font-bold rounded-lg transition-colors cursor-pointer">
                Cancel
              </button>
              <button type="submit" disabled={isUploading} className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors cursor-pointer">
                {isUploading ? 'Uploading...' : 'Publish & Share'}
              </button>
            </div>
          </form>
        </div>)}

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
            <Search size={14}/>
          </span>
          <input type="text" placeholder="Search material description, titles..." value={searchText} onChange={(e) => setSearchText(e.target.value)} className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"/>
        </div>

        {resourceError && !showUploadForm && (
          <p role="alert" className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
            {resourceError}
          </p>
        )}

        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
            <Filter size={12}/>
          </span>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full text-xs pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer font-semibold text-slate-600">
            {categories.map((c) => (<option key={c} value={c}>
                {c === 'All' ? 'All Categories' : c}
              </option>))}
          </select>
        </div>
      </div>

      {/* Resources Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredResources.length > 0 ? (filteredResources.map((res) => {
            const isUploader = currentUser.name === res.uploadedBy;
            const canDelete = isUploader || currentUser.role === 'admin';
            return (<div key={res.id} className="bg-white border border-slate-200 hover:border-indigo-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col items-center justify-center shrink-0">
                        <span className="text-[9px] font-mono font-black text-indigo-600 leading-none">
                          {res.fileType}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] font-mono font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-100 uppercase">
                          {res.category}
                        </span>
                      </div>
                    </div>

                    {canDelete && (<button onClick={() => onDeleteResource(res.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50/50 transition-colors shrink-0 cursor-pointer" title="Delete material">
                        <Trash2 size={13}/>
                      </button>)}
                  </div>

                  <h3 className="font-display font-extrabold text-slate-900 text-sm mt-3 leading-snug">
                    {res.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed line-clamp-3">
                    {res.description}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-3.5 mt-4 flex items-center justify-between">
                  <div className="text-[10px] font-mono text-slate-400">
                    <p className="font-semibold text-slate-500">Uploader: {res.uploadedBy}</p>
                    <p className="text-[9px] mt-0.5">Size: {res.fileSize} • {res.downloadCount} Download(s)</p>
                  </div>

                  <button
                    onClick={() => downloadResource(res)}
                    disabled={!res.fileAvailable || downloadingId === res.id}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {downloadingId === res.id ? <Loader2 size={12} className="animate-spin"/> : <ArrowDownToLine size={12}/>}
                    <span>{res.fileAvailable ? (downloadingId === res.id ? 'Downloading...' : 'Download') : 'Unavailable'}</span>
                  </button>
                </div>
              </div>);
        })) : (<div className="col-span-1 md:col-span-2 text-center py-16 border border-slate-200 rounded-3xl bg-white">
            <FolderOpen size={24} className="mx-auto text-slate-300 mb-2"/>
            <p className="text-xs text-slate-400 font-medium">No materials correspond to your filters. Upload some papers!</p>
          </div>)}
      </div>
    </div>);
}
