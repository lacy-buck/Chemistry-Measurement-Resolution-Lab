import React, { useState } from 'react';
import { RulerView } from './RulerView';
import { CylinderView } from './CylinderView';
import { RULER_SCALES, CHEMISTRY_OBJECTS, CYLINDER_SCALES } from '../data/labData';
import { validateMeasurement } from '../utils/measurementValidation';
import { CheckCircle2, XCircle, ArrowRight, ArrowLeft, Lightbulb, Sparkles, BookOpen, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface GuidedInvestigationProps {
  onCompleteInvestigation: () => void;
}

export const GuidedInvestigation: React.FC<GuidedInvestigationProps> = ({ onCompleteInvestigation }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Two Rulers State
  const [ruler1Answer, setRuler1Answer] = useState('');
  const [ruler2Answer, setRuler2Answer] = useState('');
  const [step1Feedback1, setStep1Feedback1] = useState<any>(null);
  const [step1Feedback2, setStep1Feedback2] = useState<any>(null);

  // Step 2: Anatomy State (Two different scale rulers)
  const [anatomyAnswer1, setAnatomyAnswer1] = useState('');
  const [anatomyFeedback1, setAnatomyFeedback1] = useState<any>(null);
  const [anatomyAnswer2, setAnatomyAnswer2] = useState('');
  const [anatomyFeedback2, setAnatomyFeedback2] = useState<any>(null);

  // Step 3: Trailing Zero State (Two different scale rulers)
  const [zeroAnswer1, setZeroAnswer1] = useState('');
  const [zeroFeedback1, setZeroFeedback1] = useState<any>(null);
  const [zeroAnswer2, setZeroAnswer2] = useState('');
  const [zeroFeedback2, setZeroFeedback2] = useState<any>(null);

  // Step 4: Meniscus State
  const [meniscusAnswer, setMeniscusAnswer] = useState('');
  const [meniscusFeedback, setMeniscusFeedback] = useState<any>(null);
  const [viewingAngle, setViewingAngle] = useState<'eye_level' | 'above' | 'below'>('eye_level');

  const testObject = CHEMISTRY_OBJECTS[0]; // Magnesium ribbon (4.30 cm)

  // Validate Step 1 - Ruler A (One at a time)
  const handleCheckRuler1 = () => {
    const f1 = validateMeasurement(ruler1Answer, 4.3, 1, 1.0, 'cm', 'Coarse 1 cm Ruler');
    setStep1Feedback1(f1);

    if (f1.isValid) {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
    }
  };

  // Validate Step 1 - Ruler B (One at a time)
  const handleCheckRuler2 = () => {
    const f2 = validateMeasurement(ruler2Answer, 4.30, 2, 0.1, 'cm', 'Standard 0.1 cm Ruler');
    setStep1Feedback2(f2);

    if (f2.isValid) {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
    }
  };

  // Validate Step 2 - Problem 2A (0.1 cm Ruler)
  const handleCheckAnatomy1 = () => {
    const f = validateMeasurement(anatomyAnswer1, 7.65, 2, 0.1, 'cm', 'Standard 0.1 cm Ruler');
    setAnatomyFeedback1(f);
    if (f.isValid) {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
    }
  };

  // Validate Step 2 - Problem 2B (Coarse 1 cm Ruler - Different Scale!)
  const handleCheckAnatomy2 = () => {
    const f = validateMeasurement(anatomyAnswer2, 6.7, 1, 1.0, 'cm', 'Coarse 1 cm Ruler');
    setAnatomyFeedback2(f);
    if (f.isValid) {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
    }
  };

  // Validate Step 3 - Problem 3A (0.1 cm Ruler landing exactly on 5 cm line)
  const handleCheckZero1 = () => {
    const f = validateMeasurement(zeroAnswer1, 5.00, 2, 0.1, 'cm', 'Standard 0.1 cm Ruler');
    setZeroFeedback1(f);
    if (f.isValid) {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
    }
  };

  // Validate Step 3 - Problem 3B (Coarse 1 cm Ruler landing exactly on 8 cm line - Different Scale!)
  const handleCheckZero2 = () => {
    const f = validateMeasurement(zeroAnswer2, 8.0, 1, 1.0, 'cm', 'Coarse 1 cm Ruler');
    setZeroFeedback2(f);
    if (f.isValid) {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
    }
  };

  // Validate Step 4
  const handleCheckStep4 = () => {
    const f = validateMeasurement(meniscusAnswer, 32.5, 1, 1.0, 'mL', '100 mL Cylinder');
    setMeniscusFeedback(f);
    if (f.isValid) {
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.5 } });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Stepper */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
              <BookOpen className="w-4 h-4" />
            </span>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              Introductory Discovery: The Science of Scale Resolution
            </h2>
          </div>
          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200">
            Step {currentStep} of 4
          </span>
        </div>

        {/* Step Tabs Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { num: 1, title: '1. Two Rulers Mystery' },
            { num: 2, title: '2. Certain + Estimated' },
            { num: 3, title: '3. The Trailing Zero' },
            { num: 4, title: '4. Meniscus & Parallax' },
          ].map((s) => (
            <button
              key={s.num}
              onClick={() => setCurrentStep(s.num)}
              className={`py-1.5 px-2 text-center rounded-lg text-xs font-medium transition ${
                currentStep === s.num
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : currentStep > s.num
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              <div className="truncate">{s.title}</div>
            </button>
          ))}
        </div>
      </div>

      {/* STEP 1: THE TWO RULERS MYSTERY */}
      {currentStep === 1 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-5 animate-fadeIn">
          <div className="space-y-1.5 border-b border-slate-200 pb-3">
            <div className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200">
              <Lightbulb className="w-3.5 h-3.5" /> Discovery Goal: Compare Instrument Scales
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Part 1: The Tale of Two Rulers
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Suppose you are given the <strong>exact same piece of Magnesium Ribbon</strong> in the chemistry lab. First, you measure it with <strong>Ruler A</strong> (lines every 1 cm only). Then you measure it with <strong>Ruler B</strong> (lines every 0.1 cm).
            </p>
          </div>

          {/* Ruler A (Coarse) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                Ruler A: Coarse Scale (Marked every 1 cm)
              </span>
              <span className="text-slate-500 font-normal">Smallest division = 1 cm</span>
            </div>
            <RulerView
              scale={RULER_SCALES[0]}
              activeObject={testObject}
              objectLength={4.30}
              interactive={false}
              showGuideLine={true}
            />
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <label className="text-xs font-medium text-slate-700">
                Your measurement for Ruler A:
              </label>
              <input
                type="text"
                value={ruler1Answer}
                onChange={(e) => setRuler1Answer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCheckRuler1();
                }}
                placeholder="Enter measurement with unit"
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 w-52 shadow-2xs"
              />
              <button
                id="check-ruler-a-btn"
                onClick={handleCheckRuler1}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" /> Check Ruler A
              </button>
            </div>
            {step1Feedback1 && (
              <div
                className={`p-3 rounded-lg text-xs flex items-start gap-2 border ${
                  step1Feedback1.isValid
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                {step1Feedback1.isValid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <strong className="block font-semibold">{step1Feedback1.message}</strong>
                  <span className="text-slate-600">{step1Feedback1.explanation}</span>
                </div>
              </div>
            )}
          </div>

          {/* Ruler B (Standard mm) */}
          <div className="space-y-2 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">2</span>
                Ruler B: Standard Metric Ruler (Marked every 0.1 cm / 1 mm)
              </span>
              <span className="text-slate-500 font-normal">Smallest division = 0.1 cm</span>
            </div>
            <RulerView
              scale={RULER_SCALES[1]}
              activeObject={testObject}
              objectLength={4.30}
              interactive={false}
              showGuideLine={true}
            />
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <label className="text-xs font-medium text-slate-700">
                Your measurement for Ruler B:
              </label>
              <input
                type="text"
                value={ruler2Answer}
                onChange={(e) => setRuler2Answer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCheckRuler2();
                }}
                placeholder="Enter measurement with unit"
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 w-52 shadow-2xs"
              />
              <button
                id="check-ruler-b-btn"
                onClick={handleCheckRuler2}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" /> Check Ruler B
              </button>
            </div>
            {step1Feedback2 && (
              <div
                className={`p-3 rounded-lg text-xs flex items-start gap-2 border ${
                  step1Feedback2.isValid
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                {step1Feedback2.isValid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <strong className="block font-semibold">{step1Feedback2.message}</strong>
                  <span className="text-slate-600">{step1Feedback2.explanation}</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <div className="text-xs text-slate-500">
              {step1Feedback1?.isValid && step1Feedback2?.isValid ? (
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Both measurements verified! Proceed to Part 2.
                </span>
              ) : (
                <span>Check each measurement one at a time to compare their decimal places.</span>
              )}
            </div>

            {step1Feedback1?.isValid && step1Feedback2?.isValid && (
              <button
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
              >
                Next Concept: Anatomy of a Measurement <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* STEP 2: THE ANATOMY OF A MEASUREMENT */}
      {currentStep === 2 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-5 animate-fadeIn">
          <div className="space-y-1.5 border-b border-slate-200 pb-3">
            <div className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200">
              <Lightbulb className="w-3.5 h-3.5" /> The Golden Rule of Analog Instruments
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Part 2: Certain Digits + Exactly ONE Estimated Digit
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              In chemistry, every analog measurement consists of <strong>all certain digits read from visible lines</strong> plus <strong>one estimated decimal place</strong> between lines. Practice identifying both parts across two different ruler scales:
            </p>
          </div>

          {/* Visual Concept Infographic */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 shadow-2xs">
              <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">1</span>
                Known / Certain Digits
              </span>
              <p className="text-xs text-slate-600">
                These are read <strong>directly from visible line markings</strong> on the scale. There is no guessing for these digits—they are guaranteed by the tick marks.
              </p>
              <div className="bg-white border border-slate-200 p-2 rounded-lg text-center font-mono text-sm text-indigo-900 shadow-2xs">
                Example: <strong className="text-slate-900 text-base">7.6</strong>_ cm
              </div>
            </div>

            <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 space-y-2 shadow-2xs">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">2</span>
                ONE Estimated Digit (Uncertainty)
              </span>
              <p className="text-xs text-amber-900/80">
                The experimenter estimates <strong>one place beyond</strong> the smallest tick mark (estimating tenths between adjacent lines).
              </p>
              <div className="bg-white border border-amber-200 p-2 rounded-lg text-center font-mono text-sm text-amber-900 shadow-2xs">
                Estimated: 7.6<strong className="text-amber-600 text-base">5</strong> cm
              </div>
            </div>
          </div>

          {/* Problem 2A: Standard 0.1 cm Ruler */}
          <div className="space-y-3 pt-2 bg-slate-50/50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">2A</span>
                Problem 2A: Standard Metric Ruler (Lines every 0.1 cm / 1 mm)
              </span>
              <span className="text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 text-[11px] font-mono">
                Smallest Tick: 0.1 cm → Record to 0.01 cm (2 Decimals)
              </span>
            </div>

            <RulerView
              scale={RULER_SCALES[1]}
              activeObject={CHEMISTRY_OBJECTS[1]}
              objectLength={7.65}
              interactive={false}
            />

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <label className="text-xs font-medium text-slate-700">
                Record Zinc Electrode length (value + unit):
              </label>
              <input
                type="text"
                value={anatomyAnswer1}
                onChange={(e) => setAnatomyAnswer1(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCheckAnatomy1();
                }}
                placeholder="Enter measurement with unit"
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 w-52 shadow-2xs"
              />
              <button
                id="check-anatomy-1-btn"
                onClick={handleCheckAnatomy1}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" /> Check Problem 2A
              </button>
            </div>

            {anatomyFeedback1 && (
              <div
                className={`p-3 rounded-lg text-xs flex items-start gap-2 border ${
                  anatomyFeedback1.isValid
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                {anatomyFeedback1.isValid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <strong className="block font-semibold">{anatomyFeedback1.message}</strong>
                  <span className="text-slate-600">{anatomyFeedback1.explanation}</span>
                </div>
              </div>
            )}
          </div>

          {/* Problem 2B: Coarse 1 cm Ruler (Different Scale!) */}
          <div className="space-y-3 pt-2 bg-slate-50/50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold">2B</span>
                Problem 2B: Coarse Ruler Scale (Lines every 1 cm only — No Millimeter Ticks!)
              </span>
              <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px] font-mono">
                Smallest Tick: 1 cm → Record to 0.1 cm (1 Decimal)
              </span>
            </div>

            <RulerView
              scale={RULER_SCALES[0]}
              activeObject={CHEMISTRY_OBJECTS[2]}
              objectLength={6.7}
              interactive={false}
            />

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <label className="text-xs font-medium text-slate-700">
                Record Copper Wire length (value + unit):
              </label>
              <input
                type="text"
                value={anatomyAnswer2}
                onChange={(e) => setAnatomyAnswer2(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCheckAnatomy2();
                }}
                placeholder="Enter measurement with unit"
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 w-52 shadow-2xs"
              />
              <button
                id="check-anatomy-2-btn"
                onClick={handleCheckAnatomy2}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" /> Check Problem 2B
              </button>
            </div>

            {anatomyFeedback2 && (
              <div
                className={`p-3 rounded-lg text-xs flex items-start gap-2 border ${
                  anatomyFeedback2.isValid
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                {anatomyFeedback2.isValid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <strong className="block font-semibold">{anatomyFeedback2.message}</strong>
                  <span className="text-slate-600">{anatomyFeedback2.explanation}</span>
                </div>
              </div>
            )}
          </div>

          {/* Part 2 Footer Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-3 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-medium transition flex items-center gap-1 shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Part 1
            </button>

            <div className="text-xs text-slate-500">
              {anatomyFeedback1?.isValid && anatomyFeedback2?.isValid ? (
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Both scale measurements verified!
                </span>
              ) : (
                <span>Check both measurements one at a time to complete Part 2.</span>
              )}
            </div>

            {anatomyFeedback1?.isValid && anatomyFeedback2?.isValid && (
              <button
                onClick={() => setCurrentStep(3)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
              >
                Next Concept: The Trailing Zero Rule <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* STEP 3: THE TRAILING ZERO RULE */}
      {currentStep === 3 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-5 animate-fadeIn">
          <div className="space-y-1.5 border-b border-slate-200 pb-3">
            <div className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
              <Lightbulb className="w-3.5 h-3.5 text-amber-600" /> Common Mistake Alert!
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Part 3: The Mystery of the Trailing Zero
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              What if the object ends <strong>exactly on a major tick mark</strong>, such as the 5 cm line or 8 cm line?
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 space-y-2 shadow-2xs">
            <p>
              In regular math class, <code className="text-indigo-700 font-mono font-semibold bg-white px-1.5 py-0.5 rounded border border-slate-200">5</code>, <code className="text-indigo-700 font-mono font-semibold bg-white px-1.5 py-0.5 rounded border border-slate-200">5.0</code>, and <code className="text-indigo-700 font-mono font-semibold bg-white px-1.5 py-0.5 rounded border border-slate-200">5.00</code> represent the same number. 
            </p>
            <p className="font-semibold text-slate-900">
              ⚠️ But in chemistry, they tell three totally different stories about your instrument's resolution!
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 pl-2">
              <li>Writing <strong>5 cm</strong> implies you estimated the ones place (from a meter stick with only 10 cm marks).</li>
              <li>Writing <strong>5.0 cm</strong> implies you estimated tenths (from a ruler with 1 cm marks).</li>
              <li>Writing <strong>5.00 cm</strong> tells the scientist that your ruler had millimeter lines (0.1 cm marks) and you estimated the hundredths place to be zero!</li>
            </ul>
          </div>

          {/* Problem 3A: Landing on line on 0.1 cm Ruler */}
          <div className="space-y-3 pt-2 bg-slate-50/50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">3A</span>
                Problem 3A: Standard Metric Ruler (0.1 cm marks) Landing Exactly on 5 cm Line
              </span>
              <span className="text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 text-[11px] font-mono">
                Ticks: 0.1 cm → Must record 2 decimal places (.00)
              </span>
            </div>

            <RulerView
              scale={RULER_SCALES[1]}
              activeObject={CHEMISTRY_OBJECTS[2]}
              objectLength={5.00}
              interactive={false}
            />

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <label className="text-xs font-medium text-slate-700">
                What MUST you write in your lab notebook (value + unit)?
              </label>
              <input
                type="text"
                value={zeroAnswer1}
                onChange={(e) => setZeroAnswer1(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCheckZero1();
                }}
                placeholder="Enter measurement with unit"
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 w-52 shadow-2xs"
              />
              <button
                id="check-zero-1-btn"
                onClick={handleCheckZero1}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" /> Check Problem 3A
              </button>
            </div>

            {zeroFeedback1 && (
              <div
                className={`p-3 rounded-lg text-xs flex items-start gap-2 border ${
                  zeroFeedback1.isValid
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                {zeroFeedback1.isValid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <strong className="block font-semibold">{zeroFeedback1.message}</strong>
                  <span className="text-slate-600">{zeroFeedback1.explanation}</span>
                </div>
              </div>
            )}
          </div>

          {/* Problem 3B: Landing on line on Coarse 1 cm Ruler (Different Scale!) */}
          <div className="space-y-3 pt-2 bg-slate-50/50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold">3B</span>
                Problem 3B: Coarse 1 cm Ruler (1.0 cm marks only) Landing Exactly on 8 cm Line
              </span>
              <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px] font-mono">
                Ticks: 1.0 cm → Must record 1 decimal place (.0)
              </span>
            </div>

            <RulerView
              scale={RULER_SCALES[0]}
              activeObject={CHEMISTRY_OBJECTS[1]}
              objectLength={8.0}
              interactive={false}
            />

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <label className="text-xs font-medium text-slate-700">
                What MUST you write in your lab notebook (value + unit)?
              </label>
              <input
                type="text"
                value={zeroAnswer2}
                onChange={(e) => setZeroAnswer2(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCheckZero2();
                }}
                placeholder="Enter measurement with unit"
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 w-52 shadow-2xs"
              />
              <button
                id="check-zero-2-btn"
                onClick={handleCheckZero2}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" /> Check Problem 3B
              </button>
            </div>

            {zeroFeedback2 && (
              <div
                className={`p-3 rounded-lg text-xs flex items-start gap-2 border ${
                  zeroFeedback2.isValid
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                {zeroFeedback2.isValid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <strong className="block font-semibold">{zeroFeedback2.message}</strong>
                  <span className="text-slate-600">{zeroFeedback2.explanation}</span>
                </div>
              </div>
            )}
          </div>

          {/* Part 3 Footer Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-3 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-medium transition flex items-center gap-1 shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Part 2
            </button>

            <div className="text-xs text-slate-500">
              {zeroFeedback1?.isValid && zeroFeedback2?.isValid ? (
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Both trailing zero rules verified!
                </span>
              ) : (
                <span>Check both measurements one at a time to complete Part 3.</span>
              )}
            </div>

            {zeroFeedback1?.isValid && zeroFeedback2?.isValid && (
              <button
                onClick={() => setCurrentStep(4)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
              >
                Next Concept: Meniscus & Parallax <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* STEP 4: MENISCUS & PARALLAX IN LIQUID MEASUREMENT */}
      {currentStep === 4 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-5 animate-fadeIn">
          <div className="space-y-1.5 border-b border-slate-200 pb-3">
            <div className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200">
              <Lightbulb className="w-3.5 h-3.5" /> Liquid Glassware Mastery
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Part 4: Reading the Meniscus & Avoiding Parallax
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              When water or aqueous solutions enter a glass cylinder, adhesion causes the liquid to creep slightly up the walls, creating a curved surface called the <strong>meniscus</strong>.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 shadow-2xs">
              <span className="font-bold text-slate-900 block">
                Rule 1: Read the Bottom of the Curve
              </span>
              <p className="text-slate-600">
                Always record the volume at the lowest point (the center bottom of the concave curve), NOT the elevated edges touching the glass.
              </p>
            </div>
            <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 space-y-2 shadow-2xs">
              <span className="font-bold text-amber-900 block">
                Rule 2: Eye Level Alignment (Parallax)
              </span>
              <p className="text-amber-900/80">
                Your eye must be directly horizontal with the liquid level. Looking down from above makes the reading artificially high; looking up makes it too low!
              </p>
            </div>
          </div>

          {/* Interactive Cylinder Practice */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-semibold text-slate-800">
              Read the volume in this 100 mL graduated cylinder (divisions = 1 mL, meniscus halfway between 32 and 33):
            </span>
            <CylinderView
              scale={CYLINDER_SCALES[3]}
              volume={32.5}
              interactive={false}
              viewingAngle={viewingAngle}
              onViewingAngleChange={setViewingAngle}
            />

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <label className="text-xs font-medium text-slate-700">
                Record your liquid volume (value + unit):
              </label>
              <input
                type="text"
                value={meniscusAnswer}
                onChange={(e) => setMeniscusAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCheckStep4();
                }}
                placeholder="Enter volume with unit"
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 w-52 shadow-2xs"
              />
              <button
                onClick={handleCheckStep4}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
              >
                Check Answer
              </button>
            </div>

            {meniscusFeedback && (
              <div
                className={`p-3 rounded-lg text-xs flex items-start gap-2 border ${
                  meniscusFeedback.isValid
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                {meniscusFeedback.isValid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <strong className="block font-semibold">{meniscusFeedback.message}</strong>
                  <span className="text-slate-600">{meniscusFeedback.explanation}</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-3 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-medium transition flex items-center gap-1 shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Part 3
            </button>

            {meniscusFeedback?.isValid && (
              <button
                onClick={onCompleteInvestigation}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Finish Investigation & Enter Measurement Labs!
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
