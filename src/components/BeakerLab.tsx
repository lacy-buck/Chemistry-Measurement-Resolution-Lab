import React, { useState } from 'react';
import { BeakerView } from './BeakerView';
import { BEAKER_SCALES } from '../data/labData';
import { validateMeasurement } from '../utils/measurementValidation';
import { BeakerScaleConfig, MeasurementValidation } from '../types';
import { Shuffle, CheckCircle2, XCircle, Sparkles, AlertTriangle, HelpCircle, FlaskConical } from 'lucide-react';
import confetti from 'canvas-confetti';

export const BeakerLab: React.FC = () => {
  const [selectedScaleId, setSelectedScaleId] = useState<string>(BEAKER_SCALES[1].id); // 250 mL beaker default
  const [volume, setVolume] = useState<number>(140);
  const [userInput, setUserInput] = useState<string>('');
  const [validation, setValidation] = useState<MeasurementValidation | null>(null);

  const activeScale = BEAKER_SCALES.find((b) => b.id === selectedScaleId) || BEAKER_SCALES[0];

  const handleRandomize = () => {
    const min = activeScale.capacity * 0.2;
    const max = activeScale.capacity * 0.8;
    const rand = Math.round(Math.random() * (max - min) + min);
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
    setValidation(result);

    if (result.isValid) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                <FlaskConical className="w-4 h-4" />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Beakers vs. Volumetric Glassware Lab
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Explore why laboratory beakers provide only coarse estimates (±5%) and test pouring liquid into calibrated graduated cylinders.
            </p>
          </div>

          <button
            onClick={handleRandomize}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-300 text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
          >
            <Shuffle className="w-3.5 h-3.5 text-amber-600" /> Randomize Beaker Level
          </button>
        </div>

        {/* Beaker Size Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {BEAKER_SCALES.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setSelectedScaleId(s.id);
                setVolume(Math.round(s.capacity * 0.55));
                setUserInput('');
                setValidation(null);
              }}
              className={`p-3 text-left rounded-xl text-xs transition border flex flex-col justify-between ${
                selectedScaleId === s.id
                  ? 'bg-amber-50/80 border-amber-300 text-amber-950 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="font-bold text-slate-900 mb-1 flex items-center justify-between">
                <span>{s.capacity} mL Beaker</span>
                {selectedScaleId === s.id && (
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                )}
              </div>
              <div className="text-[11px] text-slate-500">
                Graduations: <strong className="text-slate-700">Every {s.minorTickInterval} mL</strong>
              </div>
              <div className="text-[10px] text-amber-800 font-semibold mt-1">
                Accuracy: ±{s.uncertaintyPercent}% (Coarse Estimate)
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Beaker Display */}
      <BeakerView
        scale={activeScale}
        volume={volume}
        onVolumeChange={setVolume}
        interactive={true}
      />

      {/* Student Measurement Entry */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
        <form onSubmit={handleCheckMeasurement} className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-1.5 flex-1 min-w-[240px]">
              <label htmlFor="beaker-measurement-input" className="block text-xs font-semibold text-slate-800">
                Estimate the liquid volume in the {activeScale.name} (nearest 5-10 mL):
              </label>
              <div className="relative">
                <input
                  id="beaker-measurement-input"
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Enter estimated volume with unit (e.g., __ mL)"
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-2xs"
                />
              </div>
              <span className="text-[11px] text-slate-500 block">
                * Note: Because beaker graduations are {activeScale.minorTickInterval} mL apart, readings are coarse whole numbers.
              </span>
            </div>

            <button
              id="submit-beaker-reading-btn"
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" /> Check Estimation
            </button>
          </div>
        </form>

        {/* Validation Result */}
        {validation && (
          <div
            id="beaker-validation-feedback"
            className={`p-4 rounded-xl border text-xs space-y-2 animate-fadeIn shadow-2xs ${
              validation.isValid
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : 'bg-rose-50 border-rose-200 text-rose-950'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {validation.isValid ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <strong className="text-xs sm:text-sm block font-bold">{validation.message}</strong>
                <p className="text-slate-600 leading-relaxed">{validation.explanation}</p>
                <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px] font-mono">
                  <span className="px-2 py-0.5 bg-white rounded border border-slate-200 text-slate-700 shadow-2xs">
                    Beaker Estimate: <strong className="text-slate-900">~{Math.round(volume / 10) * 10} mL</strong>
                  </span>
                  <span className="px-2 py-0.5 bg-white rounded border border-slate-200 text-slate-700 shadow-2xs">
                    True Volume (Cylinder): <strong className="text-indigo-700">{volume.toFixed(1)} mL</strong>
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
