import React from 'react';
import { TabMode, StudentStats } from '../types';
import {
  Compass,
  Ruler,
  Droplet,
  FlaskConical,
  Trophy,
  BookOpen,
  Bot,
  Flame,
  Award,
  FileText,
} from 'lucide-react';

interface NavbarProps {
  activeTab: TabMode;
  onSelectTab: (tab: TabMode) => void;
  onOpenCheatSheet: () => void;
  onOpenAITutor: () => void;
  stats: StudentStats;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenCheatSheet,
  onOpenAITutor,
  stats,
}) => {
  const tabs: { id: TabMode; label: string; icon: React.ReactNode }[] = [
    { id: 'investigation', label: 'Guided Discovery', icon: <Compass className="w-4 h-4" /> },
    { id: 'rulers', label: 'Ruler Station', icon: <Ruler className="w-4 h-4" /> },
    { id: 'cylinders', label: 'Graduated Cylinders', icon: <Droplet className="w-4 h-4" /> },
    { id: 'beakers', label: 'Beakers vs Cylinders', icon: <FlaskConical className="w-4 h-4" /> },
    { id: 'challenge', label: 'Lab Practical Quiz', icon: <Trophy className="w-4 h-4" /> },
    { id: 'reflection', label: 'Student Reflection', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15 gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab('investigation')}>
            <div className="w-9 h-9 rounded-lg bg-indigo-700 flex items-center justify-center text-white shadow-xs font-black text-base">
              ⚗️
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                ChemLab: Measurement & Resolution
                <span className="hidden md:inline-flex text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                  High School Chemistry
                </span>
              </h1>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Scale Divisions, Significant Figures & Meniscus Reading
              </p>
            </div>
          </div>

          {/* Quick Action Tools: Cheat Sheet & AI Tutor */}
          <div className="flex items-center gap-2">
            {/* Streak Counter */}
            {stats.streak > 0 && (
              <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                <Flame className="w-3.5 h-3.5 text-amber-600" />
                <span>Streak: {stats.streak}</span>
              </div>
            )}

            <button
              id="open-cheat-sheet-btn"
              onClick={onOpenCheatSheet}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-300 text-xs font-medium flex items-center gap-1.5 transition shadow-xs"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Resolution Cheat Sheet</span>
            </button>

            <button
              id="open-ai-tutor-btn"
              onClick={onOpenAITutor}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
            >
              <Bot className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ask AI Tutor</span>
            </button>
          </div>
        </div>

        {/* Horizontal Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-none">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => onSelectTab(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition ${
                activeTab === t.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
