'use client';

import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Plus, Terminal, Trash2, Code2, Play, Save, ChevronDown, Check, Keyboard, Undo, Redo, MoreVertical, Copy, Clipboard, Scissors, FilePlus, Paintbrush, Sun, Moon } from 'lucide-react';
import { CodeSolution } from '@/lib/types';
import { configureMonacoIDE, registerCustomFormatAction } from '@/lib/editorUtils';

interface MultiCodeViewerProps {
  solutions: CodeSolution[];
  activeSolutionId: string | null;
  onSelectSolution: (id: string) => void;
  onAddSolution: (title: string, language: string) => Promise<void>;
  onDeleteSolution: (id: string) => Promise<void>;
  onChangeCode: (id: string, newCode: string) => void;
  onSaveWorkspace: () => Promise<void>;
  isSaving: boolean;
}

const SUPPORTED_LANGUAGES = [
  { value: 'python', label: 'Python' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'java', label: 'Java' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'rust', label: 'Rust' },
  { value: 'go', label: 'Go' },
];

export default function MultiCodeViewer({
  solutions,
  activeSolutionId,
  onSelectSolution,
  onAddSolution,
  onDeleteSolution,
  onChangeCode,
  onSaveWorkspace,
  isSaving,
}: MultiCodeViewerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newLanguage, setNewLanguage] = useState('python');
  const [isAdding, setIsAdding] = useState(false);
  const [titleError, setTitleError] = useState(false);
  const [editorRef, setEditorRef] = useState<any>(null);
  const [showTools, setShowTools] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [editorTheme, setEditorTheme] = useState<'vs-dark' | 'vs-light'>('vs-dark');

  const activeSolution = solutions.find((s) => s.id === activeSolutionId);
  const isDark = editorTheme === 'vs-dark';

  const insertTextAtCursor = (text: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!editorRef) return;
    const selection = editorRef.getSelection();
    const id = { major: 1, minor: 1 };
    const op = {
      identifier: id,
      range: selection,
      text: text,
      forceMoveMarkers: true,
    };
    editorRef.executeEdits("mobile-helper", [op]);

    // Adjust cursor position if inserting paired characters or function calls
    if (['{}', '[]', '()', '<>', '""', "''", 'print()', 'System.out.println()', 'console.log()'].includes(text)) {
      const position = editorRef.getPosition();
      if (position) {
        editorRef.setPosition({ lineNumber: position.lineNumber, column: position.column - 1 });
      }
    }

    editorRef.focus();
  };

  const handleUndo = () => {
    if (editorRef) {
      editorRef.trigger('keyboard', 'undo', null);
      editorRef.focus();
    }
  };

  const handleRedo = () => {
    if (editorRef) {
      editorRef.trigger('keyboard', 'redo', null);
      editorRef.focus();
    }
  };

  const handleAction = async (action: string) => {
    setShowDropdown(false);
    if (!editorRef && action !== 'new_tab' && action !== 'delete' && action !== 'save' && action !== 'tools') return;

    switch (action) {
      case 'new_tab':
        setIsAdding(true);
        break;
      case 'copy':
        editorRef.trigger('keyboard', 'editor.action.clipboardCopyAction', null);
        editorRef.focus();
        break;
      case 'paste':
        editorRef.trigger('keyboard', 'editor.action.clipboardPasteAction', null);
        editorRef.focus();
        break;
      case 'cut':
        editorRef.trigger('keyboard', 'editor.action.clipboardCutAction', null);
        editorRef.focus();
        break;
      case 'save':
        onSaveWorkspace();
        break;
      case 'format':
        editorRef.trigger('keyboard', 'editor.action.formatDocument', null);
        editorRef.focus();
        setShowTools(false);
        break;
      case 'tools':
        setShowTools(!showTools);
        break;
      case 'delete':
        if (activeSolution && confirm(`Are you sure you want to delete "${activeSolution.title}"?`)) {
          await onDeleteSolution(activeSolution.id);
        }
        break;
    }
  };

  const getHelperButtons = (language: string) => {
    const lang = language?.toLowerCase() || '';
    
    const coreSymbols = [
      { label: 'Tab', value: '    ' },
      { label: '{ }', value: '{}' },
      { label: '[ ]', value: '[]' },
      { label: '( )', value: '()' },
      { label: '< >', value: '<>' },
      { label: '=', value: '=' },
      { label: ':', value: ':' },
      { label: ';', value: ';' },
      { label: '.', value: '.' },
      { label: ',', value: ',' },
      { label: '"', value: '""' },
      { label: "'", value: "''" },
      { label: '!', value: '!' },
      { label: '_', value: '_' },
    ];

    let keywords = [
      { label: 'if', value: 'if ' },
      { label: 'for', value: 'for ' },
      { label: 'print', value: 'print()' },
    ];

    if (lang === 'java') {
      keywords = [
        { label: 'if', value: 'if ' },
        { label: 'for', value: 'for ' },
        { label: 'while', value: 'while ' },
        { label: 'public', value: 'public ' },
        { label: 'private', value: 'private ' },
        { label: 'class', value: 'class ' },
        { label: 'static', value: 'static ' },
        { label: 'void', value: 'void ' },
        { label: 'int', value: 'int ' },
        { label: 'String', value: 'String ' },
        { label: 'new', value: 'new ' },
        { label: 'return', value: 'return ' },
        { label: 'System.out', value: 'System.out.println()' },
      ];
    } else if (lang === 'python') {
      keywords = [
        { label: 'if', value: 'if ' },
        { label: 'for', value: 'for ' },
        { label: 'def', value: 'def ' },
        { label: 'class', value: 'class ' },
        { label: 'self', value: 'self' },
        { label: 'return', value: 'return ' },
        { label: 'print', value: 'print()' },
      ];
    } else if (lang === 'javascript' || lang === 'typescript') {
      keywords = [
        { label: 'if', value: 'if ' },
        { label: 'for', value: 'for ' },
        { label: 'const', value: 'const ' },
        { label: 'function', value: 'function ' },
        { label: 'return', value: 'return ' },
        { label: 'console', value: 'console.log()' },
      ];
    }

    return [...coreSymbols, ...keywords];
  };

  // Map user-entered languages to Monaco Editor standard syntax tokens
  const getMonacoLanguage = (lang: string) => {
    const l = lang.toLowerCase();
    if (l === 'c++' || l === 'cpp') return 'cpp';
    return l;
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setTitleError(true);
      return;
    }
    setTitleError(false);
    setIsAdding(true);
    try {
      await onAddSolution(newTitle.trim(), newLanguage);
      setNewTitle('');
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };


  return (
    <div className="flex flex-col h-full rounded-2xl hud-panel overflow-hidden min-h-[500px]">
      {/* Dynamic Tab Bar Header */}
      <div className="border-b border-zinc-800/80 bg-zinc-900/10 flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-3">
        {/* Solutions Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
          {solutions.map((sol) => {
            const isActive = sol.id === activeSolutionId;
            return (
              <button
                key={sol.id}
                onClick={() => onSelectSolution(sol.id)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap select-none ${
                  isActive
                    ? 'bg-white border-sky-500/20 text-sky-600 font-bold shadow-sm'
                    : 'bg-zinc-100/50 border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:text-zinc-800'
                }`}
              >
                <Code2 className="h-3.5 w-3.5 text-indigo-400" />
                <span>{sol.title}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-zinc-950 text-zinc-200 uppercase font-bold">
                  {sol.language}
                </span>
              </button>
            );
          })}

          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 rounded-xl border border-dashed border-zinc-300 hover:border-zinc-400 hover:bg-zinc-100/60 px-3.5 py-2 text-xs font-bold text-indigo-600 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Plus className="h-3.5 w-3.5" />
            New Tab
          </button>
        </div>

        {/* Global Save Button */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center mt-2 sm:mt-0 w-full sm:w-auto justify-end">
          <button
            onClick={() => setEditorTheme(prev => prev === 'vs-dark' ? 'vs-light' : 'vs-dark')}
            className={`flex items-center justify-center p-2 rounded-xl border transition-colors cursor-pointer ${
              isDark 
                ? 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-amber-400 hover:bg-zinc-700' 
                : 'border-zinc-200 bg-white text-zinc-500 hover:text-indigo-600 hover:bg-zinc-50'
            }`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={onSaveWorkspace}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 px-4.5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/10 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                Save Solution
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor & Overlay Form Panel */}
      <div className="flex-1 relative flex flex-col min-h-[400px]">
        {/* Tab Creation Overlaid Form Panel */}
        {showAddForm && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white/95 p-6 shadow-2xl space-y-4 backdrop-blur-md">
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-1.5 border-b border-zinc-100 pb-2">
                <Terminal className="h-4 w-4 text-indigo-600" />
                Create New Solution Approach
              </h3>

              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label htmlFor="tab-title" className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Approach Title
                  </label>
                  <input
                    type="text"
                    id="tab-title"
                    value={newTitle}
                    onChange={(e) => { setNewTitle(e.target.value); if (e.target.value.trim()) setTitleError(false); }}
                    placeholder="e.g. Optimized Hashmap, Brute Force"
                    className={`w-full rounded-xl border px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 transition-colors bg-white ${
                      titleError
                        ? 'border-red-400 focus:border-red-500 focus:ring-red-400'
                        : 'border-zinc-200 focus:border-indigo-500 focus:ring-indigo-500'
                    }`}
                    disabled={isAdding}
                    autoFocus
                  />
                  {titleError && (
                    <p className="mt-1.5 text-[11px] font-semibold text-red-500 flex items-center gap-1">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
                      Approach title is required
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="tab-lang" className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Language Syntax
                  </label>
                  <div className="relative">
                    <select
                      id="tab-lang"
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none transition-colors"
                      disabled={isAdding}
                    >
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <option key={lang.value} value={lang.value}>
                          {lang.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 cursor-pointer"
                    disabled={isAdding}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-indigo-500 hover:bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow transition-all cursor-pointer"
                    disabled={isAdding}
                  >
                    {isAdding ? 'Adding...' : 'Add Approach'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Monaco Editor Buffer */}
        {activeSolution ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Tab subheader meta with delete option */}
            <div className="px-4 py-2 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-zinc-500">
                <Play className="h-3 w-3 text-emerald-500" />
                <span>Editing: </span>
                <span className="font-bold text-zinc-900 font-mono">{activeSolution.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center border-r border-zinc-200 pr-2 mr-1 gap-1">
                  <button
                    onClick={handleUndo}
                    className="flex items-center justify-center rounded p-1.5 text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors cursor-pointer"
                    title="Undo (Ctrl+Z)"
                  >
                    <Undo className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={handleRedo}
                    className="flex items-center justify-center rounded p-1.5 text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors cursor-pointer"
                    title="Redo (Ctrl+Y)"
                  >
                    <Redo className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center justify-center rounded p-1.5 text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors cursor-pointer"
                    title="More Options"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  {showDropdown && (
                    <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-zinc-200 bg-white shadow-xl z-50 overflow-hidden py-1">
                      <button onClick={() => handleAction('new_tab')} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 hover:text-indigo-600 text-left">
                        <FilePlus className="h-3.5 w-3.5" /> New Tab
                      </button>
                      <button onClick={() => handleAction('copy')} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 hover:text-indigo-600 text-left">
                        <Copy className="h-3.5 w-3.5" /> Copy
                      </button>
                      <button onClick={() => handleAction('cut')} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 hover:text-indigo-600 text-left">
                        <Scissors className="h-3.5 w-3.5" /> Cut
                      </button>
                      <button onClick={() => handleAction('paste')} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 hover:text-indigo-600 text-left border-b border-zinc-100">
                        <Clipboard className="h-3.5 w-3.5" /> Paste
                      </button>
                      <button onClick={() => handleAction('format')} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 hover:text-indigo-600 text-left">
                        <Paintbrush className="h-3.5 w-3.5" /> Format Code
                      </button>
                      <button onClick={() => handleAction('tools')} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 hover:text-indigo-600 text-left border-b border-zinc-100">
                        <Keyboard className="h-3.5 w-3.5" /> Toggle Tools
                      </button>
                      <button onClick={() => handleAction('save')} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 hover:text-emerald-600 text-left">
                        <Save className="h-3.5 w-3.5" /> Save Workspace
                      </button>
                      <button onClick={() => handleAction('delete')} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 text-left">
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Keyboard Accessory Toolbar */}
            {showTools && (
              <div className={`flex overflow-x-auto whitespace-nowrap snap-x px-2 py-1.5 border-b gap-1.5 style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} ${
                isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-100 border-zinc-200'
              }`}>
                <style dangerouslySetInnerHTML={{__html: `
                  .scrollbar-none::-webkit-scrollbar { display: none; }
                `}} />
                {activeSolution && getHelperButtons(activeSolution.language).map((btn, idx) => (
                  <button
                    key={idx}
                    onMouseDown={(e) => insertTextAtCursor(btn.value, e)}
                    onClick={(e) => e.preventDefault()}
                    className={`px-3.5 py-1.5 border rounded font-mono text-sm active:scale-95 transition-all inline-block select-none flex-shrink-0 snap-start cursor-pointer ${
                      isDark 
                        ? 'bg-zinc-900 border-zinc-800 text-zinc-200 hover:bg-zinc-800 active:bg-zinc-800' 
                        : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 active:bg-zinc-100 shadow-sm'
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            )}

            {/* Monaco wrapper */}
            <div className={`flex-1 h-[50vh] md:h-full min-h-[350px] ${isDark ? 'bg-[#1e1e1e]' : 'bg-[#fffffe]'}`}>
              <Editor
                height="100%"
                language={getMonacoLanguage(activeSolution.language)}
                theme={editorTheme}
                value={activeSolution.code || ''}
                onChange={(val) => onChangeCode(activeSolution.id, val || '')}
                beforeMount={(monaco) => {
                  configureMonacoIDE(monaco);
                }}
                onMount={(editor, monaco) => {
                  setEditorRef(editor);
                  registerCustomFormatAction(editor, monaco);
                }}
                loading={
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-zinc-400 bg-zinc-50">
                    <svg className="animate-spin h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Launching Monaco Kernel...</span>
                  </div>
                }
                options={{
                  fontFamily: 'var(--font-geist-mono), Courier New, monospace',
                  fontSize: 13,
                  lineHeight: 20,
                  minimap: { enabled: false },
                  wordWrap: 'on',
                  scrollbar: {
                    verticalScrollbarSize: 8,
                    horizontalScrollbarSize: 8,
                  },
                  padding: { top: 12 },
                  automaticLayout: true,
                  cursorBlinking: 'smooth',
                  cursorSmoothCaretAnimation: 'on',
                  tabSize: 4,
                }}
              />
            </div>

            </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-500 border border-dashed border-zinc-200 rounded-b-2xl py-24 bg-zinc-50/50">
            <Code2 className="h-10 w-10 text-zinc-400 mb-2.5" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700">No Code Approach Tabs Active</h4>
            <p className="text-xs text-zinc-500 max-w-[240px] mt-1.5 leading-relaxed">
              Create an approach (e.g. Python DFS, C++ Brute Force) by clicking "+ New Tab" above.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-4 rounded-xl bg-sky-600 hover:bg-sky-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors cursor-pointer"
            >
              Add First Approach
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
