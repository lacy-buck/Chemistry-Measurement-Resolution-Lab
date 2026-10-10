import React, { useState } from 'react';
import { BeakerScaleConfig } from '../types';
import { Droplets, ArrowRight, AlertTriangle, CheckCircle2, RotateCcw, Shuffle } from 'lucide-react';

interface BeakerViewProps {
  scale: BeakerScaleConfig;
  volume: number; // in mL (true volume)
  liquidColor?: string;
  onVolumeChange?: (vol: number) => void;
  interactive?: boolean;
}

export const BeakerView: React.FC<BeakerViewProps> = ({
  scale,
  volume,
  liquidColor = '#F59E0B',
  onVolumeChange,
  interactive = true,
}) => {
  const [isTransferred, setIsTransferred] = useState(false);

  const maxCapacity = scale.capacity; // 100, 250, 500 mL
  const svgWidth = 480;
  const svgHeight = 440;

  // Beaker dimensions
  const beakerX = 110;
  const beakerY = 60;
  const beakerWidth = 260;
  const beakerHeight = 320;
  const bottomY = beakerY + beakerHeight;

  // Calculate liquid fill
  const clampedVol = Math.max(0, Math.min(maxCapacity, volume));
  const fillFraction = clampedVol / maxCapacity;
  const liquidHeightPx = fillFraction * (beakerHeight - 40);
  const liquidTopY = bottomY - liquidHeightPx;

  // Beaker tick marks
  const ticks: { val: number; y: number; label: string }[] = [];
  const numSteps = Math.floor(maxCapacity / scale.minorTickInterval);

  for (let i = 1; i <= numSteps; i++) {
    const val = i * scale.minorTickInterval;
    const y = bottomY - (val / maxCapacity) * (beakerHeight - 40);
    ticks.push({
      val,
      y,
      label: `${val}`,
    });
  }

  // Coarse beaker reading estimation
  const nearestTick = Math.round(clampedVol / scale.minorTickInterval) * scale.minorTickInterval;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs select-none">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            {scale.name} (Graduations: {scale.minorTickInterval} mL)
          </span>
          <span className="text-amber-800 font-medium flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Accuracy: ±{scale.uncertaintyPercent}% (Coarse Estimate Only)
          </span>
        </div>

        <button
          id="transfer-liquid-toggle-btn"
          onClick={() => setIsTransferred(!isTransferred)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
            isTransferred
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-xs'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
          }`}
        >
          {isTransferred ? (
            <>
              <RotateCcw className="w-3.5 h-3.5" /> Return to Beaker
            </>
          ) : (
            <>
              <ArrowRight className="w-3.5 h-3.5" /> Transfer to Graduated Cylinder
            </>
          )}
        </button>
      </div>

      {/* Main Glassware Stage */}
      <div className="relative w-full aspect-[480/440] max-h-[440px] flex items-center justify-center">
        {!isTransferred ? (
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full max-w-[480px]">
            <defs>
              <linearGradient id="beakerLiquidGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={liquidColor} stopOpacity="0.85" />
                <stop offset="50%" stopColor={liquidColor} stopOpacity="0.65" />
                <stop offset="100%" stopColor={liquidColor} stopOpacity="0.8" />
              </linearGradient>

              <linearGradient id="beakerGlassShine" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.2" />
                <stop offset="12%" stopColor="#FFFFFF" stopOpacity="0.03" />
                <stop offset="88%" stopColor="#FFFFFF" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.25" />
              </linearGradient>
            </defs>

            {/* Contrast Background */}
            <rect x="20" y="20" width={svgWidth - 40} height={svgHeight - 40} fill="#0F172A" rx="12" />

            {/* Liquid inside Beaker */}
            {clampedVol > 0 && (
              <g id="beaker-liquid">
                <rect
                  x={beakerX + 4}
                  y={liquidTopY}
                  width={beakerWidth - 8}
                  height={bottomY - liquidTopY}
                  rx="6"
                  fill="url(#beakerLiquidGrad)"
                />
                {/* Surface line */}
                <ellipse
                  cx={beakerX + beakerWidth / 2}
                  cy={liquidTopY}
                  rx={(beakerWidth - 8) / 2}
                  ry="6"
                  fill={liquidColor}
                  fillOpacity="0.9"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                  strokeOpacity="0.6"
                />
              </g>
            )}

            {/* Beaker Glass Body */}
            <g id="beaker-glass">
              {/* Beaker Walls */}
              <rect
                x={beakerX}
                y={beakerY}
                width={beakerWidth}
                height={beakerHeight}
                rx="14"
                fill="url(#beakerGlassShine)"
                stroke="#94A3B8"
                strokeWidth="2.5"
              />

              {/* Beaker Spout on Top Left */}
              <path
                d={`M ${beakerX} ${beakerY + 6} L ${beakerX - 18} ${beakerY - 10} L ${beakerX + 24} ${beakerY} Z`}
                fill="#CBD5E1"
                stroke="#94A3B8"
                strokeWidth="2"
              />

              {/* Beaker Lip Rim */}
              <line
                x1={beakerX - 4}
                y1={beakerY}
                x2={beakerX + beakerWidth + 4}
                y2={beakerY}
                stroke="#E2E8F0"
                strokeWidth="4"
                strokeLinecap="round"
              />

              {/* Lab Brand White Etched Area */}
              <rect
                x={beakerX + 30}
                y={beakerY + 40}
                width="80"
                height="45"
                rx="4"
                fill="#FFFFFF"
                fillOpacity="0.15"
                stroke="#FFFFFF"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <text x={beakerX + 70} y={beakerY + 60} textAnchor="middle" className="text-[10px] font-black fill-white">
                PYREX®
              </text>
              <text x={beakerX + 70} y={beakerY + 74} textAnchor="middle" className="text-[8px] font-medium fill-slate-300">
                APPROX. VOL
              </text>

              {/* Graduation Scale Lines */}
              {ticks.map((t, idx) => (
                <g key={`beaker-tick-${idx}`}>
                  <line
                    x1={beakerX + beakerWidth - 45}
                    y1={t.y}
                    x2={beakerX + beakerWidth}
                    y2={t.y}
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                  />
                  <text
                    x={beakerX + beakerWidth - 52}
                    y={t.y + 4}
                    textAnchor="end"
                    className="text-[13px] font-black fill-white drop-shadow"
                  >
                    {t.label}
                  </text>
                </g>
              ))}

              <text
                x={beakerX + beakerWidth - 15}
                y={beakerY + 30}
                textAnchor="end"
                className="text-[11px] font-bold fill-slate-300"
              >
                mL
              </text>
            </g>
          </svg>
        ) : (
          /* COMPARISON TRANSFERRED VIEW: Shows narrow 100 mL / 250 mL cylinder side-by-side */
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-950/90 rounded-xl border border-indigo-900/60 text-center animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-indigo-950 border border-indigo-500 flex items-center justify-center mb-2">
              <CheckCircle2 className="w-6 h-6 text-indigo-400" />
            </div>

            <h4 className="text-base font-bold text-white mb-1">
              Volumetric Scale Resolution Comparison
            </h4>

            <p className="text-xs text-slate-300 max-w-md mb-4">
              When poured from the coarse beaker into a calibrated <strong>100 mL Graduated Cylinder</strong>, the true meniscus reveals:
            </p>

            <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 shadow-2xs">
                <span className="text-[11px] font-semibold text-amber-800 block mb-1">
                  Beaker Reading (Coarse)
                </span>
                <span className="text-xl font-bold text-amber-950">
                  ~{nearestTick} mL
                </span>
                <span className="text-[10px] text-amber-700 block mt-1">
                  (Estimated between {scale.minorTickInterval} mL marks)
                </span>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 shadow-2xs">
                <span className="text-[11px] font-semibold text-emerald-800 block mb-1">
                  Graduated Cylinder (True)
                </span>
                <span className="text-xl font-bold text-emerald-950">
                  {volume.toFixed(1)} mL
                </span>
                <span className="text-[10px] text-emerald-700 block mt-1">
                  (0.1 mL resolution at meniscus)
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-left max-w-md shadow-2xs">
              <span className="text-xs font-bold text-indigo-950 block mb-1">
                🧪 Chemistry Concept Takeaway:
              </span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Beakers are designed with wide diameters and sparse graduation marks to hold, swirl, and heat reactions. Never use a beaker when exact stoichiometric mole calculations or quantitative titrations are required!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Volume Controls */}
      {interactive && onVolumeChange && !isTransferred && (
        <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-slate-700 font-semibold flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-amber-600" /> Adjust Liquid Level in Beaker:
            </span>
            <button
              onClick={() => {
                const rand = Math.round((Math.random() * (maxCapacity * 0.75) + maxCapacity * 0.15) * 10) / 10;
                onVolumeChange(rand);
              }}
              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded border border-amber-200 flex items-center gap-1 text-xs font-semibold shadow-2xs transition"
            >
              <Shuffle className="w-3 h-3" /> Random Level
            </button>
          </div>

          <input
            type="range"
            min="0"
            max={maxCapacity}
            step="1"
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
          />
        </div>
      )}
    </div>
  );
};
