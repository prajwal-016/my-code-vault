import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Code2, Terminal } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LeetCode Solver Hub | Personal Solution Tracker",
  description: "A premium, dark-mode personal dashboard to track and optimize your LeetCode algorithm solutions with dual-pane code viewing and Monaco editor.",
  keywords: ["LeetCode", "Algorithm", "Coding", "Software Engineering", "Monaco Editor", "Solutions Tracker"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased light`}
    >
      <body className="min-h-full flex flex-col font-mono text-zinc-900 selection:bg-sky-500/20 selection:text-sky-900">
        <div className="scanlines" />
        <div className="cyber-mesh-bg" />
        <div className="cyber-glow -top-[200px] -right-[200px]" />
        
        {/* Header navigation bar */}
        <header className="sticky top-0 z-50 w-full border-b border-sky-500/10 bg-white/70 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link 
              href="/" 
              className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
              id="header-brand-logo"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-500 to-sky-500 text-white shadow-md shadow-sky-500/10">
                <Code2 className="h-5 w-5" />
              </div>
              <div>
                <span className="font-mono text-xs font-semibold tracking-widest text-sky-600 uppercase">LeetCode</span>
                <h1 className="text-sm font-bold tracking-tight text-zinc-900 sm:text-base -mt-1 font-mono">Solver Hub</h1>
              </div>
            </Link>

            <nav className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 text-[10px] font-bold text-emerald-600 tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 hud-blink" />
                SYS_ONLINE
              </div>
              <div className="hidden sm:block h-4 w-px bg-zinc-200" />
              <Link
                href="/"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-black"
              >
                <Terminal className="h-3.5 w-3.5" />
                Dashboard
              </Link>
              <div className="h-4 w-px bg-zinc-200" />
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="text-zinc-400 transition-colors hover:text-zinc-900"
              >
                <span className="sr-only">GitHub</span>
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
                </svg>
              </a>
            </nav>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}

