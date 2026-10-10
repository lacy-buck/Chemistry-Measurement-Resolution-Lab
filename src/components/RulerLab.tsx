import React, { useState } from 'react';
import { RulerView } from './RulerView';
import { RULER_SCALES, CHEMISTRY_OBJECTS } from '../data/labData';
import { validateMeasurement } from '../utils/measurementValidation';
import { RulerScaleConfig, ChemistryObject, MeasurementValidation } from '../types';
import { Shuffle, CheckCircle2, XCircle, Sparkles, HelpCircle, Layers, Ruler } from 'lucide-react';
import confetti from 'canvas-confetti';

export const RulerLab: React.FC = () => {
  const [selectedScaleId, setSelectedScaleId] = useState<string>(RULER_SCALES[1].id);
  const [selectedObjectId, setSelectedObjectId] = useState<string>(CHEMISTRY_OBJECTS[0].id);
  const [objectLength, setObjectLength] = useState<number>(CHEMISTRY_OBJECTS[0].defaultLength);
  const [userInput, setUserInput] = useState<string>('');
  const [validation, setValidation] = useState<MeasurementValidation | null>(null);
  const [showHelperSteps, setShowHelperSteps] = useState(false);

  const activeScale = RULER_SCALES.find((s) => s.id === selectedScaleId) || RULER_SCALES[0];
  const activeObject = CHEMISTRY_OBJECTS.find((o) => o.id === selectedObjectId) || CHEMISTRY_OBJECTS[0];
  const isOffset = activeScale.id === 'offset_ruler';
  const offsetStart = isOffset ? 2.00 : 0.00;

  const handleRandomize = () => {
    // Generate a random length with appropriate decimal resolution
    const min = 2.0;
    const max = 12.0;
    const rand = Number((Math.random() * (max - min) + min).toFixed(2));
    setObjectLength(rand);
    setUserInput('');
    setValidation(null);
  };

  const handleCheckMeasurement = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const result = validateMeasurement(
      userInput,
      objectLength,
      activeScale.expectedDecimals,
      activeScale.minorTickInterval,
      activeScale.unit,
      activeScale.name
    );
    setValidation(result);

    if (result.isValid) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Scale Selector Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-950 text-amber-400 border border-amber-800">
                <Ruler className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-white">
                Ruler Measurement & Scale Resolution Station
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Select different ruler calibrations and laboratory samples to master measuring with proper significant figures.
            </p>
          </div>

          <button
            id="randomize-ruler-btn"
            onClick={handleRandomize}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Shuffle className="w-3.5 h-3.5 text-sky-400" /> Randomize Sample Length
          </button>
        </div>

        {/* Scale Chooser Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-2">
          {RULER_SCALES.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setSelectedScaleId(s.id);
                setUserInput('');
                setValidation(null);
              }}
              className={`p-3 text-left rounded-xl text-xs transition border flex flex-col justify-between ${
                selectedScaleId === s.id
                  ? 'bg-amber-950/70 border-amber-500/80 text-amber-100 shadow-md shadow-amber-950/40'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <div className="font-bold text-white mb-1 flex items-center justify-between">
                <span>{s.name.split('(')[0]}</span>
                {selectedScaleId === s.id && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                )}
              </div>
              <div className="text-[11px] text-slate-400">
                Divisions: <strong className="text-slate-300">{s.minorTickInterval} {s.unit}</strong>
              </div>
              <div className="text-[10px] text-amber-400/90 mt-1">
                Resolution: {s.expectedDecimals} decimal place{s.expectedDecimals === 1 ? '' : 's'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Object Chooser Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="font-semibold text-slate-300 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-sky-400" /> Chemistry Sample:
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {CHEMISTRY_OBJECTS.map((obj) => (
            <button
              key={obj.id}
              onClick={() => {
                setSelectedObjectId(obj.id);
                setObjectLength(obj.defaultLength);
                setUserInput('');
                setValidation(null);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                selectedObjectId === obj.id
                  ? 'bg-sky-600 text-white shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {obj.name.split('(')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Ruler Display */}
      <RulerView
        scale={activeScale}
        activeObject={activeObject}
        objectLength={objectLength}
        offsetStart={offsetStart}
        onLengthChange={setObjectLength}
        interactive={true}
        showGuideLine={true}
      />

      {/* Student Measurement Entry & Real-time Diagnostic */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <form onSubmit={handleCheckMeasurement} className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-1.5 flex-1 min-w-[240px]">
              <label htmlFor="ruler-measurement-input" className="block text-xs font-bold text-slate-200">
                Record the length of the {activeObject.name.split('(')[0]} with correct resolution:
              </label>
              <div className="relative">
                <input
                  id="ruler-measurement-input"
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder={`Enter length with unit (e.g., __ ${activeScale.unit})`}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <span className="text-[11px] text-slate-400 block">
                * Include both the numeric value (certain digits + 1 estimated digit) and the unit ({activeScale.unit}).
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowHelperSteps(!showHelperSteps)}
                className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium flex items-center gap-1 border border-slate-700 transition"
              >
                <HelpCircle className="w-4 h-4 text-sky-400" />
                {showHelperSteps ? 'Hide Step Guide' : 'Resolution Guide'}
              </button>

              <button
                id="submit-ruler-reading-btn"
                type="submit"
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black shadow-lg shadow-amber-950/40 transition flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" /> Check Measurement
              </button>
            </div>
          </div>
        </form>

        {/* Step-by-Step Helper Breakdown */}
        {showHelperSteps && (
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-2 animate-fadeIn">
            <span className="font-bold text-amber-400 block">
              📐 Resolution Calculation Walkthrough for {activeScale.name}:
            </span>
            <div className="grid sm:grid-cols-3 gap-3 text-slate-300">
              <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                <span className="font-semibold text-slate-200 block mb-1">1. Smallest Division:</span>
                Each tick mark represents <strong>{activeScale.minorTickInterval} {activeScale.unit}</strong>.
              </div>
              <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                <span className="font-semibold text-slate-200 block mb-1">2. Known Digits:</span>
                Read all values up to the last visible tick mark.
              </div>
              <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                <span className="font-semibold text-slate-200 block mb-1">3. Estimated Place:</span>
                Estimate to the <strong>{activeScale.estimatedPlaceName}</strong> ({activeScale.expectedDecimals} decimal places).
              </div>
            </div>
          </div>
        )}

        {/* Validation Result Box */}
        {validation && (
          <div
            id="ruler-validation-feedback"
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
                    Expected Format: <strong className="text-white">{validation.properFormatExample}</strong>
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
