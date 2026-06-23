'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Lock, Eye, LogOut, CheckCircle, XCircle, Edit, Trash2, RefreshCw, Layers, Terminal, AlertCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Dashboard content states
  const [posts, setPosts] = useState([]);
  const [statusFilter, setStatusFilter] = useState('pending'); // pending, approved, rejected
  const [logs, setLogs] = useState({ fetchLogs: [], duplicateLogs: [] });
  const [activeTab, setActiveTab] = useState('posts'); // posts, logs
  const [loading, setLoading] = useState(true);
  const [cronRunning, setCronRunning] = useState(false);
  const [cronMessage, setCronMessage] = useState('');

  // Editing state
  const [editingPost, setEditingPost] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [editKeyPoints, setEditKeyPoints] = useState('');
  const [editCategory, setEditCategory] = useState('');

  // Verify auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Fetch posts when filter or tab changes
  useEffect(() => {
    if (isLoggedIn) {
      if (activeTab === 'posts') {
        fetchPosts();
      } else {
        fetchLogs();
      }
    }
  }, [isLoggedIn, statusFilter, activeTab]);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/admin/posts?status=pending');
      if (res.ok) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    } catch (e) {
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) {
        setIsLoggedIn(true);
      } else {
        setLoginError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setLoginError('Server error. Try again.');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' });
    setIsLoggedIn(false);
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/posts?status=${statusFilter}`);
      const data = await res.json();
      if (data.success) {
        setPosts(data.posts);
      }
    } catch (e) {
      console.error('Failed to load posts:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/logs');
      const data = await res.json();
      if (data.success) {
        setLogs({
          fetchLogs: data.fetchLogs || [],
          duplicateLogs: data.duplicateLogs || []
        });
      }
    } catch (e) {
      console.error('Failed to load logs:', e);
    } finally {
      setLoading(false);
    }
  };

  const updatePostStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchPosts();
      }
    } catch (e) {
      console.error('Status transition failed:', e);
    }
  };

  const deletePost = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this post?')) return;
    try {
      const res = await fetch(`/api/admin/posts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchPosts();
      }
    } catch (e) {
      console.error('Deletion failed:', e);
    }
  };

  const runScraperManually = async () => {
    setCronRunning(true);
    setCronMessage('Scraper activated. Fetching, deduplicating, and generating AI summaries... (this takes around 30 seconds)');
    try {
      const res = await fetch('/api/cron/fetch-news');
      const data = await res.json();
      if (data.success) {
        setCronMessage(`Success! Fetched ${data.fetched} posts, summarized ${data.summarized}, found ${data.duplicatesDetected} duplicates.`);
        fetchPosts();
      } else {
        setCronMessage(`Failed: ${data.error}`);
      }
    } catch (e) {
      setCronMessage('Execution timed out or failed.');
    } finally {
      setCronRunning(false);
    }
  };

  // Open Edit Modal
  const startEditing = (post) => {
    setEditingPost(post);
    setEditTitle(post.title);
    setEditSummary(post.summary);
    setEditCategory(post.category);
    setEditKeyPoints(post.keyPoints ? post.keyPoints.join('\n') : '');
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    try {
      const keyPointsArray = editKeyPoints.split('\n').filter(p => p.trim().length > 0);
      const res = await fetch(`/api/admin/posts/${editingPost._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          summary: editSummary,
          category: editCategory,
          keyPoints: keyPointsArray,
        }),
      });

      if (res.ok) {
        setEditingPost(null);
        fetchPosts();
      }
    } catch (err) {
      console.error('Failed to save edits:', err);
    }
  };

  if (loading && !isLoggedIn) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest animate-pulse">
          Validating Security...
        </div>
      </div>
    );
  }

  // --- 1. Login View ---
  if (!isLoggedIn) {
    return (
      <div className="mx-auto w-full max-w-sm px-4 py-16 flex flex-col justify-center min-h-[70vh]">
        <div className="rounded-3xl border border-gray-800 bg-gray-900/50 p-8 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="mx-auto rounded-full bg-blue-500/10 p-3 border border-blue-500/20 text-blue-400 w-fit">
              <Shield className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">Admin Authorization</h2>
            <p className="text-[11px] text-gray-500">Sign in with config credentials to approve summaries</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl bg-gray-950 border border-gray-800 px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-gray-950 border border-gray-800 px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {loginError && (
              <p className="text-xs text-rose-500 font-bold flex items-center gap-1.5 bg-rose-500/5 border border-rose-500/10 p-2.5 rounded-lg">
                <AlertCircle className="h-4 w-4" /> {loginError}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg hover:bg-blue-500 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="h-4 w-4" /> Authenticate
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- 2. Admin Dashboard View ---
  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top dashboard header bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-gray-900 pb-5 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wider flex items-center gap-2 uppercase">
            <Shield className="h-7 w-7 text-blue-500" />
            Control Center
          </h1>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">
            AI News Aggregator Editorial Panel
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={runScraperManually}
            disabled={cronRunning}
            className={`rounded-lg px-4 py-2 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg border transition-all cursor-pointer ${
              cronRunning
                ? 'bg-amber-600/30 border-amber-500/20'
                : 'bg-indigo-600 border-indigo-500 hover:bg-indigo-500'
            }`}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${cronRunning ? 'animate-spin' : ''}`} />
            Trigger Aggregator Scraper
          </button>
          <button
            onClick={handleLogout}
            className="rounded-lg bg-gray-900 border border-gray-800 px-4 py-2 text-xs font-bold text-gray-400 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" /> Logout
          </button>
        </div>
      </div>

      {/* Scraper Status Notification Box */}
      {cronMessage && (
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 text-xs font-semibold text-gray-300">
          {cronMessage}
        </div>
      )}

      {/* Tabs selectors */}
      <div className="flex gap-4 border-b border-gray-900">
        <button
          onClick={() => setActiveTab('posts')}
          className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'posts' ? 'border-blue-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          News Posts Queue
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'logs' ? 'border-blue-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          Aggregation System Logs
        </button>
      </div>

      {/* --- TAB CONTENT: POSTS QUEUE --- */}
      {activeTab === 'posts' && (
        <div className="space-y-6">
          {/* Post Filter Controls */}
          <div className="flex flex-wrap gap-2">
            {['pending', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`rounded-lg px-4 py-1.5 text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                  statusFilter === status
                    ? 'bg-gray-800 border-gray-700 text-white font-black'
                    : 'bg-transparent border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                {status} ({posts.filter(p => p.status === status).length || (statusFilter === status ? posts.length : 0)})
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-12 text-xs font-bold text-gray-500 uppercase tracking-widest animate-pulse">
              Loading Posts Queue...
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-2xl border border-gray-900 bg-gray-900/10 p-12 text-center text-xs text-gray-500 font-semibold italic">
              "No news items match status '{statusFilter}'."
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post._id}
                  className="rounded-2xl border border-gray-900 bg-gray-900/40 p-5 space-y-4 hover:border-gray-800 transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    {/* Main post details */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-[10px]">
                        <span className="rounded bg-indigo-500/10 px-2 py-0.5 font-bold text-indigo-400 border border-indigo-500/20">
                          {post.category}
                        </span>
                        <span className="rounded bg-gray-900 px-2 py-0.5 font-semibold text-gray-400">
                          Trust: {post.confidenceScore}%
                        </span>
                        {post.city && (
                          <span className="rounded bg-rose-500/10 px-2 py-0.5 font-bold text-rose-400">
                            📍 {post.city}, {post.state}
                          </span>
                        )}
                        {post.isDuplicate && (
                          <span className="rounded bg-rose-500/20 border border-rose-500/30 px-2 py-0.5 font-bold text-rose-400">
                            DUPLICATE
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-white pt-1">
                        {post.title}
                      </h3>
                      <p className="text-xs text-gray-500">
                        Source: <a href={post.sourceUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline inline-flex items-center gap-0.5">{post.sourceName} <Eye className="h-3 w-3 inline" /></a> | Fetched: {new Date(post.fetchedAt).toLocaleString()}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 self-end md:self-auto">
                      {statusFilter === 'pending' && (
                        <button
                          onClick={() => updatePostStatus(post._id, 'approved')}
                          className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle className="h-3.5 w-3.5" /> Approve
                        </button>
                      )}
                      {statusFilter === 'approved' && (
                        <button
                          onClick={() => updatePostStatus(post._id, 'rejected')}
                          className="rounded-lg bg-amber-600 hover:bg-amber-500 px-3 py-1.5 text-xs font-bold text-white flex items-center gap-1 cursor-pointer"
                        >
                          <XCircle className="h-3.5 w-3.5" /> Reject
                        </button>
                      )}
                      {statusFilter === 'rejected' && (
                        <button
                          onClick={() => updatePostStatus(post._id, 'pending')}
                          className="rounded-lg bg-gray-800 hover:bg-gray-700 px-3 py-1.5 text-xs font-bold text-gray-200 flex items-center gap-1 cursor-pointer"
                        >
                          Send to Pending
                        </button>
                      )}
                      
                      <button
                        onClick={() => startEditing(post)}
                        className="rounded-lg bg-gray-900 border border-gray-800 hover:border-gray-700 p-2 text-gray-400 hover:text-white cursor-pointer"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => deletePost(post._id)}
                        className="rounded-lg bg-gray-900 border border-gray-800 hover:border-rose-900 hover:bg-rose-950/20 p-2 text-gray-400 hover:text-rose-500 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Summary preview block */}
                  <div className="bg-gray-950 p-4 rounded-xl border border-gray-900/60 text-xs text-gray-300 leading-relaxed">
                    <strong>AI Summary Preview:</strong> {post.summary}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- TAB CONTENT: SYSTEM LOGS --- */}
      {activeTab === 'logs' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Fetching Logs */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-gray-300 uppercase tracking-widest flex items-center gap-1.5 border-b border-gray-900 pb-2">
              <Terminal className="h-4 w-4 text-blue-400" />
              Aggregator Scrape logs
            </h3>
            {loading ? (
              <div className="animate-pulse h-24 bg-gray-900 rounded-xl"></div>
            ) : logs.fetchLogs.length === 0 ? (
              <p className="text-xs text-gray-500 italic">No fetch logs available.</p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {logs.fetchLogs.map((log) => (
                  <div key={log._id} className="rounded-xl border border-gray-900 bg-gray-900/20 p-3.5 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-300">
                        {new Date(log.startedAt).toLocaleString()}
                      </span>
                      <span className={`px-2 py-0.5 rounded font-black text-[9px] uppercase ${
                        log.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-500">
                      <div>Fetched: <span className="font-bold text-gray-400">{log.postsFetched}</span></div>
                      <div>Summarized: <span className="font-bold text-gray-400">{log.postsSummarized}</span></div>
                    </div>
                    {log.errors && log.errors.length > 0 && (
                      <div className="text-[10px] text-rose-400 font-semibold bg-rose-500/5 p-2 rounded border border-rose-500/10">
                        Errors: {log.errors.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Deduplication Logs */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-gray-300 uppercase tracking-widest flex items-center gap-1.5 border-b border-gray-900 pb-2">
              <Layers className="h-4 w-4 text-purple-400" />
              Duplicate check logs
            </h3>
            {loading ? (
              <div className="animate-pulse h-24 bg-gray-900 rounded-xl"></div>
            ) : logs.duplicateLogs.length === 0 ? (
              <p className="text-xs text-gray-500 italic">No duplicate check logs available.</p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {logs.duplicateLogs.map((log) => (
                  <div key={log._id} className="rounded-xl border border-gray-900 bg-gray-900/20 p-3.5 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-300">
                        {new Date(log.checkedAt).toLocaleString()}
                      </span>
                      <span className="text-[11px] font-bold text-gray-500">
                        Compared: {log.postsCompared}
                      </span>
                    </div>
                    <div className="text-[11px] text-rose-400 font-bold bg-rose-500/5 border border-rose-500/10 p-2 rounded">
                      Duplicates detected & rejected: {log.duplicatesFound}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- POPUP EDIT MODAL --- */}
      {editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-gray-800 bg-gray-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-900 pb-3">
              <h3 className="text-base font-bold text-white uppercase tracking-wider">Edit Article summary</h3>
              <button
                onClick={() => setEditingPost(null)}
                className="rounded text-gray-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={saveEdit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Headline</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-lg bg-gray-900 border border-gray-800 px-4 py-2 text-sm text-gray-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full rounded-lg bg-gray-900 border border-gray-800 px-4 py-2 text-sm text-gray-200 focus:outline-none"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Sports">Sports</option>
                    <option value="Education">Education</option>
                    <option value="Business">Business</option>
                    <option value="Science">Science</option>
                    <option value="Health">Health</option>
                    <option value="Politics">Politics</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="National">National</option>
                    <option value="International">International</option>
                    <option value="Accidents">Accidents</option>
                    <option value="Local">Local</option>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Children">Children</option>
                    <option value="Jobs">Jobs</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Summary (100 - 150 Words)</label>
                <textarea
                  required
                  rows={4}
                  value={editSummary}
                  onChange={(e) => setEditSummary(e.target.value)}
                  className="w-full rounded-lg bg-gray-900 border border-gray-800 px-4 py-2 text-sm text-gray-200 focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Key Points (One per line, exactly 5)</label>
                <textarea
                  rows={5}
                  value={editKeyPoints}
                  onChange={(e) => setEditKeyPoints(e.target.value)}
                  placeholder="Fact bullet point 1&#10;Fact bullet point 2..."
                  className="w-full rounded-lg bg-gray-900 border border-gray-800 px-4 py-2 text-sm text-gray-200 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-gray-900 pt-3">
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 cursor-pointer"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingPost(null)}
                  className="rounded-lg bg-gray-900 border border-gray-800 px-4 py-2 text-xs font-bold text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
