import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Check,
  AlertTriangle,
  Droplet,
  Ruler,
  FlaskConical,
  LayoutGrid,
  Table as TableIcon,
  ZoomIn,
  CheckCircle2,
  Info,
} from 'lucide-react';

interface ResolutionCheatSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

interface InstrumentExample {
  id: string;
  name: string;
  category: 'ruler' | 'cylinder' | 'beaker';
  icon: typeof Ruler;
  finestTick: string;
  finestTickValue: number;
  unit: string;
  estimatedPlace: string;
  exampleValue: string;
  sigFigs: string;
  certainPart: string;
  estimatedPart: string;
  readingExplanation: string;
  commonMistake: string;
  keyRule: string;
  renderDiagram: (isExpanded?: boolean) => React.ReactNode;
}

export const ResolutionCheatSheet: React.FC<ResolutionCheatSheetProps> = ({ isOpen, onClose }) => {
  const [viewMode, setViewMode] = useState<'gallery' | 'table'>('gallery');
  const [selectedExampleId, setSelectedExampleId] = useState<string | null>(null);

  if (!isOpen) return null;

  const instrumentExamples: InstrumentExample[] = [
    {
      id: 'standard-ruler',
      name: 'Standard Metric Ruler',
      category: 'ruler',
      icon: Ruler,
      finestTick: '0.1 cm (1 mm)',
      finestTickValue: 0.1,
      unit: 'cm',
      estimatedPlace: 'Hundredths (0.01 cm)',
      exampleValue: '5.74 cm',
      sigFigs: '3 Significant Figures',
      certainPart: '5.7',
      estimatedPart: '4',
      readingExplanation:
        'The object passes the 5.7 cm line and reaches about 4/10ths of the distance toward 5.8 cm.',
      commonMistake: 'Writing "5.7 cm" (misses the required estimated digit) or "5.742 cm" (over-estimating two decimal places).',
      keyRule: 'Because lines are every 0.1 cm, always record 2 decimal places in centimeters.',
      renderDiagram: (isExpanded = false) => (
        <div className={`w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 sm:p-3 relative select-none ${isExpanded ? 'h-52' : 'h-36'}`}>
          <svg viewBox="0 0 400 120" className="w-full h-full">
            {/* Ruler Body */}
            <rect x="10" y="25" width="380" height="70" rx="4" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" />
            
            {/* Measured Specimen (Copper Strip) */}
            <rect x="10" y="10" width="250" height="15" rx="2" fill="#B45309" stroke="#78350F" strokeWidth="1" />
            <text x="75" y="21" fill="#FFFFFF" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
              Metal Specimen Strip (Length = 5.74 cm)
            </text>

            {/* Scale markings from 5.0 to 6.2 */}
            {/* 5.0 cm is at x=50, 6.0 cm is at x=310 (spacing: 260px = 1.0cm => 26px per 0.1cm) */}
            {/* 5.0 cm = 50px, 5.74 cm = 50 + 7.4 * 26 = 50 + 192.4 = 242.4px */}
            {Array.from({ length: 13 }).map((_, idx) => {
              const tickVal = 5.0 + idx * 0.1;
              const xPos = 50 + idx * 26;
              const isMajor = idx % 10 === 0;
              const isMid = idx % 5 === 0 && !isMajor;
              const tickH = isMajor ? 32 : isMid ? 22 : 14;

              return (
                <g key={idx}>
                  <line
                    x1={xPos}
                    y1={25}
                    x2={xPos}
                    y2={25 + tickH}
                    stroke={isMajor ? '#78350F' : '#92400E'}
                    strokeWidth={isMajor ? 2 : 1}
                  />
                  {isMajor && (
                    <text x={xPos} y={75} fill="#78350F" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                      {Math.round(tickVal)}
                    </text>
                  )}
                  {isMid && (
                    <text x={xPos} y={62} fill="#B45309" fontSize="8" fontWeight="600" textAnchor="middle" fontFamily="sans-serif">
                      .5
                    </text>
                  )}
                </g>
              );
            })}

            {/* Specimen End Vertical Guideline (at 5.74 cm -> x=242.4) */}
            <line x1="242.4" y1="5" x2="242.4" y2="105" stroke="#DC2626" strokeWidth="1.5" strokeDasharray="3,2" />
            
            {/* Highlighting 5.7 Line and 5.8 Line */}
            <line x1="232" y1="25" x2="232" y2="52" stroke="#4F46E5" strokeWidth="2.5" />
            <line x1="258" y1="25" x2="258" y2="52" stroke="#64748B" strokeWidth="1.5" />

            {/* Visual Callout Annotations */}
            <g transform="translate(180, 85)">
              <rect x="0" y="0" width="170" height="28" rx="4" fill="#FFFFFF" stroke="#4F46E5" strokeWidth="1" />
              <text x="6" y="12" fill="#4F46E5" fontSize="8.5" fontWeight="bold" fontFamily="monospace">
                Certain: 5.7 cm (line)
              </text>
              <text x="6" y="22" fill="#D97706" fontSize="8.5" fontWeight="bold" fontFamily="monospace">
                Est: +0.04 cm → 5.74 cm
              </text>
            </g>

            {/* Indicator Arrow */}
            <polygon points="242.4,10 238,3 246,3" fill="#DC2626" />
          </svg>
        </div>
      ),
    },
    {
      id: 'coarse-ruler',
      name: 'Coarse 1 cm Ruler',
      category: 'ruler',
      icon: Ruler,
      finestTick: '1.0 cm',
      finestTickValue: 1.0,
      unit: 'cm',
      estimatedPlace: 'Tenths (0.1 cm)',
      exampleValue: '5.7 cm',
      sigFigs: '2 Significant Figures',
      certainPart: '5',
      estimatedPart: '7',
      readingExplanation:
        'The object passes the 5 cm mark and is estimated about 7/10ths of the way to 6 cm.',
      commonMistake: 'Writing "5.74 cm" (inventing a hundredths place that this coarse instrument cannot support).',
      keyRule: 'Because lines are every 1 cm, you only estimate one decimal place (tenths).',
      renderDiagram: (isExpanded = false) => (
        <div className={`w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 sm:p-3 relative select-none ${isExpanded ? 'h-52' : 'h-36'}`}>
          <svg viewBox="0 0 400 120" className="w-full h-full">
            {/* Ruler Body */}
            <rect x="10" y="25" width="380" height="70" rx="4" fill="#FEF9C3" stroke="#CA8A04" strokeWidth="1.5" />
            
            {/* Measured Specimen */}
            <rect x="10" y="10" width="222" height="15" rx="2" fill="#475569" stroke="#1E293B" strokeWidth="1" />
            <text x="70" y="21" fill="#FFFFFF" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
              Zinc Ribbon (Length = 5.7 cm)
            </text>

            {/* Coarse Markings only every 1.0 cm (no mm ticks!) */}
            {/* 3 cm = 30px, 4 cm = 100px, 5 cm = 170px, 6 cm = 240px, 7 cm = 310px */}
            {[3, 4, 5, 6, 7].map((num, idx) => {
              const xPos = 30 + idx * 70;
              return (
                <g key={num}>
                  <line x1={xPos} y1={25} x2={xPos} y2={60} stroke="#854D0E" strokeWidth="2.5" />
                  <text x={xPos} y={80} fill="#854D0E" fontSize="14" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                    {num} cm
                  </text>
                </g>
              );
            })}

            {/* Specimen Guideline at 5.7 cm -> 5cm is 170px, 6cm is 240px -> 170 + 0.7*70 = 219px */}
            <line x1="219" y1="5" x2="219" y2="105" stroke="#DC2626" strokeWidth="1.5" strokeDasharray="3,2" />
            <polygon points="219,10 215,3 223,3" fill="#DC2626" />

            {/* Visual Callout */}
            <g transform="translate(195, 85)">
              <rect x="0" y="0" width="180" height="28" rx="4" fill="#FFFFFF" stroke="#CA8A04" strokeWidth="1" />
              <text x="6" y="12" fill="#1E293B" fontSize="8.5" fontWeight="bold" fontFamily="monospace">
                Certain: 5 cm (marked)
              </text>
              <text x="6" y="22" fill="#D97706" fontSize="8.5" fontWeight="bold" fontFamily="monospace">
                Estimated: ~0.7 cm → 5.7 cm
              </text>
            </g>
          </svg>
        </div>
      ),
    },
    {
      id: '10ml-cylinder',
      name: '10 mL Graduated Cylinder',
      category: 'cylinder',
      icon: Droplet,
      finestTick: '0.1 mL',
      finestTickValue: 0.1,
      unit: 'mL',
      estimatedPlace: 'Hundredths (0.01 mL)',
      exampleValue: '6.82 mL',
      sigFigs: '3 Significant Figures',
      certainPart: '6.8',
      estimatedPart: '2',
      readingExplanation:
        'The lowest point of the concave meniscus is above 6.8 mL, estimated 2/10ths toward 6.9 mL.',
      commonMistake: 'Reading from the top edges of the meniscus curve instead of the bottom center point.',
      keyRule: 'Always read at the center bottom of the meniscus at direct eye-level.',
      renderDiagram: (isExpanded = false) => (
        <div className={`w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 sm:p-3 relative select-none ${isExpanded ? 'h-52' : 'h-36'}`}>
          <svg viewBox="0 0 400 120" className="w-full h-full">
            {/* Cylinder Glass Walls */}
            <rect x="80" y="8" width="100" height="104" rx="6" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="2" />
            
            {/* Blue Liquid Column with Concave Meniscus at 6.82 mL */}
            {/* 6.0 mL is at y=95, 7.0 mL is at y=25 (height 70px for 1.0 mL => 7px per 0.1 mL) */}
            {/* 6.82 mL is at y = 95 - 8.2*7 = 95 - 57.4 = 37.6px */}
            <path
              d="M 82 110 L 82 32 Q 130 42, 178 32 L 178 110 Z"
              fill="#38BDF8"
              fillOpacity="0.4"
              stroke="#0284C7"
              strokeWidth="1"
            />
            {/* Meniscus Curve Line */}
            <path
              d="M 82 32 Q 130 44, 178 32"
              fill="none"
              stroke="#0369A1"
              strokeWidth="2.5"
            />

            {/* Cylinder Markings (6.0 to 7.0 mL) */}
            {Array.from({ length: 11 }).map((_, idx) => {
              const val = 6.0 + idx * 0.1;
              const yPos = 95 - idx * 7;
              const isMajor = idx % 10 === 0 || idx % 5 === 0;
              const tickW = isMajor ? 24 : 12;

              return (
                <g key={idx}>
                  <line x1={80} y1={yPos} x2={80 + tickW} stroke="#334155" strokeWidth={isMajor ? 2 : 1} />
                  {isMajor && (
                    <text x={72} y={yPos + 3.5} fill="#0F172A" fontSize="9" fontWeight="bold" textAnchor="end" fontFamily="sans-serif">
                      {val.toFixed(1)}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Meniscus bottom indicator line at y=37.6 */}
            <line x1="60" y1="38" x2="220" y2="38" stroke="#DC2626" strokeWidth="1.5" strokeDasharray="3,2" />
            <polygon points="220,38 226,34 226,42" fill="#DC2626" />

            {/* Eye Level Indicator */}
            <text x="235" y="32" fill="#DC2626" fontSize="8.5" fontWeight="bold" fontFamily="sans-serif">
              👁️ Bottom of Meniscus
            </text>

            {/* Breakdown Callout */}
            <g transform="translate(225, 45)">
              <rect x="0" y="0" width="165" height="52" rx="4" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1" />
              <text x="6" y="14" fill="#0369A1" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                10 mL Cylinder (0.1 mL ticks)
              </text>
              <text x="6" y="28" fill="#334155" fontSize="8.5" fontFamily="monospace">
                Certain: 6.8 mL (visible line)
              </text>
              <text x="6" y="40" fill="#D97706" fontSize="8.5" fontWeight="bold" fontFamily="monospace">
                Estimated: +0.02 mL
              </text>
              <text x="6" y="49" fill="#047857" fontSize="9" fontWeight="bold" fontFamily="monospace">
                Reading = 6.82 mL
              </text>
            </g>
          </svg>
        </div>
      ),
    },
    {
      id: '100ml-cylinder',
      name: '50 mL / 100 mL Cylinder',
      category: 'cylinder',
      icon: Droplet,
      finestTick: '1.0 mL',
      finestTickValue: 1.0,
      unit: 'mL',
      estimatedPlace: 'Tenths (0.1 mL)',
      exampleValue: '42.5 mL',
      sigFigs: '3 Significant Figures',
      certainPart: '42',
      estimatedPart: '5',
      readingExplanation:
        'The meniscus sits halfway between the 42 mL line and 43 mL line.',
      commonMistake: 'Omitting the decimal place (e.g. writing "42 mL" or "43 mL" without estimating tenths).',
      keyRule: 'With 1 mL subdivisions, record exactly 1 decimal place (tenths of a mL).',
      renderDiagram: (isExpanded = false) => (
        <div className={`w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 sm:p-3 relative select-none ${isExpanded ? 'h-52' : 'h-36'}`}>
          <svg viewBox="0 0 400 120" className="w-full h-full">
            {/* Cylinder Body */}
            <rect x="80" y="8" width="110" height="104" rx="6" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="2" />
            
            {/* Liquid & Meniscus at 42.5 mL */}
            {/* 40 mL at y=95, 45 mL at y=25 (70px for 5 mL => 14px per 1 mL) */}
            {/* 42.5 mL is at y = 95 - 2.5*14 = 95 - 35 = 60px */}
            <path
              d="M 82 110 L 82 52 Q 135 66, 188 52 L 188 110 Z"
              fill="#A78BFA"
              fillOpacity="0.4"
              stroke="#7C3AED"
              strokeWidth="1"
            />
            <path
              d="M 82 52 Q 135 66, 188 52"
              fill="none"
              stroke="#6D28D9"
              strokeWidth="2.5"
            />

            {/* Markings every 1 mL (40 to 45) */}
            {[40, 41, 42, 43, 44, 45].map((val, idx) => {
              const yPos = 95 - idx * 14;
              const isMajor = val % 5 === 0;
              const tickW = isMajor ? 26 : 14;

              return (
                <g key={val}>
                  <line x1={80} y1={yPos} x2={80 + tickW} stroke="#1E293B" strokeWidth={isMajor ? 2 : 1} />
                  <text x={70} y={yPos + 3.5} fill="#1E293B" fontSize="9" fontWeight={isMajor ? 'bold' : 'normal'} textAnchor="end" fontFamily="sans-serif">
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Meniscus bottom indicator line at y=60 */}
            <line x1="60" y1="60" x2="225" y2="60" stroke="#DC2626" strokeWidth="1.5" strokeDasharray="3,2" />
            
            {/* Annotation */}
            <g transform="translate(225, 40)">
              <rect x="0" y="0" width="165" height="52" rx="4" fill="#FFFFFF" stroke="#7C3AED" strokeWidth="1" />
              <text x="6" y="14" fill="#6D28D9" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                100 mL Cylinder (1 mL ticks)
              </text>
              <text x="6" y="28" fill="#334155" fontSize="8.5" fontFamily="monospace">
                Certain: 42 mL (passed line)
              </text>
              <text x="6" y="40" fill="#D97706" fontSize="8.5" fontWeight="bold" fontFamily="monospace">
                Estimated: +0.5 mL (halfway)
              </text>
              <text x="6" y="49" fill="#047857" fontSize="9" fontWeight="bold" fontFamily="monospace">
                Reading = 42.5 mL
              </text>
            </g>
          </svg>
        </div>
      ),
    },
    {
      id: '25ml-cylinder',
      name: '25 mL Cylinder (0.2 mL)',
      category: 'cylinder',
      icon: Droplet,
      finestTick: '0.2 mL',
      finestTickValue: 0.2,
      unit: 'mL',
      estimatedPlace: 'Hundredths (~0.05 mL)',
      exampleValue: '14.50 mL',
      sigFigs: '4 Significant Figures',
      certainPart: '14.4',
      estimatedPart: '5',
      readingExplanation:
        'The meniscus falls halfway between the 14.4 mL and 14.6 mL marks.',
      commonMistake: 'Confusing 0.2 mL ticks with 0.1 mL ticks and miscounting the lines.',
      keyRule: 'Count tick values in steps of two (14.0, 14.2, 14.4, 14.6, 14.8, 15.0).',
      renderDiagram: (isExpanded = false) => (
        <div className={`w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 sm:p-3 relative select-none ${isExpanded ? 'h-52' : 'h-36'}`}>
          <svg viewBox="0 0 400 120" className="w-full h-full">
            {/* Cylinder Glass */}
            <rect x="80" y="8" width="105" height="104" rx="6" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="2" />
            
            {/* Meniscus at 14.50 mL */}
            {/* 14.0 mL at y=95, 15.0 mL at y=25 (70px for 1.0 mL => 14px per 0.2 mL) */}
            {/* 14.50 mL is at y = 95 - 2.5*14 = 60px */}
            <path
              d="M 82 110 L 82 52 Q 132 64, 183 52 L 183 110 Z"
              fill="#34D399"
              fillOpacity="0.4"
              stroke="#059669"
              strokeWidth="1"
            />
            <path
              d="M 82 52 Q 132 64, 183 52"
              fill="none"
              stroke="#047857"
              strokeWidth="2.5"
            />

            {/* 0.2 mL markings (14.0, 14.2, 14.4, 14.6, 14.8, 15.0) */}
            {[14.0, 14.2, 14.4, 14.6, 14.8, 15.0].map((val, idx) => {
              const yPos = 95 - idx * 14;
              const isMajor = val === 14.0 || val === 15.0;
              const tickW = isMajor ? 26 : 14;

              return (
                <g key={val}>
                  <line x1={80} y1={yPos} x2={80 + tickW} stroke="#1E293B" strokeWidth={isMajor ? 2 : 1} />
                  <text x={70} y={yPos + 3.5} fill="#1E293B" fontSize="8.5" fontWeight={isMajor ? 'bold' : 'normal'} textAnchor="end" fontFamily="sans-serif">
                    {val.toFixed(1)}
                  </text>
                </g>
              );
            })}

            {/* Guideline at 14.50 mL */}
            <line x1="60" y1="60" x2="225" y2="60" stroke="#DC2626" strokeWidth="1.5" strokeDasharray="3,2" />

            {/* Annotation */}
            <g transform="translate(225, 40)">
              <rect x="0" y="0" width="165" height="52" rx="4" fill="#FFFFFF" stroke="#059669" strokeWidth="1" />
              <text x="6" y="14" fill="#047857" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                25 mL Cylinder (0.2 mL ticks)
              </text>
              <text x="6" y="28" fill="#334155" fontSize="8.5" fontFamily="monospace">
                Between 14.4 and 14.6 lines
              </text>
              <text x="6" y="40" fill="#D97706" fontSize="8.5" fontWeight="bold" fontFamily="monospace">
                Estimated midpoint = .50
              </text>
              <text x="6" y="49" fill="#047857" fontSize="9" fontWeight="bold" fontFamily="monospace">
                Reading = 14.50 mL
              </text>
            </g>
          </svg>
        </div>
      ),
    },
    {
      id: '250ml-beaker',
      name: '250 mL Laboratory Beaker',
      category: 'beaker',
      icon: FlaskConical,
      finestTick: '50 mL (Coarse)',
      finestTickValue: 50,
      unit: 'mL',
      estimatedPlace: 'Nearest 10-25 mL',
      exampleValue: '~175 mL',
      sigFigs: 'Coarse Estimate (±5%)',
      certainPart: '150',
      estimatedPart: '~25',
      readingExplanation:
        'Liquid sits midway between the 150 mL and 200 mL lines. Beakers only provide coarse volume estimates.',
      commonMistake: 'Attempting to read decimals like "175.4 mL" on a beaker or using a beaker for titrations.',
      keyRule: '⚠️ Beakers are for mixing and heating reactions, NOT quantitative volumetric measurement!',
      renderDiagram: (isExpanded = false) => (
        <div className={`w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 sm:p-3 relative select-none ${isExpanded ? 'h-52' : 'h-36'}`}>
          <svg viewBox="0 0 400 120" className="w-full h-full">
            {/* Beaker Outline with Spout */}
            <path
              d="M 60 15 L 75 25 L 75 105 Q 75 112, 85 112 L 180 112 Q 190 112, 190 105 L 190 25 L 195 25"
              fill="#F8FAFC"
              stroke="#64748B"
              strokeWidth="2"
            />

            {/* Beaker Liquid at ~175 mL (between 150 and 200 marks) */}
            <path
              d="M 77 110 L 77 55 Q 132 58, 188 55 L 188 110 Z"
              fill="#F59E0B"
              fillOpacity="0.3"
              stroke="#D97706"
              strokeWidth="1"
            />
            <line x1="77" y1="55" x2="188" y2="55" stroke="#B45309" strokeWidth="2" />

            {/* Sparse Beaker Markings: 50, 100, 150, 200, 250 */}
            {[50, 100, 150, 200, 250].map((val, idx) => {
              const yPos = 100 - idx * 18;
              return (
                <g key={val}>
                  <line x1={75} y1={yPos} x2={95} stroke="#334155" strokeWidth="1.5" />
                  <text x={100} y={yPos + 3.5} fill="#334155" fontSize="8" fontWeight="bold" fontFamily="sans-serif">
                    {val} mL
                  </text>
                </g>
              );
            })}

            {/* Approximate Indicator */}
            <line x1="50" y1="55" x2="225" y2="55" stroke="#D97706" strokeWidth="1.5" strokeDasharray="3,2" />

            {/* Beaker Warning Callout */}
            <g transform="translate(225, 35)">
              <rect x="0" y="0" width="165" height="58" rx="4" fill="#FEF3C7" stroke="#D97706" strokeWidth="1" />
              <text x="6" y="14" fill="#92400E" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                ⚠️ Beaker Coarse Estimate
              </text>
              <text x="6" y="27" fill="#78350F" fontSize="8" fontFamily="sans-serif">
                Graduations: 50 mL spacing
              </text>
              <text x="6" y="39" fill="#B45309" fontSize="8.5" fontWeight="bold" fontFamily="monospace">
                Estimate: ~175 mL (±5% error)
              </text>
              <text x="6" y="50" fill="#DC2626" fontSize="7.5" fontWeight="bold" fontFamily="sans-serif">
                Never use for titrations!
              </text>
            </g>
          </svg>
        </div>
      ),
    },
  ];

  return (
    <div
      id="resolution-cheat-sheet-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn"
    >
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
              <BookOpen className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                Scale Resolution & Measurement Reference Chart
                <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200 font-semibold">
                  With Picture Examples
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Visual anatomy and decimal place rules for standard chemistry laboratory glassware and instruments
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="bg-slate-100 p-0.5 rounded-lg flex items-center border border-slate-200">
              <button
                id="toggle-gallery-view-btn"
                onClick={() => setViewMode('gallery')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
                  viewMode === 'gallery'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" /> Gallery
              </button>
              <button
                id="toggle-table-view-btn"
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
                  viewMode === 'table'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" /> Table
              </button>
            </div>

            <button
              id="close-cheat-sheet-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              aria-label="Close Reference Chart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/50">
          {/* The Golden Rule Summary Callout */}
          <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5 uppercase tracking-wider">
                👑 The Universal Chemistry Resolution Rule
              </span>
              <span className="text-[11px] font-semibold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-200">
                Known Ticks + Exactly ONE Estimated Digit
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-900">
              Recorded Measurement = [All Certain Digits Read From Visible Lines] + [Exactly ONE Estimated Digit Between Lines]
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every analog reading must terminate with <strong>one estimated place value</strong>. If an object lands squarely on a major tick mark, never drop the zero—record it (e.g. <strong>5.00 cm</strong>, not 5 cm) to preserve the known resolution and scale detail of your instrument.
            </p>
          </div>

          {/* VIEW MODE: VISUAL GALLERY (Cards with full Picture Examples) */}
          {viewMode === 'gallery' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <span>📸 Visual Picture Examples & Scale Graduations</span>
                  <span className="text-slate-400 font-normal text-[11px] lowercase">
                    (6 instrument archetypes)
                  </span>
                </h4>
                <span className="text-xs text-slate-500">
                  Click any card to inspect full details
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {instrumentExamples.map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedExampleId === item.id;

                  return (
                    <div
                      key={item.id}
                      id={`instrument-card-${item.id}`}
                      onClick={() => setSelectedExampleId(isSelected ? null : item.id)}
                      className={`bg-white rounded-xl border p-4 shadow-xs space-y-3 cursor-pointer transition hover:border-indigo-300 ${
                        isSelected ? 'ring-2 ring-indigo-600 border-transparent' : 'border-slate-200'
                      }`}
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className={`p-1.5 rounded-lg border text-xs ${
                            item.category === 'ruler'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : item.category === 'cylinder'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </span>
                          <div>
                            <h5 className="text-sm font-bold text-slate-900">{item.name}</h5>
                            <span className="text-[11px] text-slate-500 font-mono">
                              Smallest division: <strong className="text-indigo-700">{item.finestTick}</strong>
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 block">
                            {item.exampleValue}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {item.sigFigs}
                          </span>
                        </div>
                      </div>

                      {/* Picture Example Diagram */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                          <span>Scale Illustration:</span>
                          <span className="text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 text-[10px]">
                            <ZoomIn className="w-3 h-3" /> Zoom diagram
                          </span>
                        </div>
                        {item.renderDiagram(isSelected)}
                      </div>

                      {/* Anatomy Breakdown */}
                      <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-[11px]">
                          <span className="text-slate-500 block">Certain Digits:</span>
                          <strong className="text-slate-900 font-mono">{item.certainPart} {item.unit}</strong>
                          <span className="text-[10px] text-slate-500 block mt-0.5">From marked lines</span>
                        </div>
                        <div className="bg-amber-50/60 p-2 rounded-lg border border-amber-200 text-[11px]">
                          <span className="text-amber-800 block">Estimated Digit:</span>
                          <strong className="text-amber-900 font-mono">.{item.estimatedPart} {item.unit}</strong>
                          <span className="text-[10px] text-amber-700 block mt-0.5">{item.estimatedPlace}</span>
                        </div>
                      </div>

                      {/* Key Rule & Notes */}
                      <div className="text-[11px] text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <p>
                          💡 <strong className="text-slate-800">Rule:</strong> {item.keyRule}
                        </p>
                        <p className="text-[10px] text-rose-600">
                          ⚠️ <strong>Avoid:</strong> {item.commonMistake}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW MODE: FULL COMPARISON TABLE WITH PICTURE THUMBNAILS */}
          {viewMode === 'table' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                📊 Complete Scale Resolution Comparison Chart
              </h4>
              <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs bg-white">
                <table className="w-full text-xs text-left text-slate-700">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Instrument</th>
                      <th className="p-3 w-48">Picture Example</th>
                      <th className="p-3">Smallest Mark</th>
                      <th className="p-3">Estimated Place</th>
                      <th className="p-3">Example Reading</th>
                      <th className="p-3">Scientific Takeaway</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {instrumentExamples.map((item) => {
                      const Icon = item.icon;
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-3 align-top">
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              <Icon className="w-4 h-4 text-indigo-600 shrink-0" />
                              <span>{item.name}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
                              Unit: {item.unit}
                            </span>
                          </td>
                          <td className="p-2 align-top">
                            <div className="w-44">
                              {item.renderDiagram(false)}
                            </div>
                          </td>
                          <td className="p-3 align-top font-mono text-indigo-700 font-semibold">
                            {item.finestTick}
                          </td>
                          <td className="p-3 align-top font-mono text-slate-600">
                            {item.estimatedPlace}
                          </td>
                          <td className="p-3 align-top font-mono">
                            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                              {item.exampleValue}
                            </span>
                            <span className="text-[10px] text-slate-500 block mt-1 font-sans">
                              {item.sigFigs}
                            </span>
                          </td>
                          <td className="p-3 align-top text-[11px] text-slate-600 space-y-1">
                            <p>{item.readingExplanation}</p>
                            <p className="text-[10px] text-amber-800 font-medium">
                              💡 {item.keyRule}
                            </p>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3 Core Rules Quick Checklist */}
          <div className="grid sm:grid-cols-3 gap-3 text-xs pt-2">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <Check className="w-4 h-4" /> 1. Trailing Zeros Matter
              </span>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                If an object touches a mark exactly, record the estimated zero (e.g. <strong>4.00 cm</strong>, NOT 4 cm) to declare the high resolution.
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
              <span className="font-bold text-indigo-700 flex items-center gap-1">
                <Droplet className="w-4 h-4" /> 2. Meniscus Alignment
              </span>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Always read the <strong>lowest point</strong> of the concave water surface with your eyes directly horizontal with the meniscus.
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
              <span className="font-bold text-amber-700 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" /> 3. Beaker Limitation
              </span>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Beakers are for heating, mixing, and reactions. Never use them for quantitative stoichiometry titrations!
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-indigo-600" />
            Tip: Practice measuring with these scales in the Ruler and Cylinder lab tabs.
          </div>
          <button
            id="return-to-lab-btn"
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
          >
            Got it! Return to Lab
          </button>
        </div>
      </div>
    </div>
  );
};
