'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Problem, NewProblemPayload } from '@/lib/types';
import AddProblemModal from '@/components/AddProblemModal';
import { 
  Plus, 
  Search, 
  BookOpen, 
  Flame, 
  TrendingUp, 
  Award, 
  ChevronRight, 
  Calendar,
  Layers,
  Sparkles,
  Loader2,
  Trash2
} from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch problems on mount
  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('problems')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProblems(data || []);
    } catch (err: any) {
      console.error('Error fetching problems:', err);
      setErrorMessage(err?.message || 'Could not fetch problems from Supabase.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProblem = async (newProblem: NewProblemPayload) => {
    try {
      // 1. Insert the problem record
      const { data, error } = await supabase
        .from('problems')
        .insert([{
          title: newProblem.title,
          difficulty: newProblem.difficulty,
          description: newProblem.description,
          leetcode_slug: newProblem.leetcode_slug || null,
        }])
        .select()
        .single();

      if (error) {
        throw new Error(error.message || 'Database insert failed.');
      }

      if (data) {
        // 2. Auto-create the first code solution tab if language was chosen
        if (newProblem.initialLanguage && newProblem.initialCode) {
          const { error: solError } = await supabase
            .from('code_solutions')
            .insert([{
              problem_id: data.id,
              title: `${newProblem.initialLanguage.charAt(0).toUpperCase() + newProblem.initialLanguage.slice(1)} Solution`,
              language: newProblem.initialLanguage,
              code: newProblem.initialCode,
            }]);

          if (solError) {
            console.error('Warning: Could not create initial code tab:', solError.message);
            // Non-fatal — still navigate to problem
          }
        }

        setProblems((prev) => [data, ...prev]);
        router.push(`/problem/${data.id}`);
      }
    } catch (err: any) {
      console.error('Error creating problem:', err);
      throw err; // propagates to the modal form error handler
    }
  };

  const handleDeleteProblem = async (e: React.MouseEvent, id: number, title: string) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to permanently delete "${title}" and all its solutions?`)) return;
    
    try {
      const { error } = await supabase.from('problems').delete().eq('id', id);
      if (error) throw error;
      setProblems(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      console.error('Delete failed:', err);
      alert('Failed to delete problem: ' + err?.message);
    }
  };

  // Filter problems based on search term and difficulty
  const filteredProblems = problems.filter((problem) => {
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          problem.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'All' || problem.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  // Calculate statistics
  const totalCount = problems.length;
  const easyCount = problems.filter(p => p.difficulty === 'Easy').length;
  const mediumCount = problems.filter(p => p.difficulty === 'Medium').length;
  const hardCount = problems.filter(p => p.difficulty === 'Hard').length;

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 flex-1 flex flex-col">
      {/* Hero Welcome banner */}
      <section className="relative overflow-hidden rounded-3xl hud-panel px-6 py-8 sm:px-12 sm:py-10 shadow-2xl">
        <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -left-24 -bottom-24 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />
        
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/15">
              <Sparkles className="h-3 w-3" />
              Developer Workspace
            </div>
            <h2 className="text-2xl font-black tracking-tight text-zinc-900 sm:text-3xl glitch-text" data-text="LeetCode Solution Matrix">LeetCode Solution Matrix</h2>
            <p className="max-w-xl text-sm text-zinc-400">
              Analyze algorithms, document complexities, and construct beautiful multi-language implementations.
            </p>
          </div>
          <div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 active:scale-98 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Add New Problem
            </button>
          </div>
        </div>
      </section>

      {/* Stats Counter Row */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4" aria-label="LeetCode statistics">
        <div className="rounded-2xl hud-panel p-5 transition-all hover:border-cyan-500/30 hover:scale-[1.02]">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Total Saved</span>
            <BookOpen className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-extrabold text-zinc-900">{totalCount}</p>
        </div>

        <div className="rounded-2xl hud-panel p-5 transition-all hover:border-cyan-500/30 hover:scale-[1.02]">
          <div className="flex items-center justify-between text-zinc-650 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Easy Solved</span>
            <Flame className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600">{easyCount}</p>
        </div>

        <div className="rounded-2xl hud-panel p-5 transition-all hover:border-cyan-500/30 hover:scale-[1.02]">
          <div className="flex items-center justify-between text-zinc-650 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Medium Solved</span>
            <TrendingUp className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-amber-600">{mediumCount}</p>
        </div>

        <div className="rounded-2xl hud-panel p-5 transition-all hover:border-cyan-500/30 hover:scale-[1.02]">
          <div className="flex items-center justify-between text-zinc-650 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Hard Solved</span>
            <Award className="h-4 w-4 text-red-650" />
          </div>
          <p className="text-2xl font-extrabold text-red-650">{hardCount}</p>
        </div>
      </section>

      {/* Filter and Search Section */}
      <section className="flex flex-col sm:flex-row items-center gap-4 hud-panel p-4 rounded-2xl" aria-label="Search and filter problems">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search problems by title, description or code content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto py-1">
          {(['All', 'Easy', 'Medium', 'Hard'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setDifficultyFilter(filter)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap ${
                difficultyFilter === filter
                  ? 'bg-indigo-500 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                  : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      {/* Database Error Warnings */}
      {errorMessage && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5 text-sm text-amber-400 space-y-2">
          <p className="font-semibold text-base text-amber-200">Supabase Connection Notice</p>
          <p>{errorMessage}</p>
          <p className="text-xs text-zinc-400 pt-1">
            Note: If you have not created your tables yet, execute the database migration script in your Supabase SQL editor.
          </p>
        </div>
      )}

      {/* Main problems Grid List */}
      <section className="flex-1 flex flex-col justify-start" aria-label="LeetCode problems list">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
            <p className="text-zinc-400 text-sm font-medium">Synchronizing problem matrix...</p>
          </div>
        ) : filteredProblems.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-300 py-20 text-center bg-zinc-50/50 shadow-inner space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-zinc-200 text-zinc-500 shadow-sm">
              <Layers className="h-6 w-6 text-indigo-650" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-zinc-900">No problems tracked yet</h3>
              <p className="text-sm text-zinc-650 max-w-sm mx-auto leading-relaxed">
                {searchTerm || difficultyFilter !== 'All' 
                  ? 'No results match your search query or filters. Clear the search and try again!'
                  : 'Get started by creating your very first tracked LeetCode challenge right now!'}
              </p>
            </div>
            {!searchTerm && difficultyFilter === 'All' && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-50 px-4.5 py-2.5 text-xs font-bold text-zinc-700 transition-colors shadow-sm cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Add First Problem
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Desktop Table Header - Only visible on md and above */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-200/50">
              <div className="md:col-span-5 lg:col-span-6">Problem</div>
              <div className="md:col-span-2">Difficulty</div>
              <div className="md:col-span-3 lg:col-span-2">Date Added</div>
              <div className="md:col-span-2 text-right">Action</div>
            </div>
            {filteredProblems.map((problem) => {
              const dateText = formatDate(problem.created_at);
              let difficultyClass = '';
              let glowClass = '';
              
              if (problem.difficulty === 'Easy') {
                difficultyClass = 'bg-emerald-50 text-emerald-700 border-emerald-200/60 font-bold';
                glowClass = 'glow-card-easy';
              } else if (problem.difficulty === 'Medium') {
                difficultyClass = 'bg-amber-50 text-amber-800 border-amber-200/60 font-bold';
                glowClass = 'glow-card-medium';
              } else {
                difficultyClass = 'bg-red-50 text-red-750 border-red-200/60 font-bold';
                glowClass = 'glow-card-hard';
              }

              return (
                <article
                  key={problem.id}
                  onClick={() => router.push(`/problem/${problem.id}`)}
                  className={`group relative flex flex-col overflow-hidden rounded-2xl md:rounded-xl hud-panel hud-panel-hover p-5 md:py-4 md:px-6 cursor-pointer select-none ${glowClass} md:grid md:grid-cols-12 md:gap-4 md:items-center`}
                >
                  {/* Mobile Top Line (Hidden on desktop) */}
                  <div className="flex items-center justify-between md:hidden mb-3">
                    <span className={`rounded-lg border px-2.5 py-0.5 text-xs font-semibold ${difficultyClass}`}>
                      {problem.difficulty}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-zinc-500">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{dateText}</span>
                    </div>
                  </div>

                  {/* Title & snippet */}
                  <div className="space-y-1.5 md:col-span-5 lg:col-span-6 flex flex-col justify-center">
                    <h3 className="text-base font-bold text-zinc-900 group-hover:text-sky-600 transition-colors leading-tight">
                      {problem.title}
                    </h3>
                    <p className="line-clamp-2 md:line-clamp-1 text-xs text-zinc-600 leading-relaxed font-sans pr-4">
                      {problem.description || 'No explanation or algorithm notes written yet.'}
                    </p>
                  </div>

                  {/* Desktop Columns for Difficulty & Date */}
                  <div className="hidden md:flex md:col-span-2 items-center">
                    <span className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${difficultyClass}`}>
                      {problem.difficulty}
                    </span>
                  </div>
                  <div className="hidden md:flex md:col-span-3 lg:col-span-2 items-center text-xs text-zinc-500 gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{dateText}</span>
                  </div>

                  {/* Bottom link button */}
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-zinc-100 md:col-span-2 md:border-t-0 md:pt-0 md:mt-0 md:justify-end gap-2">
                    <span className="text-xs font-mono text-zinc-500 md:hidden">Workspace Active</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleDeleteProblem(e, problem.id, problem.title)}
                        className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Problem"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <div className="flex items-center gap-1 text-xs font-semibold text-indigo-500 group-hover:text-indigo-600 transition-colors bg-indigo-50/50 md:bg-transparent px-3 py-1.5 md:px-0 md:py-0 rounded-lg">
                        Open Lab
                        <ChevronRight className="h-3.5 w-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Modal Dialog container */}
      <AddProblemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddProblem}
      />
    </div>
  );
}

