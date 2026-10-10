export type TabMode = 'investigation' | 'rulers' | 'cylinders' | 'beakers' | 'challenge' | 'reflection';

export interface ReflectionQuestion {
  id: string;
  category: string;
  title: string;
  question: string;
  context: string;
  guidingQuestions: string[];
  keyVocabulary: string[];
  exemplarConcepts?: string[];
}

export interface RulerScaleConfig {
  id: string;
  name: string;
  unit: 'cm' | 'mm';
  majorTickInterval: number; // e.g., 1 cm
  minorTickInterval: number; // e.g., 0.1 cm (1 mm) or 0.5 cm or 1 cm
  minVal: number;
  maxVal: number;
  expectedDecimals: number; // For cm: 1 mm tick -> 2 decimals (0.01 cm); 1 cm tick -> 1 decimal (0.1 cm)
  description: string;
  estimatedPlaceName: string; // e.g., "hundredths of a centimeter" or "tenths of a millimeter"
}

export interface ChemistryObject {
  id: string;
  name: string;
  description: string;
  color: string;
  texture: string;
  defaultLength: number; // in cm
  icon: string;
}

export interface CylinderScaleConfig {
  id: string;
  name: string;
  capacity: number; // mL
  majorTickInterval: number; // e.g., 10 mL
  minorTickInterval: number; // e.g., 1 mL or 0.1 mL or 0.2 mL
  expectedDecimals: number; // e.g., 1 mL minor -> 1 decimal (0.1 mL); 0.1 mL minor -> 2 decimals (0.01 mL)
  estimatedPlaceName: string;
  description: string;
}

export interface BeakerScaleConfig {
  id: string;
  name: string;
  capacity: number; // mL
  majorTickInterval: number; // e.g., 50 mL
  minorTickInterval: number; // e.g., 20 mL or 50 mL
  expectedDecimals: number; // 0 (estimated to nearest 5 or 10 mL)
  estimatedPlaceName: string;
  description: string;
  uncertaintyPercent: number; // e.g. 5%
}

export interface MeasurementValidation {
  isValid: boolean;
  score: number; // 0 to 100
  feedbackType: 'correct' | 'under_resolved' | 'over_resolved' | 'value_off' | 'missing_unit' | 'wrong_unit' | 'empty';
  message: string;
  userValue: number | null;
  userUnit: string | null;
  expectedMin: number;
  expectedMax: number;
  expectedDecimals: number;
  actualDecimals: number;
  certainDigits: string;
  estimatedDigit: string;
  properFormatExample: string;
  explanation: string;
}

export interface ChallengeItem {
  id: string;
  instrumentType: 'ruler' | 'cylinder' | 'beaker';
  title: string;
  instrumentName: string;
  scaleDescription: string;
  minorTickValue: number;
  unit: string;
  expectedDecimals: number;
  actualValue: number;
  offsetStart?: number; // For non-zero ruler start
  liquidColor?: string;
  objectName?: string;
  scenarioContext?: string;
  tip: string;
}

export interface StudentStats {
  completedChallenges: number;
  totalScore: number;
  streak: number;
  bestStreak: number;
  badges: string[];
  history: {
    challengeId: string;
    instrument: string;
    userAnswer: string;
    isCorrect: boolean;
    timestamp: number;
  }[];
}
