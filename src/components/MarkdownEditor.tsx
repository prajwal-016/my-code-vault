'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Eye, Edit3, Sparkles, BookOpen, Layers, ExternalLink } from 'lucide-react';

interface MarkdownEditorProps {
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  leetcodeSlug?: string | null;
  onChange: (val: string) => void;
}

export default function MarkdownEditor({ title, difficulty, description, leetcodeSlug, onChange }: MarkdownEditorProps) {
  const [isEditing, setIsEditing] = useState(false);

  let difficultyBadgeClass = '';
  if (difficulty === 'Easy') difficultyBadgeClass = 'bg-emerald-500/10 text-emerald-750 border-emerald-500/20 glow-easy font-extrabold';
  else if (difficulty === 'Medium') difficultyBadgeClass = 'bg-amber-500/10 text-amber-800 border-amber-500/20 glow-medium font-extrabold';
  else difficultyBadgeClass = 'bg-red-500/10 text-red-750 border-red-500/20 glow-hard font-extrabold';

  return (
    <div className="flex flex-col h-full rounded-2xl hud-panel overflow-hidden">
      {/* Title & Metadata Header */}
      <div className="p-6 border-b border-zinc-200 bg-zinc-50/50 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className={`rounded-xl border px-3 py-1 text-xs font-bold uppercase tracking-wider ${difficultyBadgeClass}`}>
              {difficulty}
            </span>
            <span className="text-xs font-mono text-zinc-600">LeetCode Workspace</span>
          </div>

          {/* Toggle View Mode */}
          <div className="flex items-center gap-1 bg-zinc-100 border border-zinc-200 p-0.5 rounded-xl shadow-inner">
            <button
              onClick={() => setIsEditing(false)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                !isEditing 
                  ? 'bg-white text-zinc-900 border border-zinc-200/50 shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              Preview
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                isEditing 
                  ? 'bg-white text-zinc-900 border border-zinc-200/50 shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <Edit3 className="h-3.5 w-3.5" />
              Edit Notes
            </button>
          </div>
        </div>

        <h2 className="text-xl font-extrabold text-zinc-900 tracking-tight leading-tight select-text">
          {title}
        </h2>
      </div>

      {/* Editor or Markdown preview */}
      <div className="flex-1 overflow-y-auto p-6 min-h-[300px]">
        {isEditing ? (
          <div className="h-full flex flex-col">
            <textarea
              value={description}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Write problem explanations, algorithmic designs, approach steps, or mathematical proofs using markdown..."
              className="w-full flex-1 min-h-[350px] md:min-h-full rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-800 placeholder-zinc-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-colors font-mono resize-none leading-relaxed"
            />
            <div className="flex items-center gap-1 text-[11px] text-zinc-600 mt-2 font-mono">
              <Sparkles className="h-3 w-3 text-indigo-600" />
              Supports GitHub Flavored Markdown (Tables, Lists, Bold, and Inline Code Blocks).
            </div>
          </div>
        ) : (
          <div className="prose max-w-none text-sm text-zinc-800 leading-relaxed space-y-4 select-text">
            {description ? (
              <>
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                components={{
                  // Enhance markdown components styles to fit a high-end visual standard
                  h1: ({ node, ...props }) => <h1 className="text-lg font-bold text-zinc-900 border-b border-zinc-200 pb-1 mt-4 mb-2" {...props} />,
                  h2: ({ node, ...props }) => <h2 className="text-base font-bold text-zinc-900 border-b border-zinc-200 pb-1 mt-4 mb-2" {...props} />,
                  h3: ({ node, ...props }) => <h3 className="text-sm font-bold text-zinc-900 mt-3 mb-1" {...props} />,
                  p: ({ node, ...props }) => <p className="mb-3 leading-relaxed text-zinc-800" {...props} />,
                  ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-3 space-y-1 text-zinc-800" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-3 space-y-1 text-zinc-800" {...props} />,
                  li: ({ node, ...props }) => <li className="text-zinc-800" {...props} />,
                  code: ({ node, ...props }) => {
                    return (
                      <code className="bg-zinc-150 border border-zinc-200/80 rounded px-1.5 py-0.5 text-xs text-sky-700 font-mono" {...props} />
                    );
                  },
                  pre: ({ node, ...props }) => (
                    <pre className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 overflow-x-auto font-mono text-xs text-zinc-800 my-4 shadow-inner" {...props} />
                  ),
                  table: ({ node, ...props }) => (
                    <div className="overflow-x-auto my-4 rounded-xl border border-zinc-200 bg-white">
                      <table className="w-full text-left text-xs border-collapse" {...props} />
                    </div>
                  ),
                  thead: ({ node, ...props }) => <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-700 font-semibold" {...props} />,
                  th: ({ node, ...props }) => <th className="px-4 py-2" {...props} />,
                  td: ({ node, ...props }) => <td className="px-4 py-2 border-t border-zinc-100 text-zinc-800" {...props} />,
                  strong: ({ node, ...props }) => <strong className="font-extrabold text-zinc-900" {...props} />,
                  blockquote: ({ node, ...props }) => (
                    <blockquote className="border-l-4 border-indigo-400 bg-zinc-50/80 px-4 py-3 rounded-r-xl my-4 text-zinc-700 shadow-sm" {...props} />
                  ),
                }}
              >
                {description.replace(/^(?: {4}|\t)/gm, '> ')}
              </ReactMarkdown>
              
              {leetcodeSlug && (
                <div className="mt-8 pt-6 border-t border-zinc-200/60">
                  <a
                    href={`https://leetcode.com/problems/${leetcodeSlug}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-zinc-800 transition-colors"
                  >
                    View Original Problem on LeetCode
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center text-zinc-750 border border-dashed border-zinc-300 rounded-2xl bg-zinc-50/50 shadow-inner">
                <BookOpen className="h-8 w-8 mb-3 text-zinc-500" />
                <p className="text-xs font-extrabold uppercase tracking-widest text-zinc-800">Algorithmic Document Is Empty</p>
                <p className="text-xs text-zinc-600 max-w-[240px] mt-1.5 leading-relaxed">Switch to edit mode above to log your mathematical proofs or details!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
