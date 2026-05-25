'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Problem, CodeSolution } from '@/lib/types';
import MarkdownEditor from '@/components/MarkdownEditor';
import MultiCodeViewer from '@/components/MultiCodeViewer';
import { ChevronLeft, Loader2, RefreshCw, AlertCircle, Home } from 'lucide-react';
import Link from 'next/link';

interface ProblemPageProps {
  params: Promise<{ id: string }>;
}

const BOILERPLATE_TEMPLATES: Record<string, string> = {
  python: `class Solution:\n    def solve(self, nums: List[int]) -> int:\n        # Write your Python Optimized solution here\n        pass`,
  cpp: `class Solution {\npublic:\n    int solve(vector<int>& nums) {\n        // Write your C++ high-performance algorithm here\n        return 0;\n    }\n};`,
  c: `int solve(int* nums, int numsSize) {\n    // Write your C solution here\n    return 0;\n}`,
  java: `class Solution {\n    public int solve(int[] nums) {\n        // Write your Java implementation here\n        return 0;\n    }\n}`,
  javascript: `/**\n * @param {number[]} nums\n * @return {number}\n */\nvar solve = function(nums) {\n    // Write your JavaScript brute force here\n    return 0;\n};`,
  typescript: `function solve(nums: number[]): number {\n    // Write your TypeScript type-safe solution here\n    return 0;\n}`,
  rust: `impl Solution {\n    pub fn solve(nums: Vec<i32>) -> i32 {\n        // Write your Rust optimized implementation here\n        0\n    }\n}`,
  go: `func solve(nums []int) int {\n    // Write your Go approach here\n    return 0;\n}`,
};

