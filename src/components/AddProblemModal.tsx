'use client';

import React, { useState } from 'react';
import { X, Plus, Sparkles, Loader2, CheckCircle2, Code2 } from 'lucide-react';
import { NewProblemPayload } from '@/lib/types';

interface AddProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (problem: NewProblemPayload) => Promise<void>;
}

const SUPPORTED_LANGUAGES = [
  { value: 'python',     label: 'Python',     icon: '🐍' },
  { value: 'java',       label: 'Java',       icon: '☕' },
  { value: 'cpp',        label: 'C++',        icon: '⚡' },
  { value: 'c',          label: 'C',          icon: '🔵' },
  { value: 'javascript', label: 'JavaScript', icon: '🟨' },
  { value: 'typescript', label: 'TypeScript', icon: '🔷' },
  { value: 'go',         label: 'Go',         icon: '🐹' },
  { value: 'rust',       label: 'Rust',       icon: '🦀' },
];

// Language boilerplate code templates for new tabs
const BOILERPLATE: Record<string, string> = {
  python:     `class Solution:\n    def solve(self, nums: list[int]) -> int:\n        # Write your Python solution here\n        pass`,
  java:       `class Solution {\n    public int solve(int[] nums) {\n        // Write your Java solution here\n        return 0;\n    }\n}`,
  cpp:        `class Solution {\npublic:\n    int solve(vector<int>& nums) {\n        // Write your C++ solution here\n        return 0;\n    }\n};`,
  c:          `int solve(int* nums, int numsSize) {\n    // Write your C solution here\n    return 0;\n}`,
  javascript: `/**\n * @param {number[]} nums\n * @return {number}\n */\nvar solve = function(nums) {\n    // Write your JavaScript solution here\n    return 0;\n};`,
  typescript: `function solve(nums: number[]): number {\n    // Write your TypeScript solution here\n    return 0;\n}`,
  go:         `func solve(nums []int) int {\n    // Write your Go solution here\n    return 0\n}`,
  rust:       `impl Solution {\n    pub fn solve(nums: Vec<i32>) -> i32 {\n        // Write your Rust solution here\n        0\n    }\n}`,
};

