import React, { useState, useRef, useEffect } from 'react';
import { CHALLENGE_BANK, RULER_SCALES, CYLINDER_SCALES, BEAKER_SCALES, CHEMISTRY_OBJECTS } from '../data/labData';
import { RulerView } from './RulerView';
import { CylinderView } from './CylinderView';
import { BeakerView } from './BeakerView';
import { validateMeasurement } from '../utils/measurementValidation';
import { ChallengeItem, StudentStats } from '../types';
import {
  Trophy,
  Flame,
  Award,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Printer,
  Copy,
  Check,
  BookOpen,
  Edit3,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MasteryChallengeProps {
  stats: StudentStats;
  onUpdateStats: (newStats: StudentStats) => void;
}

export const MasteryChallenge: React.FC<MasteryChallengeProps> = ({ stats, onUpdateStats }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [stepA_division, setStepA_division] = useState<string>('');
  const [stepC_measurement, setStepC_measurement] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);

  const divisionInputRef = useRef<HTMLInputElement>(null);
  const measurementInputRef = useRef<HTMLInputElement>(null);

  const currentChallenge: ChallengeItem = CHALLENGE_BANK[currentIndex] || CHALLENGE_BANK[0];
  const isFinished = currentIndex >= CHALLENGE_BANK.length;

  // Resolve matching scale config
  const rulerScale = RULER_SCALES.find((s) => s.unit === currentChallenge.unit && (s.minorTickInterval === currentChallenge.minorTickValue || (currentChallenge.offsetStart && s.id === 'offset_ruler'))) || RULER_SCALES[1];
  const cylinderScale = CYLINDER_SCALES.find((c) => c.minorTickInterval === currentChallenge.minorTickValue) || CYLINDER_SCALES[3];
  const beakerScale = BEAKER_SCALES[1];
  const sampleObject = CHEMISTRY_OBJECTS.find((o) => o.name.includes(currentChallenge.objectName || '')) || CHEMISTRY_OBJECTS[0];

  // Focus the measurement input on question transition
  useEffect(() => {
    if (!isFinished && !submitted) {
      divisionInputRef.current?.focus();
    }
  }, [currentIndex]);

  const handleSubmitChallenge = (e: React.FormEvent) => {
    e.preventDefault();

    // If measurement input is empty, do not lock form; focus input and alert user
    if (!stepC_measurement.trim()) {
      setValidationResult({
        isValid: false,
        score: 0,
        feedbackType: 'empty',
        message: 'Please enter a measurement in Question 2 before submitting.',
        explanation: `Look closely at the ${currentChallenge.instrumentName} above and record your reading with units (e.g., __ ${currentChallenge.unit}).`,
      });
      measurementInputRef.current?.focus();
      return;
    }

    if (submitted) return;

    const validation = validateMeasurement(
      stepC_measurement,
      currentChallenge.actualValue,
      currentChallenge.expectedDecimals,
      currentChallenge.minorTickValue,
      currentChallenge.unit,
      currentChallenge.instrumentName
    );

    setValidationResult(validation);
    setSubmitted(true);

    const isCorrect = validation.isValid;
    const newStreak = isCorrect ? stats.streak + 1 : 0;
    const bestStreak = Math.max(stats.bestStreak, newStreak);
    const scoreAdd = isCorrect ? 100 : Math.max(20, validation.score);
    const totalScore = stats.totalScore + scoreAdd;

    // Check badges
    const updatedBadges = [...stats.badges];
    if (newStreak >= 3 && !updatedBadges.includes('🔥 3-in-a-Row Streak')) {
      updatedBadges.push('🔥 3-in-a-Row Streak');
    }
    if (newStreak >= 5 && !updatedBadges.includes('⚡ 5-Streak Resolution Prodigy')) {
      updatedBadges.push('⚡ 5-Streak Resolution Prodigy');
    }
    if (isCorrect && currentChallenge.instrumentType === 'cylinder' && !updatedBadges.includes('🧪 Meniscus Master')) {
      updatedBadges.push('🧪 Meniscus Master');
    }
    if (isCorrect && currentChallenge.actualValue % 1 === 0 && currentChallenge.expectedDecimals > 0 && !updatedBadges.includes('🎯 Trailing Zero Expert')) {
      updatedBadges.push('🎯 Trailing Zero Expert');
    }

    const updatedHistory = [
      ...stats.history,
      {
        challengeId: currentChallenge.id,
        instrument: currentChallenge.instrumentName,
        userAnswer: stepC_measurement,
        isCorrect,
        timestamp: Date.now(),
      },
    ];

    onUpdateStats({
      completedChallenges: stats.completedChallenges + 1,
      totalScore,
      streak: newStreak,
      bestStreak,
      badges: updatedBadges,
      history: updatedHistory,
    });

    if (isCorrect) {
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    }
  };

  const handleNextChallenge = () => {
    setCurrentIndex((prev) => prev + 1);
    setStepA_division('');
    setStepC_measurement('');
    setSubmitted(false);
    setValidationResult(null);
  };

  const handleReviseAnswer = () => {
    setSubmitted(false);
    setTimeout(() => {
      measurementInputRef.current?.focus();
    }, 50);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setStepA_division('');
    setStepC_measurement('');
    setSubmitted(false);
    setValidationResult(null);
  };

  const generateReportText = () => {
    const dateStr = new Date().toLocaleDateString();
    let text = `=========================================\n`;
    text += `CHEMISTRY MEASUREMENT & RESOLUTION LAB REPORT\n`;
    text += `Date: ${dateStr}\n`;
    text += `Challenges Completed: ${stats.completedChallenges}/${CHALLENGE_BANK.length}\n`;
    text += `Total Score: ${stats.totalScore} pts\n`;
    text += `Best Streak: ${stats.bestStreak}\n`;
    text += `Earned Badges: ${stats.badges.join(', ') || 'In Progress'}\n`;
    text += `=========================================\n\n`;
    text += `DETAILED SUBMISSION LOG:\n`;
    stats.history.forEach((h, i) => {
      text += `${i + 1}. [${h.instrument}] -> Answer: "${h.userAnswer}" | Result: ${h.isCorrect ? 'CORRECT ✓' : 'NEEDS REVISION ✗'}\n`;
    });
    return text;
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(generateReportText());
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Gamification Status Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              Student Lab Practical: Measurement Mastery
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
              <span>Score: <strong className="text-indigo-700 font-mono font-bold">{stats.totalScore} pts</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Flame className={`w-3.5 h-3.5 ${stats.streak > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
                Streak: <strong className="text-amber-700 font-bold">{stats.streak}</strong> (Best: {stats.bestStreak})
              </span>
            </div>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="flex items-center gap-2">
          {!isFinished && (
            <span className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-semibold text-slate-700">
              Question {currentIndex + 1} of {CHALLENGE_BANK.length}
            </span>
          )}
        </div>
      </div>

      {/* Badges Ribbon */}
      {stats.badges.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-2.5 flex flex-wrap items-center gap-2 text-xs shadow-2xs">
          <span className="font-semibold text-slate-600 flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-600" /> Badges:
          </span>
          {stats.badges.map((b, i) => (
            <span key={i} className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 font-medium text-[11px]">
              {b}
            </span>
          ))}
        </div>
      )}

      {/* COMPLETED ALL CHALLENGES VIEW */}
      {isFinished ? (
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 text-center space-y-6 shadow-xs animate-fadeIn">
          <div className="w-14 h-14 rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center mx-auto shadow-sm">
            <Trophy className="w-7 h-7 text-emerald-600" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
              Lab Practical Completed! 🎉
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              You have completed all measurement practicals across rulers, graduated cylinders, and beakers with proper scale resolution and significant figures.
            </p>
          </div>

          {/* Final Score Cards */}
          <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-slate-500 block mb-1">Final Score</span>
              <span className="text-xl sm:text-2xl font-bold text-indigo-700 font-mono">{stats.totalScore}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-slate-500 block mb-1">Best Streak</span>
              <span className="text-xl sm:text-2xl font-bold text-amber-700 font-mono">{stats.bestStreak}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-slate-500 block mb-1">Badges Earned</span>
              <span className="text-xl sm:text-2xl font-bold text-emerald-700 font-mono">{stats.badges.length}</span>
            </div>
          </div>

          {/* Report Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-200">
            <button
              onClick={handleCopyReport}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-2 border border-slate-300 transition shadow-2xs"
            >
              {copiedReport ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              {copiedReport ? 'Report Copied to Clipboard!' : 'Copy Lab Report for Teacher'}
            </button>

            <button
              onClick={handleRestart}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition shadow-xs"
            >
              <RotateCcw className="w-4 h-4" /> Restart Lab Practical
            </button>
          </div>
        </div>
      ) : (
        /* ACTIVE CHALLENGE CARD */
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-5 animate-fadeIn">
          {/* Challenge Header & Context */}
          <div className="space-y-2 border-b border-slate-200 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Practical #{currentIndex + 1}: {currentChallenge.instrumentType.toUpperCase()}
              </span>
              <span className="text-xs text-slate-500">
                Scale: 1 division = <strong className="text-slate-800">{currentChallenge.minorTickValue} {currentChallenge.unit}</strong>
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">{currentChallenge.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-2xs">
              📋 <strong>Scenario:</strong> {currentChallenge.scenarioContext}
            </p>
          </div>

          {/* Interactive Instrument Render */}
          <div className="pt-1">
            {currentChallenge.instrumentType === 'ruler' ? (
              <RulerView
                scale={rulerScale}
                activeObject={sampleObject}
                objectLength={currentChallenge.actualValue}
                offsetStart={currentChallenge.offsetStart || 0}
                interactive={false}
                showGuideLine={false}
                allowRulerDrag={true}
              />
            ) : currentChallenge.instrumentType === 'cylinder' ? (
              <CylinderView
                scale={cylinderScale}
                volume={currentChallenge.actualValue}
                liquidColor={currentChallenge.liquidColor || '#38BDF8'}
                interactive={false}
                viewingAngle="eye_level"
                showGuideLine={false}
              />
            ) : (
              <BeakerView
                scale={beakerScale}
                volume={currentChallenge.actualValue}
                interactive={false}
              />
            )}
          </div>

          {/* Guided Question Form */}
          <form key={`challenge_form_${currentIndex}`} onSubmit={handleSubmitChallenge} className="space-y-4 pt-2">
            <div className="grid sm:grid-cols-2 gap-3">
              {/* Step 1: Scale Division */}
              <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-2xs">
                <label htmlFor="quiz-scale-division-input" className="block text-[11px] font-semibold text-slate-700">
                  1. Smallest Scale Line Division:
                </label>
                <input
                  id="quiz-scale-division-input"
                  ref={divisionInputRef}
                  type="text"
                  value={stepA_division}
                  onChange={(e) => setStepA_division(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      measurementInputRef.current?.focus();
                    }
                  }}
                  placeholder={`Enter division with unit (e.g., ${currentChallenge.minorTickValue} ${currentChallenge.unit})`}
                  disabled={submitted}
                  autoComplete="off"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 disabled:opacity-60 shadow-2xs"
                />
                <span className="text-[10px] text-slate-500 block">
                  Value between closest adjacent markings (Press Enter to move to Question 2)
                </span>
              </div>

              {/* Step 2: Final Measurement */}
              <div className="space-y-1.5 bg-indigo-50/50 p-3 rounded-xl border border-indigo-200 shadow-2xs">
                <label htmlFor="quiz-recorded-measurement-input" className="block text-[11px] font-bold text-indigo-950">
                  2. Recorded Measurement (Value + Unit):
                </label>
                <input
                  id="quiz-recorded-measurement-input"
                  ref={measurementInputRef}
                  type="text"
                  value={stepC_measurement}
                  onChange={(e) => setStepC_measurement(e.target.value)}
                  placeholder={`Enter measurement with unit (e.g., __ ${currentChallenge.unit})`}
                  disabled={submitted}
                  autoComplete="off"
                  className="w-full px-3 py-2 bg-white border border-indigo-300 rounded-lg text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 disabled:opacity-60 shadow-2xs"
                />
                <span className="text-[10px] text-indigo-700 block">
                  All certain digits + exactly 1 estimated digit
                </span>
              </div>
            </div>

            {/* Submission / Next Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              {!submitted ? (
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" /> Submit Measurement
                </button>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleReviseAnswer}
                    className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-indigo-600" /> Revise / Edit Answer
                  </button>

                  <button
                    type="button"
                    onClick={handleNextChallenge}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-2 cursor-pointer"
                  >
                    Next Practical Question <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </form>

          {/* Validation Diagnostic Box */}
          {validationResult && (
            <div
              className={`p-4 rounded-xl border text-xs space-y-2 animate-fadeIn shadow-2xs ${
                validationResult.isValid
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-rose-50 border-rose-200 text-rose-950'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {validationResult.isValid ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1 w-full">
                  <strong className="text-xs sm:text-sm block font-bold">{validationResult.message}</strong>
                  <p className="text-slate-600 leading-relaxed">{validationResult.explanation}</p>
                  <div className="pt-2 p-2.5 bg-white rounded-lg border border-slate-200 text-slate-700 text-[11px] shadow-2xs">
                    💡 <strong className="text-slate-900">Expert Chemistry Tip:</strong> {currentChallenge.tip}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
