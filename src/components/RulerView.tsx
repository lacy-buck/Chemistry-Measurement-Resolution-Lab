import React, { useState, useRef, useEffect } from 'react';
import { RulerScaleConfig, ChemistryObject } from '../types';
import { ZoomIn, Eye, MoveHorizontal, Sparkles, Move, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

interface RulerViewProps {
  scale: RulerScaleConfig;
  activeObject: ChemistryObject;
  objectLength: number; // in cm
  offsetStart?: number; // in cm, for offset ruler
  showGuideLine?: boolean;
  onLengthChange?: (newLen: number) => void;
  interactive?: boolean;
  allowRulerDrag?: boolean;
}

export const RulerView: React.FC<RulerViewProps> = ({
  scale,
  activeObject,
  objectLength,
  offsetStart = 0,
  showGuideLine = true,
  onLengthChange,
  interactive = true,
  allowRulerDrag,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLoupe, setShowLoupe] = useState(false);
  const [loupePos, setLoupePos] = useState({ x: 350, y: 140 });
  const [isDraggingLoupe, setIsDraggingLoupe] = useState(false);
  const [isDraggingObject, setIsDraggingObject] = useState(false);
  const [isDraggingRuler, setIsDraggingRuler] = useState(false);

  // Determine if ruler should be movable/draggable
  const isRulerMovable = allowRulerDrag ?? (scale.id === 'offset_ruler' || offsetStart > 0);
  const [rulerShiftPx, setRulerShiftPx] = useState<number>(0);
  const dragStartClientX = useRef<number>(0);
  const dragStartShift = useRef<number>(0);

  const rulerMax = scale.maxVal; // e.g. 15 cm
  const svgWidth = 800;
  const svgHeight = 220;
  const baseRulerX = 50;
  const rulerY = 120;
  const rulerWidth = 700;
  const rulerHeight = 60;
  const cmToPx = rulerWidth / rulerMax;

  // Ruler X position with horizontal shift
  const rulerX = baseRulerX + rulerShiftPx;

  // Object is fixed on the lab bench at standard position
  const objectStartPx = baseRulerX + offsetStart * cmToPx;
  const objectEndPx = objectStartPx + objectLength * cmToPx;

  // Current ruler readings aligned with the object edges
  const alignedStartCm = Number(((objectStartPx - rulerX) / cmToPx).toFixed(2));
  const alignedEndCm = Number(((objectEndPx - rulerX) / cmToPx).toFixed(2));

  // Generate tick marks based on current rulerX
  const ticks: { val: number; x: number; height: number; isMajor: boolean; label?: string }[] = [];
  const step = scale.minorTickInterval;
  const numSteps = Math.round(rulerMax / step);

  for (let i = 0; i <= numSteps; i++) {
    const val = Number((i * step).toFixed(2));
    const x = rulerX + val * cmToPx;
    const isMajor = Math.abs(val % scale.majorTickInterval) < 0.001;
    const isMid = !isMajor && scale.minorTickInterval <= 0.1 && Math.abs((val * 10) % 5) < 0.001;

    let tickHeight = 12;
    if (isMajor) tickHeight = 28;
    else if (isMid || scale.minorTickInterval === 0.5) tickHeight = 20;

    ticks.push({
      val,
      x,
      height: tickHeight,
      isMajor,
      label: isMajor ? String(Math.round(val)) : undefined,
    });
  }

  // Handle loupe drag
  const handleMouseDownLoupe = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDraggingLoupe(true);
  };

  // Handle ruler dragging
  const handleMouseDownRuler = (e: React.MouseEvent) => {
    if (!isRulerMovable) return;
    setIsDraggingRuler(true);
    dragStartClientX.current = e.clientX;
    dragStartShift.current = rulerShiftPx;
  };

  const handleTouchStartRuler = (e: React.TouchEvent) => {
    if (!isRulerMovable || e.touches.length === 0) return;
    setIsDraggingRuler(true);
    dragStartClientX.current = e.touches[0].clientX;
    dragStartShift.current = rulerShiftPx;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDraggingLoupe) {
      setLoupePos({
        x: Math.max(80, Math.min(rect.width - 80, x)),
        y: Math.max(60, Math.min(rect.height - 60, y)),
      });
    }

    if (isDraggingRuler && isRulerMovable) {
      const deltaScreenX = e.clientX - dragStartClientX.current;
      const deltaSvgX = deltaScreenX * (svgWidth / rect.width);
      // Clamp shift between -200px and +150px
      const clampedShift = Math.max(-250, Math.min(150, dragStartShift.current + deltaSvgX));
      setRulerShiftPx(clampedShift);
    }

    if (isDraggingObject && interactive && onLengthChange) {
      const relX = x * (svgWidth / rect.width);
      const newLen = (relX - objectStartPx) / cmToPx;
      if (newLen >= 0.5 && newLen <= rulerMax) {
        onLengthChange(Number(newLen.toFixed(2)));
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current || e.touches.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();

    if (isDraggingRuler && isRulerMovable) {
      const deltaScreenX = e.touches[0].clientX - dragStartClientX.current;
      const deltaSvgX = deltaScreenX * (svgWidth / rect.width);
      const clampedShift = Math.max(-250, Math.min(150, dragStartShift.current + deltaSvgX));
      setRulerShiftPx(clampedShift);
    }
  };

  const handleMouseUp = () => {
    setIsDraggingLoupe(false);
    setIsDraggingObject(false);
    setIsDraggingRuler(false);
  };

  // Align ruler to a specific start value (e.g. snap 1.0, 2.0, 3.0 cm to object's left edge)
  const handleSnapToStart = (targetStartCm: number) => {
    // objectStartPx = rulerX + targetStartCm * cmToPx
    // rulerX = objectStartPx - targetStartCm * cmToPx
    // rulerShiftPx = rulerX - baseRulerX
    const desiredRulerX = objectStartPx - targetStartCm * cmToPx;
    const newShift = desiredRulerX - baseRulerX;
    setRulerShiftPx(newShift);
  };

  const handleNudgeRuler = (deltaCm: number) => {
    setRulerShiftPx((prev) => Math.max(-250, Math.min(150, prev + deltaCm * cmToPx)));
  };

  const handleResetRuler = () => {
    setRulerShiftPx(0);
  };

  // Center loupe near the object end on mount or object length change
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const targetX = (objectEndPx / svgWidth) * rect.width;
      setLoupePos({ x: Math.min(rect.width - 90, Math.max(90, targetX)), y: 130 });
    }
  }, [objectLength, offsetStart]);

  return (
    <div
      ref={containerRef}
      id="ruler-workspace-container"
      className="relative select-none bg-white border border-slate-200 rounded-xl p-4 shadow-xs overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
    >
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2 px-1 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            Scale: 1 division = {scale.minorTickInterval} {scale.unit}
          </span>
          {showGuideLine && (
            <span className="text-slate-600 hidden sm:inline text-xs">
              Required Resolution: <strong className="text-slate-900 font-semibold">{scale.expectedDecimals} decimal place{scale.expectedDecimals === 1 ? '' : 's'}</strong> ({scale.estimatedPlaceName})
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            id="toggle-loupe-btn"
            onClick={() => setShowLoupe(!showLoupe)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
              showLoupe
                ? 'bg-amber-50 text-amber-800 border border-amber-300 shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300'
            }`}
          >
            <ZoomIn className="w-3.5 h-3.5" />
            {showLoupe ? 'Hide 3x Magnifier' : 'Use 3x Magnifier'}
          </button>
        </div>
      </div>

      {/* Movable Ruler Control Toolbar (When Offset or Movable Ruler active) */}
      {isRulerMovable && (
        <div className="mb-2.5 bg-amber-50/70 border border-amber-200/80 rounded-lg px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-amber-900 font-medium">
            <span className="p-1 bg-amber-200/70 rounded text-amber-950">
              <Move className="w-3.5 h-3.5" />
            </span>
            <span>
              {offsetStart > 0 || scale.id === 'offset_ruler' ? (
                <><strong>Movable Broken-Zero Ruler:</strong> Drag ruler or snap to align an intact mark!</>
              ) : (
                <><strong>Movable Ruler:</strong> Click & drag ruler left/right to align markings as desired.</>
              )}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-amber-800 font-semibold hidden md:inline">Snap:</span>
            {offsetStart === 0 && scale.id !== 'offset_ruler' && (
              <button
                type="button"
                onClick={() => handleSnapToStart(0.0)}
                className="px-2 py-0.5 bg-white hover:bg-amber-100/70 text-amber-950 border border-amber-300 rounded text-[11px] font-semibold transition"
              >
                0.00
              </button>
            )}
            <button
              type="button"
              onClick={() => handleSnapToStart(1.0)}
              className="px-2 py-0.5 bg-white hover:bg-amber-100/70 text-amber-950 border border-amber-300 rounded text-[11px] font-semibold transition"
            >
              1.00 cm
            </button>
            <button
              type="button"
              onClick={() => handleSnapToStart(2.0)}
              className="px-2 py-0.5 bg-white hover:bg-amber-100/70 text-amber-950 border border-amber-300 rounded text-[11px] font-semibold transition"
            >
              2.00 cm
            </button>
            <button
              type="button"
              onClick={() => handleSnapToStart(3.0)}
              className="px-2 py-0.5 bg-white hover:bg-amber-100/70 text-amber-950 border border-amber-300 rounded text-[11px] font-semibold transition"
            >
              3.00 cm
            </button>

            <div className="h-3.5 w-px bg-amber-300 mx-1" />

            <button
              type="button"
              onClick={() => handleNudgeRuler(0.5)}
              title="Slide Ruler Left"
              className="p-1 bg-white hover:bg-amber-100 text-amber-950 border border-amber-300 rounded text-[11px] transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleNudgeRuler(-0.5)}
              title="Slide Ruler Right"
              className="p-1 bg-white hover:bg-amber-100 text-amber-950 border border-amber-300 rounded text-[11px] transition"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetRuler}
              title="Reset Position"
              className="px-2 py-0.5 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded text-[11px] font-medium transition flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>
        </div>
      )}

      {/* Main SVG Stage */}
      <div className="relative w-full aspect-[800/230] min-h-[220px]">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full drop-shadow-md"
        >
          <defs>
            {/* Ruler wood/acrylic gradient */}
            <linearGradient id="rulerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FEF3C7" />
              <stop offset="15%" stopColor="#FDE68A" />
              <stop offset="85%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>

            {/* Magnesium / Zinc ribbon metallic gradient */}
            <linearGradient id="metalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="30%" stopColor="#E2E8F0" />
              <stop offset="70%" stopColor="#94A3B8" />
              <stop offset="100%" stopColor="#64748B" />
            </linearGradient>

            {/* Copper gradient */}
            <linearGradient id="copperGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFEDD5" />
              <stop offset="40%" stopColor="#FB923C" />
              <stop offset="80%" stopColor="#C2410C" />
              <stop offset="100%" stopColor="#7C2D12" />
            </linearGradient>

            {/* Filter shadow */}
            <filter id="dropShadow" x="-5%" y="-5%" width="110%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Background Grid Accent */}
          <pattern id="labGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" strokeWidth="0.5" strokeOpacity="0.4" />
          </pattern>
          <rect width={svgWidth} height={svgHeight} fill="url(#labGrid)" rx="12" />

          {/* OBJECT TO MEASURE (Fixed position on bench) */}
          <g id="chemistry-measured-sample" filter="url(#dropShadow)">
            {/* Object Body */}
            {activeObject.id === 'copper_strip' ? (
              <rect
                x={objectStartPx}
                y={rulerY - 45}
                width={objectLength * cmToPx}
                height="32"
                rx="3"
                fill="url(#copperGrad)"
                stroke="#9A3412"
                strokeWidth="1.5"
              />
            ) : activeObject.id === 'glass_rod' ? (
              <rect
                x={objectStartPx}
                y={rulerY - 40}
                width={objectLength * cmToPx}
                height="24"
                rx="12"
                fill="#38BDF8"
                fillOpacity="0.45"
                stroke="#BAE6FD"
                strokeWidth="1.5"
              />
            ) : activeObject.id === 'chromatography_strip' ? (
              <g>
                <rect
                  x={objectStartPx}
                  y={rulerY - 50}
                  width={objectLength * cmToPx}
                  height="38"
                  rx="1"
                  fill="#F8FAFC"
                  stroke="#CBD5E1"
                  strokeWidth="1"
                />
                {/* Chromatography solvent spots */}
                <circle cx={objectStartPx + 20} cy={rulerY - 31} r="4" fill="#3B82F6" opacity="0.8" />
                <circle cx={objectStartPx + (objectLength * cmToPx * 0.45)} cy={rulerY - 31} r="5" fill="#EF4444" opacity="0.8" />
                <circle cx={objectStartPx + (objectLength * cmToPx * 0.75)} cy={rulerY - 31} r="6" fill="#EAB308" opacity="0.8" />
              </g>
            ) : (
              // Default Magnesium / Zinc metal ribbon
              <rect
                x={objectStartPx}
                y={rulerY - 46}
                width={objectLength * cmToPx}
                height="34"
                rx="3"
                fill="url(#metalGrad)"
                stroke="#475569"
                strokeWidth="1.5"
              />
            )}

            {/* Object Label Tag */}
            <text
              x={objectStartPx + (objectLength * cmToPx) / 2}
              y={rulerY - 26}
              textAnchor="middle"
              className="text-[11px] font-bold fill-slate-900 drop-shadow-sm select-none"
            >
              {activeObject.name.split('(')[0]}
            </text>

            {/* Draggable handle on right edge */}
            {interactive && onLengthChange && (
              <g
                className="cursor-ew-resize hover:opacity-100 opacity-80"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setIsDraggingObject(true);
                }}
              >
                <rect
                  x={objectEndPx - 6}
                  y={rulerY - 50}
                  width="12"
                  height="42"
                  rx="3"
                  fill="#38BDF8"
                  stroke="#0284C7"
                  strokeWidth="1.5"
                />
                <line x1={objectEndPx - 2} y1={rulerY - 42} x2={objectEndPx - 2} y2={rulerY - 16} stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
                <line x1={objectEndPx + 2} y1={rulerY - 42} x2={objectEndPx + 2} y2={rulerY - 16} stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
              </g>
            )}
          </g>

          {/* RULER BODY (Draggable when isRulerMovable) */}
          <g
            id="ruler-body"
            filter="url(#dropShadow)"
            className={isRulerMovable ? (isDraggingRuler ? 'cursor-grabbing' : 'cursor-grab') : undefined}
            onMouseDown={handleMouseDownRuler}
            onTouchStart={handleTouchStartRuler}
          >
            {/* Beveled Ruler Plate */}
            <rect
              x={rulerX - 10}
              y={rulerY}
              width={rulerWidth + 20}
              height={rulerHeight}
              rx="6"
              fill="url(#rulerGrad)"
              stroke="#B45309"
              strokeWidth="2"
            />

            {/* Broken/Offset Zero indicator if applicable */}
            {(offsetStart > 0 || scale.id === 'offset_ruler') && (
              <g>
                <path
                  d={`M ${rulerX - 10} ${rulerY} L ${rulerX + 15} ${rulerY + 10} L ${rulerX - 5} ${rulerY + 30} L ${rulerX + 10} ${rulerY + 50} L ${rulerX - 10} ${rulerY + rulerHeight}`}
                  fill="#1E293B"
                  stroke="#EF4444"
                  strokeWidth="1.5"
                />
                <text x={rulerX + 22} y={rulerY + 45} className="text-[9px] font-bold fill-red-800">
                  CHIPPED ZERO END (Slide ruler to align mark)
                </text>
              </g>
            )}

            {/* Ruler Scale Unit Header */}
            <text
              x={rulerX + rulerWidth - 15}
              y={rulerY + rulerHeight - 12}
              textAnchor="end"
              className="text-[12px] font-black tracking-wider fill-amber-950"
            >
              {scale.unit.toUpperCase()}
            </text>

            {/* Movable ruler drag handle visual cues */}
            {isRulerMovable && (
              <g opacity="0.6">
                <line x1={rulerX + rulerWidth / 2 - 12} y1={rulerY + rulerHeight - 8} x2={rulerX + rulerWidth / 2 + 12} y2={rulerY + rulerHeight - 8} stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
                <line x1={rulerX + rulerWidth / 2 - 8} y1={rulerY + rulerHeight - 5} x2={rulerX + rulerWidth / 2 + 8} y2={rulerY + rulerHeight - 5} stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
              </g>
            )}

            {/* Tick Marks & Numbers */}
            {ticks.map((t, idx) => (
              <g key={`tick-${idx}`}>
                <line
                  x1={t.x}
                  y1={rulerY}
                  x2={t.x}
                  y2={rulerY + t.height}
                  stroke="#78350F"
                  strokeWidth={t.isMajor ? 1.8 : 1.0}
                  strokeLinecap="square"
                />
                {t.label && (
                  <text
                    x={t.x}
                    y={rulerY + 44}
                    textAnchor="middle"
                    className="text-[13px] font-black fill-amber-950 select-none"
                  >
                    {t.label}
                  </text>
                )}
              </g>
            ))}
          </g>

          {/* VERTICAL MEASUREMENT GUIDE LINE (Hidden in Lab Practical Quiz when showGuideLine=false) */}
          {showGuideLine && (
            <g id="guide-alignment-lines">
              {/* Start guide line if offset */}
              {(offsetStart > 0 || scale.id === 'offset_ruler') && (
                <g>
                  <line
                    x1={objectStartPx}
                    y1={rulerY - 60}
                    x2={objectStartPx}
                    y2={rulerY + 28}
                    stroke="#EF4444"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />
                  <circle cx={objectStartPx} cy={rulerY - 50} r="3" fill="#EF4444" />
                </g>
              )}

              {/* End guide line */}
              <line
                x1={objectEndPx}
                y1={rulerY - 60}
                x2={objectEndPx}
                y2={rulerY + 28}
                stroke="#38BDF8"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
              <circle cx={objectEndPx} cy={rulerY - 50} r="3.5" fill="#38BDF8" />
              <polygon
                points={`${objectEndPx - 4},${rulerY - 4} ${objectEndPx + 4},${rulerY - 4} ${objectEndPx},${rulerY + 4}`}
                fill="#38BDF8"
              />
            </g>
          )}
        </svg>

        {/* 3X INTERACTIVE MAGNIFIER LOUPE OVERLAY */}
        {showLoupe && (
          <div
            id="draggable-magnifier-loupe"
            style={{
              left: `${loupePos.x}px`,
              top: `${loupePos.y}px`,
              transform: 'translate(-50%, -50%)',
            }}
            onMouseDown={handleMouseDownLoupe}
            className="absolute z-20 w-44 h-44 rounded-full border-4 border-amber-400 bg-slate-950 shadow-2xl overflow-hidden cursor-move ring-4 ring-black/40"
          >
            {/* Loupe Header Pin */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-amber-500/90 text-black text-[9px] font-extrabold px-2 py-0.5 rounded-full z-30 shadow">
              3× ZOOM LOUPE
            </div>

            {/* Magnified Sub-SVG */}
            <div className="w-full h-full relative">
              <svg
                viewBox={`${(loupePos.x / (containerRef.current?.clientWidth || 800)) * svgWidth - 40} ${
                  (loupePos.y / (containerRef.current?.clientHeight || 220)) * svgHeight - 40
                } 80 80`}
                className="w-full h-full"
              >
                {/* Re-render background */}
                <rect width={svgWidth} height={svgHeight} fill="#0F172A" />

                {/* Re-render Object */}
                <rect
                  x={objectStartPx}
                  y={rulerY - 46}
                  width={objectLength * cmToPx}
                  height="34"
                  rx="3"
                  fill="url(#metalGrad)"
                  stroke="#475569"
                  strokeWidth="1.5"
                />

                {/* Re-render Ruler */}
                <rect
                  x={rulerX - 10}
                  y={rulerY}
                  width={rulerWidth + 20}
                  height={rulerHeight}
                  rx="6"
                  fill="url(#rulerGrad)"
                  stroke="#B45309"
                  strokeWidth="2"
                />

                {/* Re-render Ticks */}
                {ticks.map((t, idx) => (
                  <g key={`loupe-tick-${idx}`}>
                    <line
                      x1={t.x}
                      y1={rulerY}
                      x2={t.x}
                      y2={rulerY + t.height}
                      stroke="#78350F"
                      strokeWidth={t.isMajor ? 2.5 : 1.5}
                    />
                    {t.label && (
                      <text
                        x={t.x}
                        y={rulerY + 44}
                        textAnchor="middle"
                        className="text-[13px] font-black fill-amber-950"
                      >
                        {t.label}
                      </text>
                    )}
                  </g>
                ))}

                {/* Re-render Guide line only if showGuideLine is enabled */}
                {showGuideLine && (
                  <line
                    x1={objectEndPx}
                    y1={rulerY - 60}
                    x2={objectEndPx}
                    y2={rulerY + 35}
                    stroke="#38BDF8"
                    strokeWidth="1.5"
                    strokeDasharray="3 2"
                  />
                )}
              </svg>

              {/* Crosshair lines for exact reading */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-full h-[1px] bg-red-500/60" />
                <div className="absolute h-full w-[1px] bg-red-500/60" />
                <div className="absolute w-3 h-3 rounded-full border border-red-400" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Helper Footer Bar */}
      <div className="mt-2 flex flex-wrap items-center justify-between text-xs text-slate-500 px-1 gap-2 border-t border-slate-100 pt-2">
        <div className="flex items-center gap-2">
          <span className="text-slate-700 font-semibold">
            Measurement Tip:
          </span>
          <span>
            {!showGuideLine ? (
              <>
                Sight scale directly from the sample's edges. Estimate <strong>1 decimal place beyond</strong> the smallest scale mark.
              </>
            ) : isRulerMovable ? (
              <>
                Object spans from <strong className="text-slate-800">{alignedStartCm} cm</strong> to <strong className="text-slate-800">{alignedEndCm} cm</strong>. (Length = {alignedEndCm} − {alignedStartCm} = <strong>{objectLength.toFixed(scale.expectedDecimals)} cm</strong>)
              </>
            ) : (
              <>
                Find closest mark ({scale.minorTickInterval} {scale.unit}), then estimate <strong>1 decimal place further</strong>.
              </>
            )}
          </span>
        </div>
        {interactive && onLengthChange && (
          <span className="text-indigo-600 font-semibold flex items-center gap-1">
            <MoveHorizontal className="w-3.5 h-3.5" /> Drag right blue handle to adjust sample length
          </span>
        )}
      </div>
    </div>
  );
};