export default function AddProblemModal({ isOpen, onClose, onSubmit }: AddProblemModalProps) {
  const [urlInput, setUrlInput] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fetchSuccess, setFetchSuccess] = useState(false);

  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [description, setDescription] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [codeSnippets, setCodeSnippets] = useState<Record<string, string>>({}); // langSlug -> code from LeetCode
  const [leetcodeSlug, setLeetcodeSlug] = useState(''); // stored slug for later re-fetching
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // LeetCode langSlug mapping: our lang value -> LeetCode's langSlug
  const LANG_SLUG_MAP: Record<string, string[]> = {
    python:     ['python3', 'python'],
    java:       ['java'],
    cpp:        ['cpp'],
    c:          ['c'],
    javascript: ['javascript'],
    typescript: ['typescript'],
    go:         ['golang', 'go'],
    rust:       ['rust'],
  };

  // Get the best available code snippet for a language
  const getCodeForLanguage = (lang: string, snippets: Record<string, string>): string => {
    const slugs = LANG_SLUG_MAP[lang] || [lang];
    for (const slug of slugs) {
      if (snippets[slug]) return snippets[slug];
    }
    return BOILERPLATE[lang] || '// Write your solution here';
  };

  if (!isOpen) return null;

  const handleFetchFromLeetCode = async () => {
    if (!urlInput.trim()) return;
    setIsFetching(true);
    setFetchError(null);
    setFetchSuccess(false);
    setError(null);

    try {
      const res = await fetch('/api/leetcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titleSlug: urlInput.trim() }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to fetch details');

      // Autofill title, difficulty, description
      setTitle(data.title || '');

      const diff = data.difficulty;
      if (diff === 'Easy' || diff === 'Medium' || diff === 'Hard') {
        setDifficulty(diff);
      }

      setDescription(data.description || '');
      setCodeSnippets(data.codeSnippets || {});
      setLeetcodeSlug(data.titleSlug || '');
      setUrlInput('');
      setFetchSuccess(true);
    } catch (err: any) {
      console.error(err);
      setFetchError(err?.message || 'Failed to auto-populate from LeetCode. Please check the URL or slug.');
    } finally {
      setIsFetching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleFetchFromLeetCode();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Problem title is required');
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      // Use the real LeetCode starter code if available, otherwise fall back to generic boilerplate
      const initialCode = getCodeForLanguage(selectedLanguage, codeSnippets);

      await onSubmit({
        title: title.trim(),
        difficulty,
        description: description.trim(),
        leetcode_slug: leetcodeSlug || undefined,
        initialLanguage: selectedLanguage,
        initialCode,
      });
      // Reset form fields
      setTitle('');
      setDifficulty('Easy');
      setDescription('');
      setSelectedLanguage('python');
      setCodeSnippets({});
      setLeetcodeSlug('');
      setFetchSuccess(false);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to create the problem. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-zinc-200 bg-white/95 text-zinc-900 shadow-2xl transition-all glow-medium max-h-[90vh] flex flex-col backdrop-blur-md">
        {/* Header background glow */}
        <div className="absolute -top-16 -left-16 h-32 w-32 rounded-full bg-indigo-500/5 blur-3xl" />
        <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-violet-500/5 blur-3xl" />

        <div className="relative flex items-center justify-between border-b border-zinc-150 px-6 py-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-extrabold text-zinc-900">Add New LeetCode Problem</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Container (scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* LeetCode Autofill Panel */}
          <div className={`p-4 rounded-xl border space-y-3 relative overflow-hidden shadow-inner transition-colors ${fetchSuccess ? 'border-emerald-400/30 bg-emerald-50/50' : 'border-sky-500/15 bg-sky-500/5'}`}>
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${fetchSuccess ? 'text-emerald-700' : 'text-sky-700'}`}>
              {fetchSuccess ? '✅ Problem auto-filled from LeetCode!' : '⚡ Paste LeetCode URL or slug — press Enter or click Fetch'}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g., https://leetcode.com/problems/two-sum/ or two-sum"
                value={urlInput}
                onChange={(e) => { setUrlInput(e.target.value); setFetchSuccess(false); }}
                onKeyDown={handleKeyDown}
                className="flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                disabled={isFetching || isSubmitting}
                autoFocus
              />
              <button
                type="button"
                onClick={handleFetchFromLeetCode}
                disabled={isFetching || !urlInput.trim() || isSubmitting}
                className="rounded-xl bg-white border border-zinc-200 hover:bg-zinc-50 px-3.5 py-2 text-xs font-bold text-zinc-700 shadow-sm flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
              >
                {isFetching ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Fetching...
                  </>
                ) : fetchSuccess ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Re-fetch
                  </>
                ) : (
                  'Fetch Details'
                )}
              </button>
            </div>

            {fetchError && (
              <p className="text-[11px] text-red-500 font-bold leading-normal">
                ⚠️ {fetchError}
              </p>
            )}
          </div>

          <div className="h-px bg-zinc-100" />

          {/* Form Inputs */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-xl border border-red-500/10 bg-red-500/5 p-3.5 text-sm text-red-700 font-bold">
                {error}
              </div>
            )}

            {/* Title */}
            <div>
              <label htmlFor="problem-title" className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">
                Problem Title
              </label>
              <input
                type="text"
                id="problem-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 3Sum, Longest Palindromic Substring"
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">
                Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['Easy', 'Medium', 'Hard'] as const).map((level) => {
                  const isSelected = difficulty === level;
                  let cls = '';
                  if (level === 'Easy')   cls = isSelected ? 'bg-emerald-500/10 border-emerald-500 text-emerald-750 font-extrabold' : 'border-zinc-200 bg-white text-zinc-500 hover:border-emerald-500/30 hover:text-emerald-700 hover:bg-emerald-500/5';
                  if (level === 'Medium') cls = isSelected ? 'bg-amber-500/10 border-amber-500 text-amber-800 font-extrabold'       : 'border-zinc-200 bg-white text-zinc-500 hover:border-amber-500/30 hover:text-amber-750 hover:bg-amber-500/5';
                  if (level === 'Hard')   cls = isSelected ? 'bg-red-500/10 border-red-500 text-red-750 font-extrabold'             : 'border-zinc-200 bg-white text-zinc-500 hover:border-red-500/30 hover:text-red-700 hover:bg-red-500/5';
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setDifficulty(level)}
                      disabled={isSubmitting}
                      className={`flex items-center justify-center rounded-xl border py-2.5 text-xs uppercase tracking-wider font-bold transition-all duration-200 cursor-pointer ${cls}`}
                    >
                      {level}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Initial Language Picker */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2 flex items-center gap-1.5">
                <Code2 className="h-3.5 w-3.5 text-indigo-600" />
                Initial Code Language
                <span className="normal-case font-normal text-zinc-400 ml-1">— First tab in the editor</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const isSelected = selectedLanguage === lang.value;
                  return (
                    <button
                      key={lang.value}
                      type="button"
                      onClick={() => setSelectedLanguage(lang.value)}
                      disabled={isSubmitting}
                      className={`flex flex-col items-center gap-1 rounded-xl border py-2.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-500/10 border-indigo-500 text-indigo-700 shadow-sm shadow-indigo-500/10'
                          : 'border-zinc-200 bg-white text-zinc-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-500/5'
                      }`}
                    >
                      <span className="text-base leading-none">{lang.icon}</span>
                      {lang.label}
                    </button>
                  );
                })}
              </div>

              {/* Live code preview for selected language */}
              <div className="mt-3 rounded-xl border border-zinc-200 bg-zinc-950 overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800/80 bg-zinc-900">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    {SUPPORTED_LANGUAGES.find(l => l.value === selectedLanguage)?.icon}{' '}
                    {SUPPORTED_LANGUAGES.find(l => l.value === selectedLanguage)?.label} Starter Code
                  </span>
                  {Object.keys(codeSnippets).length > 0 && getCodeForLanguage(selectedLanguage, codeSnippets) !== (BOILERPLATE[selectedLanguage] || '') ? (
                    <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> From LeetCode
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Generic Template</span>
                  )}
                </div>
                <pre className="p-3 text-[11px] text-zinc-300 font-mono leading-relaxed overflow-x-auto max-h-[120px] whitespace-pre">
                  {getCodeForLanguage(selectedLanguage, codeSnippets)}
                </pre>
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="problem-desc" className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">
                Description / Notes <span className="normal-case font-normal text-zinc-400">(auto-filled if fetched)</span>
              </label>
              <textarea
                id="problem-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Paste the problem description or write down your initial analytical notes using markdown here..."
                rows={4}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors resize-y min-h-[100px]"
                disabled={isSubmitting}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-2.5 text-xs font-bold text-zinc-600 hover:bg-zinc-100 hover:text-zinc-800 transition-colors cursor-pointer"
                disabled={isSubmitting || isFetching}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/20 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                disabled={isSubmitting || isFetching}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Create Problem
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
