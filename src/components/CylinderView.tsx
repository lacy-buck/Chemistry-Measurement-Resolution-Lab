import React, { useState, useRef, useEffect } from 'react';
import { CylinderScaleConfig } from '../types';
import { ZoomIn, Eye, Droplets, Plus, Minus, Shuffle } from 'lucide-react';

interface CylinderViewProps {
  scale: CylinderScaleConfig;
  volume: number; // in mL
  liquidColor?: string;
  onVolumeChange?: (vol: number) => void;
  interactive?: boolean;
  viewingAngle?: 'eye_level' | 'above' | 'below';
  onViewingAngleChange?: (angle: 'eye_level' | 'above' | 'below') => void;
  showGuideLine?: boolean;
}

export const CylinderView: React.FC<CylinderViewProps> = ({
  scale,
  volume,
  liquidColor = '#38BDF8',
  onVolumeChange,
  interactive = true,
  viewingAngle = 'eye_level',
  onViewingAngleChange,
  showGuideLine = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLoupe, setShowLoupe] = useState(false);
  const [loupePos, setLoupePos] = useState({ x: 300, y: 200 });
  const [isDraggingLoupe, setIsDraggingLoupe] = useState(false);

  const maxCapacity = scale.capacity; // e.g. 10, 25, 50, 100, 250
  const svgWidth = 480;
  const svgHeight = 520;

  // Cylinder geometry
  const cylX = 170;
  const cylWidth = 110;
  const cylTopY = 60;
  const cylBottomY = 440;
  const cylHeight = cylBottomY - cylTopY; // 380 px
  const baseWidth = 180;

  // Calculate liquid fill height in px
  const clampedVol = Math.max(0, Math.min(maxCapacity, volume));
  const fillFraction = clampedVol / maxCapacity;
  const liquidHeightPx = fillFraction * cylHeight;
  // The bottom of the meniscus is the TRUE volume reading line
  const meniscusBottomY = cylBottomY - liquidHeightPx;
  const meniscusDepth = 10; // px that liquid creeps up on the cylinder walls
  const meniscusEdgeY = meniscusBottomY - meniscusDepth;
  // For quadratic bezier with endpoints at meniscusEdgeY (meniscusBottomY - meniscusDepth),
  // setting the control point Y to (meniscusBottomY + meniscusDepth) ensures the apex at t=0.5
  // is mathematically: 0.5*(meniscusBottomY - meniscusDepth) + 0.5*(meniscusBottomY + meniscusDepth) = meniscusBottomY
  const meniscusControlY = meniscusBottomY + meniscusDepth;

  // Parallax offset for line of sight
  let parallaxShiftY = 0;
  let parallaxLabel = 'Eye Level (0° Line of Sight - Correct)';
  if (viewingAngle === 'above') {
    parallaxShiftY = -14; // Looking down makes liquid line look higher up
    parallaxLabel = 'Looking Down (+15° Parallax Error: reads falsely high!)';
  } else if (viewingAngle === 'below') {
    parallaxShiftY = +14; // Looking up makes liquid line look lower down
    parallaxLabel = 'Looking Up (-15° Parallax Error: reads falsely low!)';
  }

  // Generate tick marks
  const ticks: { val: number; y: number; isMajor: boolean; isMid: boolean; label?: string }[] = [];
  const step = scale.minorTickInterval;
  const numSteps = Math.round(maxCapacity / step);

  for (let i = 0; i <= numSteps; i++) {
    const val = Number((i * step).toFixed(2));
    const y = cylBottomY - (val / maxCapacity) * cylHeight;
    const isMajor = Math.abs(val % scale.majorTickInterval) < 0.001;
    
    // Halfway tick
    const isMid =
      !isMajor &&
      ((scale.majorTickInterval === 1 && Math.abs((val * 10) % 5) < 0.001) ||
        (scale.majorTickInterval === 10 && Math.abs(val % 5) < 0.001) ||
        (scale.majorTickInterval === 5 && Math.abs((val * 10) % 10) < 0.001));

    ticks.push({
      val,
      y,
      isMajor,
      isMid,
      label: isMajor && val > 0 ? String(Math.round(val)) : undefined,
    });
  }

  const handleMouseDownLoupe = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDraggingLoupe(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDraggingLoupe) {
      setLoupePos({
        x: Math.max(80, Math.min(rect.width - 80, x)),
        y: Math.max(70, Math.min(rect.height - 70, y)),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDraggingLoupe(false);
  };

  // Center loupe on meniscus when volume changes
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const targetY = (meniscusBottomY / svgHeight) * rect.height;
      setLoupePos({ x: rect.width * 0.48, y: Math.max(90, Math.min(rect.height - 90, targetY)) });
    }
  }, [volume, scale.id]);

  const stepVal = scale.minorTickInterval <= 0.1 ? 0.1 : 1.0;

  return (
    <div
      ref={containerRef}
      id="cylinder-workspace-container"
      className="relative select-none bg-white border border-slate-200 rounded-xl p-4 shadow-xs overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Top Header & Angle Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2 px-1 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            Capacity: {scale.capacity} mL (1 div = {scale.minorTickInterval} mL)
          </span>
          {showGuideLine && (
            <span className="text-slate-600">
              Resolution: <strong className="text-slate-900 font-semibold">{scale.expectedDecimals} decimal place{scale.expectedDecimals === 1 ? '' : 's'}</strong> ({scale.estimatedPlaceName})
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            id="toggle-cylinder-loupe-btn"
            onClick={() => setShowLoupe(!showLoupe)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
              showLoupe
                ? 'bg-amber-50 text-amber-800 border border-amber-300 shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300'
            }`}
          >
            <ZoomIn className="w-3.5 h-3.5" />
            {showLoupe ? 'Hide Meniscus Loupe' : '3× Meniscus Loupe'}
          </button>
        </div>
      </div>

      {/* Viewing Angle Selector */}
      {onViewingAngleChange && (
        <div className="mb-2 bg-slate-50 border border-slate-200 rounded-lg p-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold text-slate-700">Line of Sight Perspective:</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onViewingAngleChange('above')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                viewingAngle === 'above'
                  ? 'bg-rose-100 text-rose-800 border border-rose-300 shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              Above (+ Parallax)
            </button>
            <button
              onClick={() => onViewingAngleChange('eye_level')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                viewingAngle === 'eye_level'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs font-semibold'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              Eye Level (Correct ✓)
            </button>
            <button
              onClick={() => onViewingAngleChange('below')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                viewingAngle === 'below'
                  ? 'bg-rose-100 text-rose-800 border border-rose-300 shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              Below (- Parallax)
            </button>
          </div>
        </div>
      )}

      {/* Main SVG Area */}
      <div className="relative w-full aspect-[480/520] max-h-[500px] flex items-center justify-center">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full max-w-[480px] drop-shadow-2xl"
        >
          <defs>
            {/* Liquid Fill Gradient with Depth */}
            <linearGradient id="liquidGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={liquidColor} stopOpacity="0.85" />
              <stop offset="35%" stopColor={liquidColor} stopOpacity="0.65" />
              <stop offset="70%" stopColor={liquidColor} stopOpacity="0.75" />
              <stop offset="100%" stopColor={liquidColor} stopOpacity="0.9" />
            </linearGradient>

            {/* Glass Cylinder Reflection Highlight */}
            <linearGradient id="glassReflection" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.25" />
              <stop offset="15%" stopColor="#FFFFFF" stopOpacity="0.05" />
              <stop offset="85%" stopColor="#FFFFFF" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.3" />
            </linearGradient>

            {/* Hexagonal Base Gradient */}
            <linearGradient id="baseGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#64748B" />
              <stop offset="50%" stopColor="#334155" />
              <stop offset="100%" stopColor="#1E293B" />
            </linearGradient>
          </defs>

          {/* Background Contrast Lab Backdrop */}
          <rect x="20" y="20" width={svgWidth - 40} height={svgHeight - 40} fill="#0F172A" rx="12" />
          
          {/* Parallax Sight Line */}
          {viewingAngle !== 'eye_level' && (
            <g id="parallax-sightline">
              <line
                x1="40"
                y1={meniscusBottomY + (viewingAngle === 'above' ? -40 : 40)}
                x2={cylX + cylWidth + 40}
                y2={meniscusBottomY + parallaxShiftY}
                stroke="#F43F5E"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text
                x="45"
                y={meniscusBottomY + (viewingAngle === 'above' ? -46 : 52)}
                className="text-[10px] font-bold fill-rose-400"
              >
                Parallax Angle: False reading!
              </text>
            </g>
          )}

          {/* LIQUID BODY IN CYLINDER */}
          {clampedVol > 0 && (
            <g id="cylinder-liquid">
              {/* Single unified liquid body with concave top meniscus surface */}
              <path
                d={`M ${cylX + 2} ${meniscusEdgeY} 
                    Q ${cylX + cylWidth / 2} ${meniscusControlY} ${cylX + cylWidth - 2} ${meniscusEdgeY} 
                    L ${cylX + cylWidth - 2} ${cylBottomY} 
                    L ${cylX + 2} ${cylBottomY} Z`}
                fill="url(#liquidGrad)"
              />

              {/* Meniscus Bottom Highlight Curve (exact apex touching meniscusBottomY) */}
              <path
                d={`M ${cylX + 4} ${meniscusEdgeY + 1} 
                    Q ${cylX + cylWidth / 2} ${meniscusControlY} ${cylX + cylWidth - 4} ${meniscusEdgeY + 1}`}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="2.0"
                strokeOpacity="0.9"
              />

              {/* Sub-meniscus depth shadow */}
              <ellipse
                cx={cylX + cylWidth / 2}
                cy={meniscusBottomY + 2}
                rx={cylWidth / 2 - 6}
                ry="3"
                fill="#000000"
                fillOpacity="0.12"
              />
            </g>
          )}

          {/* GLASS CYLINDER TUBE OUTLINE */}
          <g id="glass-tube">
            {/* Hexagonal / Circular Heavy Base */}
            <polygon
              points={`${cylX - 35},${cylBottomY + 35} ${cylX + cylWidth + 35},${cylBottomY + 35} ${cylX + cylWidth + 25},${cylBottomY} ${cylX - 25},${cylBottomY}`}
              fill="url(#baseGrad)"
              stroke="#475569"
              strokeWidth="2"
            />
            <ellipse
              cx={cylX + cylWidth / 2}
              cy={cylBottomY + 35}
              rx={baseWidth / 2}
              ry="10"
              fill="#0F172A"
            />

            {/* Cylinder Tube Glass Walls */}
            <rect
              x={cylX}
              y={cylTopY}
              width={cylWidth}
              height={cylHeight}
              rx="4"
              fill="url(#glassReflection)"
              stroke="#94A3B8"
              strokeWidth="2.5"
            />

            {/* Cylinder Pour Spout */}
            <path
              d={`M ${cylX} ${cylTopY} L ${cylX - 12} ${cylTopY - 14} L ${cylX + 16} ${cylTopY} Z`}
              fill="#CBD5E1"
              stroke="#64748B"
              strokeWidth="1.5"
            />

            {/* Scale Unit Label */}
            <text
              x={cylX + cylWidth / 2}
              y={cylTopY + 20}
              textAnchor="middle"
              className="text-[12px] font-black fill-slate-200 tracking-wider"
            >
              mL (20°C)
            </text>

            {/* GRADUATION SCALE TICKS */}
            {ticks.map((t, idx) => {
              const tickLength = t.isMajor ? 26 : t.isMid ? 18 : 10;
              const tickXStart = cylX;
              const tickXEnd = cylX + tickLength;

              return (
                <g key={`cyl-tick-${idx}`}>
                  <line
                    x1={tickXStart}
                    y1={t.y}
                    x2={tickXEnd}
                    y2={t.y}
                    stroke="#FFFFFF"
                    strokeWidth={t.isMajor ? 2.0 : 1.2}
                    strokeOpacity={t.isMajor ? 0.95 : 0.75}
                  />
                  {t.label && (
                    <text
                      x={tickXEnd + 6}
                      y={t.y + 4}
                      className="text-[13px] font-black fill-white select-none drop-shadow"
                    >
                      {t.label}
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {/* MENISCUS READING TARGET GUIDE LINE */}
          {showGuideLine && clampedVol > 0 && viewingAngle === 'eye_level' && (
            <g id="meniscus-guide-line">
              <line
                x1={cylX - 25}
                y1={meniscusBottomY}
                x2={cylX + cylWidth + 25}
                y2={meniscusBottomY}
                stroke="#FACC15"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                opacity="0.85"
              />
              <polygon
                points={`${cylX - 25},${meniscusBottomY - 4} ${cylX - 25},${meniscusBottomY + 4} ${cylX - 16},${meniscusBottomY}`}
                fill="#FACC15"
              />
              <text
                x={cylX + cylWidth + 30}
                y={meniscusBottomY + 4}
                className="text-[10px] font-bold fill-amber-300"
              >
                ◀ Read bottom of meniscus
              </text>
            </g>
          )}
        </svg>

        {/* 3X INTERACTIVE MAGNIFIER LOUPE FOR MENISCUS */}
        {showLoupe && (
          <div
            id="cylinder-loupe-overlay"
            style={{
              left: `${loupePos.x}px`,
              top: `${loupePos.y}px`,
              transform: 'translate(-50%, -50%)',
            }}
            onMouseDown={handleMouseDownLoupe}
            className="absolute z-20 w-48 h-48 rounded-full border-4 border-amber-400 bg-slate-950 shadow-2xl overflow-hidden cursor-move ring-4 ring-black/40"
          >
            <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[9px] font-extrabold px-2 py-0.5 rounded-full z-30 shadow">
              3× MENISCUS LOUPE
            </div>

            <div className="w-full h-full relative">
              <svg
                viewBox={`${(loupePos.x / (containerRef.current?.clientWidth || 480)) * svgWidth - 35} ${
                  (loupePos.y / (containerRef.current?.clientHeight || 520)) * svgHeight - 35
                } 70 70`}
                className="w-full h-full"
              >
                {/* Background */}
                <rect width={svgWidth} height={svgHeight} fill="#0F172A" />

                {/* Liquid */}
                {clampedVol > 0 && (
                  <g>
                    <path
                      d={`M ${cylX + 2} ${meniscusEdgeY} 
                          Q ${cylX + cylWidth / 2} ${meniscusControlY} ${cylX + cylWidth - 2} ${meniscusEdgeY} 
                          L ${cylX + cylWidth - 2} ${cylBottomY} 
                          L ${cylX + 2} ${cylBottomY} Z`}
                      fill={liquidColor}
                      fillOpacity="0.8"
                    />
                    <path
                      d={`M ${cylX + 4} ${meniscusEdgeY + 1} 
                          Q ${cylX + cylWidth / 2} ${meniscusControlY} ${cylX + cylWidth - 4} ${meniscusEdgeY + 1}`}
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="2.5"
                      strokeOpacity="0.9"
                    />
                  </g>
                )}

                {/* Glass wall */}
                <rect
                  x={cylX}
                  y={cylTopY}
                  width={cylWidth}
                  height={cylHeight}
                  fill="none"
                  stroke="#94A3B8"
                  strokeWidth="3"
                />

                {/* Ticks */}
                {ticks.map((t, idx) => (
                  <g key={`loupe-cyl-${idx}`}>
                    <line
                      x1={cylX}
                      y1={t.y}
                      x2={cylX + (t.isMajor ? 28 : t.isMid ? 18 : 10)}
                      y2={t.y}
                      stroke="#FFFFFF"
                      strokeWidth={t.isMajor ? 2.5 : 1.5}
                    />
                    {t.label && (
                      <text
                        x={cylX + 32}
                        y={t.y + 4}
                        className="text-[13px] font-black fill-white select-none"
                      >
                        {t.label}
                      </text>
                    )}
                  </g>
                ))}
              </svg>

              {/* Crosshair */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-full h-[1px] bg-amber-400/80" />
                <div className="absolute h-full w-[1px] bg-amber-400/80" />
                <div className="absolute w-3.5 h-3.5 rounded-full border border-amber-300" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Liquid Level Adjustment Controls */}
      {interactive && onVolumeChange && (
        <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-slate-700 font-semibold flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-indigo-600" /> Adjust Liquid Volume:
            </span>
            <div className="flex items-center gap-1">
              <button
                id="drain-fine-btn"
                onClick={() => onVolumeChange(Math.max(0, Number((volume - stepVal).toFixed(2))))}
                className="px-2 py-1 bg-white hover:bg-slate-50 text-slate-700 rounded border border-slate-300 flex items-center gap-0.5 text-xs shadow-2xs"
              >
                <Minus className="w-3 h-3" /> {stepVal} mL
              </button>
              <button
                id="fill-fine-btn"
                onClick={() => onVolumeChange(Math.min(maxCapacity, Number((volume + stepVal).toFixed(2))))}
                className="px-2 py-1 bg-white hover:bg-slate-50 text-slate-700 rounded border border-slate-300 flex items-center gap-0.5 text-xs shadow-2xs"
              >
                <Plus className="w-3 h-3" /> {stepVal} mL
              </button>
              <button
                id="randomize-volume-btn"
                onClick={() => {
                  const randomVal = (Math.random() * (maxCapacity * 0.8) + maxCapacity * 0.1).toFixed(scale.expectedDecimals);
                  onVolumeChange(Number(randomVal));
                }}
                className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded border border-indigo-200 flex items-center gap-1 text-xs font-semibold shadow-2xs transition"
              >
                <Shuffle className="w-3 h-3" /> New Random Level
              </button>
            </div>
          </div>

          {/* Volume Slider */}
          <input
            type="range"
            min="0"
            max={maxCapacity}
            step={scale.minorTickInterval <= 0.1 ? 0.05 : 0.5}
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>
      )}
    </div>
  );
};