export default function ProblemDetail({ params }: ProblemPageProps) {
  // Resolve params using React.use for Next.js 15 compatibility
  const resolvedParams = use(params);
  const problemId = resolvedParams.id;

  const router = useRouter();
  
  const [problem, setProblem] = useState<Problem | null>(null);
  const [solutions, setSolutions] = useState<CodeSolution[]>([]);
  const [activeSolutionId, setActiveSolutionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    fetchProblemDetails();
  }, [problemId]);

  const fetchProblemDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch problem metadata
      const { data: problemData, error: problemError } = await supabase
        .from('problems')
        .select('*')
        .eq('id', problemId)
        .single();

      if (problemError) throw problemError;
      if (!problemData) throw new Error('Problem not found');

      setProblem(problemData);

      // 2. Fetch code solutions for this problem
      const { data: solutionsData, error: solutionsError } = await supabase
        .from('code_solutions')
        .select('*')
        .eq('problem_id', problemId)
        .order('created_at', { ascending: true });

      if (solutionsError) throw solutionsError;

      const items = solutionsData || [];
      setSolutions(items);
      
      // Default active tab to first solution if present
      if (items.length > 0) {
        setActiveSolutionId(items[0].id);
      }
    } catch (err: any) {
      console.error('Error fetching details:', err);
      setError(err?.message || 'Failed to fetch workspace items. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Callback to track description notes change locally
  const handleDescriptionChange = (newVal: string) => {
    if (!problem) return;
    setProblem({
      ...problem,
      description: newVal,
    });
  };

  // Callback to edit active code block buffer locally
  const handleCodeChange = (id: string, newCode: string) => {
    setSolutions((prev) =>
      prev.map((sol) => (sol.id === id ? { ...sol, code: newCode } : sol))
    );
  };

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

  // Add a new approach tab
  const handleAddSolution = async (tabTitle: string, language: string) => {
    try {
      let code = BOILERPLATE_TEMPLATES[language.toLowerCase()] || '// Write your solution here';

      // Derive a candidate slug from the problem title if not stored
      // e.g., "Palindrome Number" -> "palindrome-number"
      const deriveSlug = (t: string) =>
        t.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

      const slugToTry = problem?.leetcode_slug || (problem?.title ? deriveSlug(problem.title) : null);

      if (slugToTry) {
        try {
          const res = await fetch('/api/leetcode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ titleSlug: slugToTry }),
          });
          if (res.ok) {
            const data = await res.json();
            const snippets: Record<string, string> = data.codeSnippets || {};
            // Find the best matching snippet for this language
            const slugs = LANG_SLUG_MAP[language.toLowerCase()] || [language.toLowerCase()];
            for (const slug of slugs) {
              if (snippets[slug]) {
                code = snippets[slug];
                break;
              }
            }

            // If leetcode_slug wasn't stored yet, save it now for future tabs
            if (!problem?.leetcode_slug && data.titleSlug && problem) {
              await supabase
                .from('problems')
                .update({ leetcode_slug: data.titleSlug })
                .eq('id', problemId);
              // Update local state so subsequent tabs also benefit
              setProblem((prev) => prev ? { ...prev, leetcode_slug: data.titleSlug } : prev);
            }
          }
        } catch (fetchErr) {
          console.warn('Could not fetch LeetCode snippet, using boilerplate:', fetchErr);
          // Non-fatal – fall back to boilerplate already set
        }
      }

      const newPayload = {
        problem_id: problemId,
        title: tabTitle,
        language,
        code,
      };

      const { data, error: insertError } = await supabase
        .from('code_solutions')
        .insert([newPayload])
        .select()
        .single();

      if (insertError) throw insertError;

      if (data) {
        setSolutions((prev) => [...prev, data]);
        setActiveSolutionId(data.id);
      }
    } catch (err: any) {
      console.error('Error adding solution approach:', err);
      alert(`Could not create approach: ${err?.message || 'Database error'}`);
      throw err;
    }
  };

  // Delete an approach tab
  const handleDeleteSolution = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('code_solutions')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Filter local state
      const updated = solutions.filter((sol) => sol.id !== id);
      setSolutions(updated);

      // Reselect active tab
      if (activeSolutionId === id) {
        setActiveSolutionId(updated.length > 0 ? updated[0].id : null);
      }
    } catch (err: any) {
      console.error('Error deleting solution:', err);
      alert(`Delete failed: ${err?.message || 'Database error'}`);
    }
  };

  // Save the entire workspace: description + all code solutions
  const handleSaveWorkspace = async () => {
    if (!problem) return;
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      // 1. Update problem description notes
      const { error: descError } = await supabase
        .from('problems')
        .update({ description: problem.description })
        .eq('id', problemId);

      if (descError) throw descError;

      // 2. Update code blocks
      // We can update in parallel for all loaded code blocks
      const updatePromises = solutions.map((sol) =>
        supabase
          .from('code_solutions')
          .update({ code: sol.code, title: sol.title, language: sol.language })
          .eq('id', sol.id)
      );

      const results = await Promise.all(updatePromises);
      const failed = results.find((r) => r.error);
      if (failed) throw failed.error;

      // Flash success
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (err: any) {
      console.error('Save failed:', err);
      setSaveStatus('error');
      alert(`Failed to save algorithm workspace: ${err?.message || 'Server error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-32 gap-3 bg-transparent">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
        <p className="text-zinc-400 text-sm font-medium">Mounting algorithmic IDE environment...</p>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-transparent">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-red-50/60 p-8 text-center space-y-5 shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertCircle className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-extrabold text-red-800">Algorithm Lab Load Failure</h3>
            <p className="text-sm text-red-700 leading-relaxed font-semibold">
              {error || 'The requested LeetCode problem cannot be mapped or does not exist.'}
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={fetchProblemDetails}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-250 bg-white hover:bg-zinc-50 px-4.5 py-2.5 text-xs font-bold text-zinc-700 transition-colors shadow-sm cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry Load
            </button>
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-xl bg-indigo-650 hover:bg-indigo-700 px-4.5 py-2.5 text-xs font-bold text-white shadow-sm transition-colors"
            >
              <Home className="h-3.5 w-3.5" />
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col w-full bg-transparent">
      {/* Subheader page nav */}
      <div className="border-b border-zinc-200/50 bg-transparent px-4 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <Link
            href="/"
            className="group flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-black transition-colors"
          >
            <ChevronLeft className="h-4 w-4 transform group-hover:-translate-x-0.5 transition-transform" />
            Workspace Matrix
          </Link>

          {/* Quick status toast */}
          {saveStatus === 'success' && (
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 bg-emerald-500/5 border border-emerald-500/10 px-3 py-1 rounded-xl animate-fade-in shadow-inner">
              ✓ Workspace Saved Securely
            </span>
          )}
        </div>
      </div>

      {/* Primary Split Pane Lab Grid */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 md:gap-6 min-h-0">
        {/* Left Side: Markdown Notes */}
        <section className="md:col-span-1 lg:col-span-5 flex flex-col h-full" aria-label="Problem Description & notes">
          <MarkdownEditor
            title={problem.title}
            difficulty={problem.difficulty}
            description={problem.description || ''}
            leetcodeSlug={problem.leetcode_slug}
            onChange={handleDescriptionChange}
          />
        </section>

        {/* Right Side: Monaco tabbed viewer */}
        <section className="md:col-span-1 lg:col-span-7 flex flex-col h-full" aria-label="Code Solution Editor">
          <MultiCodeViewer
            solutions={solutions}
            activeSolutionId={activeSolutionId}
            onSelectSolution={setActiveSolutionId}
            onAddSolution={handleAddSolution}
            onDeleteSolution={handleDeleteSolution}
            onChangeCode={handleCodeChange}
            onSaveWorkspace={handleSaveWorkspace}
            isSaving={isSaving}
          />
        </section>
      </div>
    </div>
  );
}
