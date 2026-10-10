import { MeasurementValidation } from '../types';

export function parseMeasurementString(input: string): {
  rawNumStr: string | null;
  numValue: number | null;
  decimals: number;
  unit: string | null;
} {
  const trimmed = input.trim();
  if (!trimmed) {
    return { rawNumStr: null, numValue: null, decimals: 0, unit: null };
  }

  // Regex to capture numeric part and optional unit
  const match = trimmed.match(/^([-+]?[0-9]*\.?[0-9]+)\s*([a-zA-Z%°µ\^3]*)$/);
  if (!match) {
    return { rawNumStr: null, numValue: null, decimals: 0, unit: null };
  }

  const rawNumStr = match[1];
  const numValue = parseFloat(rawNumStr);
  const unit = match[2] ? match[2].trim() : null;

  // Determine decimal places from the raw string
  let decimals = 0;
  if (rawNumStr.includes('.')) {
    const parts = rawNumStr.split('.');
    decimals = parts[1] ? parts[1].length : 0;
  }

  return { rawNumStr, numValue, decimals, unit };
}

export function validateMeasurement(
  userInput: string,
  actualTrueValue: number,
  expectedDecimals: number,
  minorTickInterval: number,
  expectedUnit: string,
  instrumentName: string
): MeasurementValidation {
  const parsed = parseMeasurementString(userInput);

  if (!userInput.trim() || parsed.numValue === null) {
    return {
      isValid: false,
      score: 0,
      feedbackType: 'empty',
      message: 'Please enter a measurement value with units (e.g., 4.52 cm or 32.5 mL).',
      userValue: null,
      userUnit: null,
      expectedMin: actualTrueValue - minorTickInterval * 0.3,
      expectedMax: actualTrueValue + minorTickInterval * 0.3,
      expectedDecimals,
      actualDecimals: 0,
      certainDigits: '',
      estimatedDigit: '',
      properFormatExample: actualTrueValue.toFixed(expectedDecimals) + ' ' + expectedUnit,
      explanation: `On this ${instrumentName}, the smallest line interval is ${minorTickInterval} ${expectedUnit}. Therefore, your reading must be recorded to ${expectedDecimals} decimal place${expectedDecimals === 1 ? '' : 's'}.`,
    };
  }

  // Normalize unit matching (e.g. ml, mL, ML, cm, CM, mm)
  const normalizedExpectedUnit = expectedUnit.toLowerCase();
  const normalizedUserUnit = (parsed.unit || '').toLowerCase();
  const hasUnit = Boolean(parsed.unit);
  const unitMatches = hasUnit && (
    normalizedUserUnit === normalizedExpectedUnit ||
    (normalizedExpectedUnit === 'ml' && normalizedUserUnit === 'cm3') ||
    (normalizedExpectedUnit === 'cm' && normalizedUserUnit === 'centimeters') ||
    (normalizedExpectedUnit === 'mm' && normalizedUserUnit === 'millimeters')
  );

  const tolerance = Math.max(minorTickInterval * 0.35, Math.pow(10, -expectedDecimals) * 3);
  const isValueClose = Math.abs(parsed.numValue - actualTrueValue) <= tolerance;

  // Calculate certain digits vs estimated digit
  const formattedVal = actualTrueValue.toFixed(expectedDecimals);
  const integerPart = formattedVal.split('.')[0];
  const decimalPart = formattedVal.split('.')[1] || '';
  
  let certainDigits = '';
  let estimatedDigit = '';

  if (expectedDecimals === 0) {
    certainDigits = integerPart.slice(0, -1);
    estimatedDigit = integerPart.slice(-1);
  } else if (expectedDecimals === 1) {
    certainDigits = integerPart;
    estimatedDigit = '.' + decimalPart;
  } else {
    certainDigits = integerPart + '.' + decimalPart.slice(0, -1);
    estimatedDigit = decimalPart.slice(-1);
  }

  // Check 1: Unit missing or incorrect
  if (!hasUnit) {
    return {
      isValid: false,
      score: 40,
      feedbackType: 'missing_unit',
      message: `You recorded the number (${parsed.rawNumStr}), but forgot the unit! Every measurement in science requires a unit like "${expectedUnit}".`,
      userValue: parsed.numValue,
      userUnit: null,
      expectedMin: actualTrueValue - tolerance,
      expectedMax: actualTrueValue + tolerance,
      expectedDecimals,
      actualDecimals: parsed.decimals,
      certainDigits,
      estimatedDigit,
      properFormatExample: `${actualTrueValue.toFixed(expectedDecimals)} ${expectedUnit}`,
      explanation: `Add "${expectedUnit}" to the end of your answer.`,
    };
  }

  if (!unitMatches) {
    return {
      isValid: false,
      score: 30,
      feedbackType: 'wrong_unit',
      message: `Incorrect unit: You wrote "${parsed.unit}", but this instrument measures in "${expectedUnit}".`,
      userValue: parsed.numValue,
      userUnit: parsed.unit,
      expectedMin: actualTrueValue - tolerance,
      expectedMax: actualTrueValue + tolerance,
      expectedDecimals,
      actualDecimals: parsed.decimals,
      certainDigits,
      estimatedDigit,
      properFormatExample: `${actualTrueValue.toFixed(expectedDecimals)} ${expectedUnit}`,
      explanation: `Please specify "${expectedUnit}".`,
    };
  }

  // Check 2: Resolution (Decimal Places)
  if (parsed.decimals < expectedDecimals) {
    const missingZeros = expectedDecimals - parsed.decimals;
    return {
      isValid: false,
      score: 50,
      feedbackType: 'under_resolved',
      message: `Under-Resolved Measurement! You recorded ${parsed.decimals} decimal place${parsed.decimals === 1 ? '' : 's'}, but this scale requires ${expectedDecimals} decimal place${expectedDecimals === 1 ? '' : 's'}.`,
      userValue: parsed.numValue,
      userUnit: parsed.unit,
      expectedMin: actualTrueValue - tolerance,
      expectedMax: actualTrueValue + tolerance,
      expectedDecimals,
      actualDecimals: parsed.decimals,
      certainDigits,
      estimatedDigit,
      properFormatExample: `${actualTrueValue.toFixed(expectedDecimals)} ${expectedUnit}`,
      explanation: `The smallest graduation on this scale is ${minorTickInterval} ${expectedUnit}. In chemistry, you must record all known digits PLUS one estimated digit. If it lands directly on a line, you must include trailing zero${missingZeros > 1 ? 's' : ''} (e.g., "${actualTrueValue.toFixed(expectedDecimals)} ${expectedUnit}") to communicate your instrument's scale resolution and degree of detail!`,
    };
  }

  if (parsed.decimals > expectedDecimals) {
    return {
      isValid: false,
      score: 40,
      feedbackType: 'over_resolved',
      message: `Over-Resolved Measurement! You wrote ${parsed.decimals} decimal places, claiming more resolution than this instrument's scale markings can provide.`,
      userValue: parsed.numValue,
      userUnit: parsed.unit,
      expectedMin: actualTrueValue - tolerance,
      expectedMax: actualTrueValue + tolerance,
      expectedDecimals,
      actualDecimals: parsed.decimals,
      certainDigits,
      estimatedDigit,
      properFormatExample: `${actualTrueValue.toFixed(expectedDecimals)} ${expectedUnit}`,
      explanation: `Analog instruments only allow estimating ONE place beyond the finest markings (${minorTickInterval} ${expectedUnit}). Record to exactly ${expectedDecimals} decimal place${expectedDecimals === 1 ? '' : 's'}.`,
    };
  }

  // Check 3: Numeric accuracy
  if (!isValueClose) {
    return {
      isValid: false,
      score: 45,
      feedbackType: 'value_off',
      message: `Your resolution (${parsed.decimals} decimals) is correct, but your reading is off. Expected around ~${actualTrueValue.toFixed(expectedDecimals)} ${expectedUnit}.`,
      userValue: parsed.numValue,
      userUnit: parsed.unit,
      expectedMin: actualTrueValue - tolerance,
      expectedMax: actualTrueValue + tolerance,
      expectedDecimals,
      actualDecimals: parsed.decimals,
      certainDigits,
      estimatedDigit,
      properFormatExample: `${actualTrueValue.toFixed(expectedDecimals)} ${expectedUnit}`,
      explanation: `Double-check the major numbers and count each tick mark carefully. (Remember: for liquids, read at the bottom of the meniscus at eye level).`,
    };
  }

  // Success!
  return {
    isValid: true,
    score: 100,
    feedbackType: 'correct',
    message: `Outstanding! Correct measurement and proper resolution (${parsed.decimals} decimal place${parsed.decimals === 1 ? '' : 's'}) with correct units!`,
    userValue: parsed.numValue,
    userUnit: parsed.unit,
    expectedMin: actualTrueValue - tolerance,
    expectedMax: actualTrueValue + tolerance,
    expectedDecimals,
    actualDecimals: parsed.decimals,
    certainDigits,
    estimatedDigit,
    properFormatExample: `${actualTrueValue.toFixed(expectedDecimals)} ${expectedUnit}`,
    explanation: `Certain digits: [${certainDigits}], Estimated digit: [${estimatedDigit}]. Total significant figures correctly communicate this scale's resolution.`,
  };
}
