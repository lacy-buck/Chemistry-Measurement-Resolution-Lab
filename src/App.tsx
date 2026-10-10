import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { GuidedInvestigation } from './components/GuidedInvestigation';
import { RulerLab } from './components/RulerLab';
import { CylinderLab } from './components/CylinderLab';
import { BeakerLab } from './components/BeakerLab';
import { MasteryChallenge } from './components/MasteryChallenge';
import { StudentReflection } from './components/StudentReflection';
import { ResolutionCheatSheet } from './components/ResolutionCheatSheet';
import { AITutorModal } from './components/AITutorModal';
import { TabMode, StudentStats } from './types';
import { Sparkles, Info, BookOpen, Compass, Ruler, Droplet, FlaskConical, Trophy } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'chemlab_student_stats_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabMode>('investigation');
  const [isCheatSheetOpen, setIsCheatSheetOpen] = useState<boolean>(false);
  const [isAITutorOpen, setIsAITutorOpen] = useState<boolean>(false);

  // Student stats state with local storage persistence
  const [stats, setStats] = useState<StudentStats>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading student stats:', e);
    }
    return {
      completedChallenges: 0,
      totalScore: 0,
      streak: 0,
      bestStreak: 0,
      badges: [],
      history: [],
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stats));
    } catch (e) {
      console.error('Error saving student stats:', e);
    }
  }, [stats]);

  const handleCompleteInvestigation = () => {
    // Award introductory badge if not already awarded
    if (!stats.badges.includes('🌟 Introductory Discovery Certified')) {
      setStats((prev) => ({
        ...prev,
        totalScore: prev.totalScore + 150,
        badges: [...prev.badges, '🌟 Introductory Discovery Certified'],
      }));
    }
    setActiveTab('rulers');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenCheatSheet={() => setIsCheatSheetOpen(true)}
        onOpenAITutor={() => setIsAITutorOpen(true)}
        stats={stats}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* Banner Reminder for Students */}
        <div className="mb-5 bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-indigo-950 flex items-center gap-2">
                The Chemistry Resolution Rule
                <span className="text-[10px] font-mono font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  Known Digits + 1 Estimated Digit
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                A scientific measurement always includes all values from marked lines plus <strong>one estimated place value</strong>. If it falls right on the line, keep the trailing zero!
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCheatSheetOpen(true)}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 transition"
          >
            <BookOpen className="w-3.5 h-3.5" /> View Scale Resolution Chart
          </button>
        </div>

        {/* Tab Modules */}
        <div className="transition-all duration-200">
          {activeTab === 'investigation' && (
            <GuidedInvestigation onCompleteInvestigation={handleCompleteInvestigation} />
          )}

          {activeTab === 'rulers' && <RulerLab />}

          {activeTab === 'cylinders' && <CylinderLab />}

          {activeTab === 'beakers' && <BeakerLab />}

          {activeTab === 'challenge' && (
            <MasteryChallenge stats={stats} onUpdateStats={setStats} />
          )}

          {activeTab === 'reflection' && (
            <StudentReflection onOpenAITutor={() => setIsAITutorOpen(true)} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-slate-700">
              High School Chemistry: Measurement Resolution & Significant Figures Lab
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Aligned with NGSS Science & Engineering Practices: SEP 3 (Planning & Carrying Out Investigations) & SEP 5 (Mathematical Thinking).
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCheatSheetOpen(true)}
              className="text-slate-600 hover:text-indigo-600 transition"
            >
              Scale Reference
            </button>
            <span>•</span>
            <button
              onClick={() => setIsAITutorOpen(true)}
              className="text-slate-600 hover:text-indigo-600 transition"
            >
              AI Lab Assistant
            </button>
          </div>
        </div>
      </footer>

      {/* Resolution Reference Modal */}
      <ResolutionCheatSheet
        isOpen={isCheatSheetOpen}
        onClose={() => setIsCheatSheetOpen(false)}
      />

      {/* Gemini AI Lab Tutor Modal */}
      <AITutorModal
        isOpen={isAITutorOpen}
        onClose={() => setIsAITutorOpen(false)}
        currentContext={{
          activeTab,
          studentScore: stats.totalScore,
          streak: stats.streak,
        }}
      />
    </div>
  );
}
