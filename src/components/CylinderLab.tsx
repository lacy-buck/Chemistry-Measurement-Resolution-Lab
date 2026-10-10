import React, { useState } from 'react';
import { CylinderView } from './CylinderView';
import { CYLINDER_SCALES } from '../data/labData';
import { validateMeasurement } from '../utils/measurementValidation';
import { CylinderScaleConfig, MeasurementValidation } from '../types';
import { Shuffle, CheckCircle2, XCircle, Sparkles, HelpCircle, Droplet, Eye } from 'lucide-react';
import confetti from 'canvas-confetti';

const CHEMICAL_SOLUTIONS = [
  { id: 'water', name: 'Distilled Water (H₂O)', color: '#38BDF8' },
  { id: 'permanganate', name: 'Potassium Permanganate (KMnO₄)', color: '#A855F7' },
  { id: 'copper_sulfate', name: 'Copper(II) Sulfate (CuSO₄)', color: '#2563EB' },
  { id: 'universal', name: 'Universal Indicator (pH 7)', color: '#10B981' },
  { id: 'methyl_orange', name: 'Methyl Orange Acid Solution', color: '#F97316' },
];

export const CylinderLab: React.FC = () => {
  const [selectedScaleId, setSelectedScaleId] = useState<string>(CYLINDER_SCALES[3].id); // 100 mL default
  const [selectedSolution, setSelectedSolution] = useState(CHEMICAL_SOLUTIONS[0]);
  const [volume, setVolume] = useState<number>(42.5);
  const [viewingAngle, setViewingAngle] = useState<'eye_level' | 'above' | 'below'>('eye_level');
  const [userInput, setUserInput] = useState<string>('');
  const [validation, setValidation] = useState<MeasurementValidation | null>(null);
  const [showHelperSteps, setShowHelperSteps] = useState(false);

  const activeScale = CYLINDER_SCALES.find((s) => s.id === selectedScaleId) || CYLINDER_SCALES[0];

  const handleRandomize = () => {
    const min = activeScale.capacity * 0.15;
    const max = activeScale.capacity * 0.85;
    const rand = Number((Math.random() * (max - min) + min).toFixed(activeScale.expectedDecimals));
    setVolume(rand);
    setUserInput('');
    setValidation(null);
  };

  const handleCheckMeasurement = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const result = validateMeasurement(
      userInput,
      volume,
      activeScale.expectedDecimals,
      activeScale.minorTickInterval,
      'mL',
      activeScale.name
    );

    // If viewing angle is not eye level, give parallax warning
    if (viewingAngle !== 'eye_level') {
      result.isValid = false;
      result.message = `⚠️ Parallax Error! You are viewing from ${viewingAngle === 'above' ? 'above' : 'below'} eye level. Switch to "Eye Level" to read the true meniscus value.`;
    }

    setValidation(result);

    if (result.isValid) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Cylinder Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-sky-950 text-sky-400 border border-sky-800">
                <Droplet className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-white">
                Graduated Cylinder Volumetric Measurement Station
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Select cylinder capacities, observe meniscus physics, and practice recording correct volume resolution.
            </p>
          </div>

          <button
            id="randomize-cylinder-btn"
            onClick={handleRandomize}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Shuffle className="w-3.5 h-3.5 text-sky-400" /> Randomize Liquid Volume
          </button>
        </div>

        {/* Cylinder Chooser Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-2">
          {CYLINDER_SCALES.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setSelectedScaleId(s.id);
                // Set appropriate initial volume
                const newVol = Number((s.capacity * 0.45).toFixed(s.expectedDecimals));
                setVolume(newVol);
                setUserInput('');
                setValidation(null);
              }}
              className={`p-3 text-left rounded-xl text-xs transition border flex flex-col justify-between ${
                selectedScaleId === s.id
                  ? 'bg-sky-950/80 border-sky-500/80 text-sky-100 shadow-md shadow-sky-950/40'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <div className="font-bold text-white mb-1 flex items-center justify-between">
                <span>{s.capacity} mL Cylinder</span>
                {selectedScaleId === s.id && (
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                )}
              </div>
              <div className="text-[11px] text-slate-400">
                Ticks: <strong className="text-slate-300">{s.minorTickInterval} mL</strong>
              </div>
              <div className="text-[10px] text-sky-400/90 mt-1">
                {s.expectedDecimals} decimal place{s.expectedDecimals === 1 ? '' : 's'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Solution Color Picker */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="font-semibold text-slate-300 flex items-center gap-1.5">
          <Droplet className="w-4 h-4 text-sky-400" /> Aqueous Solution:
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {CHEMICAL_SOLUTIONS.map((sol) => (
            <button
              key={sol.id}
              onClick={() => setSelectedSolution(sol)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                selectedSolution.id === sol.id
                  ? 'bg-slate-800 text-white border border-slate-600 shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sol.color }} />
              {sol.name.split('(')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Graduated Cylinder View */}
      <CylinderView
        scale={activeScale}
        volume={volume}
        liquidColor={selectedSolution.color}
        onVolumeChange={setVolume}
        interactive={true}
        viewingAngle={viewingAngle}
        onViewingAngleChange={setViewingAngle}
      />

      {/* Student Volume Entry & Real-time Diagnostic */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <form onSubmit={handleCheckMeasurement} className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-1.5 flex-1 min-w-[240px]">
              <label htmlFor="cylinder-measurement-input" className="block text-xs font-bold text-slate-200">
                Record the liquid volume in the {activeScale.name} with correct resolution:
              </label>
              <div className="relative">
                <input
                  id="cylinder-measurement-input"
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Enter volume with unit (e.g., __ mL)"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>
              <span className="text-[11px] text-slate-400 block">
                * Read the bottom of the meniscus at eye level. Always include "mL".
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowHelperSteps(!showHelperSteps)}
                className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium flex items-center gap-1 border border-slate-700 transition"
              >
                <HelpCircle className="w-4 h-4 text-sky-400" />
                {showHelperSteps ? 'Hide Guide' : 'Meniscus Guide'}
              </button>

              <button
                id="submit-cylinder-reading-btn"
                type="submit"
                className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-xl text-xs font-black shadow-lg shadow-sky-950/40 transition flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" /> Check Volume
              </button>
            </div>
          </div>
        </form>

        {/* Step-by-Step Helper Breakdown */}
        {showHelperSteps && (
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-2 animate-fadeIn">
            <span className="font-bold text-sky-400 block">
              💧 Graduated Cylinder Reading Guide:
            </span>
            <div className="grid sm:grid-cols-3 gap-3 text-slate-300">
              <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                <span className="font-semibold text-slate-200 block mb-1">1. Tick Spacing:</span>
                Smallest tick line is <strong>{activeScale.minorTickInterval} mL</strong>.
              </div>
              <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                <span className="font-semibold text-slate-200 block mb-1">2. Meniscus Bottom:</span>
                Look at the lowest point in the center of the curve at eye level.
              </div>
              <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                <span className="font-semibold text-slate-200 block mb-1">3. Record Resolution:</span>
                Estimate to <strong>{activeScale.estimatedPlaceName}</strong> ({activeScale.expectedDecimals} decimal place{activeScale.expectedDecimals === 1 ? '' : 's'}).
              </div>
            </div>
          </div>
        )}

        {/* Validation Result Box */}
        {validation && (
          <div
            id="cylinder-validation-feedback"
            className={`p-4 rounded-xl border text-xs space-y-2 animate-fadeIn ${
              validation.isValid
                ? 'bg-emerald-950/80 border-emerald-700 text-emerald-100'
                : 'bg-rose-950/80 border-rose-800 text-rose-100'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {validation.isValid ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <strong className="text-sm block">{validation.message}</strong>
                <p className="text-slate-300 leading-relaxed">{validation.explanation}</p>
                <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px] font-mono">
                  <span className="px-2 py-0.5 bg-slate-900 rounded border border-slate-700 text-slate-300">
                    Target: <strong className="text-white">{validation.properFormatExample}</strong>
                  </span>
                  <span className="px-2 py-0.5 bg-slate-900 rounded border border-slate-700 text-slate-300">
                    Required Decimals: <strong className="text-sky-300">{validation.expectedDecimals}</strong>
                  </span>
                  <span className="px-2 py-0.5 bg-slate-900 rounded border border-slate-700 text-slate-300">
                    Your Decimals: <strong className={validation.actualDecimals === validation.expectedDecimals ? 'text-emerald-300' : 'text-rose-300'}>{validation.actualDecimals}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
