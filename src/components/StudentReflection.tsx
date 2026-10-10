import React, { useState, useEffect } from 'react';
import { ReflectionQuestion } from '../types';
import {
  Sparkles,
  Copy,
  Printer,
  Check,
  HelpCircle,
  FileText,
  CheckCircle2,
  Trash2,
  Bot,
} from 'lucide-react';

export const REFLECTION_QUESTIONS: ReflectionQuestion[] = [
  {
    id: 'q1_certain_estimated',
    category: 'Measurement Basics',
    title: '1. Certain vs. Estimated Digits in Scientific Data',
    context: 'Every analog measuring instrument has physical markings that establish its baseline scale resolution.',
    question: 'Why must all scientific measurements report every certain digit plus exactly one estimated digit? What happens to scientific data if a student records only certain digits, or guesses two or more decimal places?',
    guidingQuestions: [
      'Why can you be 100% sure about the certain digits from the printed scale lines?',
      'Why can the human eye estimate between two markings to get one extra digit?',
      'Why is guessing extra digits (like writing 4.523 cm on a millimeter ruler) dishonest or misleading?',
    ],
    keyVocabulary: ['Certain Digits', 'Estimated Digit', 'Scale Markings', 'Scale Resolution'],
  },
  {
    id: 'q2_trailing_zeros',
    category: 'Trailing Zeros & Scale Resolution',
    title: '2. The Scientific Meaning of Trailing Zeros',
    context: 'In math class, 5 = 5.0 = 5.00. In science lab, however, these numbers show three completely different levels of instrument resolution and scale divisions.',
    question: 'Suppose you measure an object with a millimeter ruler (marked every 0.1 cm), and the edge falls right on the 5 cm line. Explain why writing "5.00 cm" is required, why "5 cm" is inaccurate, and why "5.000 cm" is not allowed.',
    guidingQuestions: [
      'What instrument scale markings and resolution does writing "5 cm" vs "5.00 cm" tell someone who reads your lab notebook?',
      'Why is a zero at the end of a decimal considered a measured, significant digit rather than just extra space?',
      'How does "5.00 cm" show both the known tenths line and the estimated zero hundredths?',
    ],
    keyVocabulary: ['Trailing Zero', 'Estimated Digit', 'Decimal Places', 'Scale Resolution'],
  },
  {
    id: 'q3_beakers_vs_cylinders',
    category: 'Lab Tool Selection',
    title: '3. Why You Should Never Use a Beaker for Measuring Volume',
    context: 'Both beakers and graduated cylinders have volume lines printed on their sides.',
    question: 'A lab procedure asks you to measure 42.0 mL of liquid. Your lab bench has a 100 mL beaker and a 50 mL graduated cylinder. Why is the beaker the wrong tool for this measurement? If beakers are not for measuring, what are they used for in the lab?',
    guidingQuestions: [
      'How does the wide shape of a beaker make it hard to see small changes in liquid volume?',
      'Why does the narrow column of a graduated cylinder give a much more readable and sensitive measurement?',
      'What tasks are beakers actually designed for in the chemistry lab?',
    ],
    keyVocabulary: ['Graduated Cylinder', 'Beaker', 'Scale Markings', 'Scale Resolution', 'Mixing vs. Measuring'],
  },
];

const LOCAL_STORAGE_KEY = 'chemlab_student_reflections_v1';

interface StudentReflectionProps {
  onOpenAITutor?: () => void;
}

export const StudentReflection: React.FC<StudentReflectionProps> = ({ onOpenAITutor }) => {
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load saved reflections:', e);
    }
    return {};
  });

  const [copiedAll, setCopiedAll] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(answers));
    } catch (e) {
      console.error('Failed to save reflections:', e);
    }
  }, [answers]);

  const handleAnswerChange = (id: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const completedCount = REFLECTION_QUESTIONS.filter(
    (q) => (answers[q.id] || '').trim().length >= 30
  ).length;

  const handleCopyAll = () => {
    let report = `=====================================================\n`;
    report += `CHEMISTRY LAB REFLECTION & CONCEPTUAL SYNTHESIS\n`;
    report += `Date: ${new Date().toLocaleDateString()}\n`;
    report += `Completed Responses: ${completedCount} / ${REFLECTION_QUESTIONS.length}\n`;
    report += `=====================================================\n\n`;

    REFLECTION_QUESTIONS.forEach((q, idx) => {
      report += `[QUESTION ${idx + 1}: ${q.title}]\n`;
      report += `Prompt: ${q.question}\n\n`;
      report += `STUDENT RESPONSE:\n`;
      report += `${answers[q.id] ? answers[q.id].trim() : '(No response recorded yet)'}\n\n`;
      report += `-----------------------------------------------------\n\n`;
    });

    navigator.clipboard.writeText(report);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all your written reflections? This cannot be undone.')) {
      setAnswers({});
    }
  };

  const filteredQuestions =
    activeFilter === 'all'
      ? REFLECTION_QUESTIONS
      : REFLECTION_QUESTIONS.filter((q) => q.category.toLowerCase().includes(activeFilter.toLowerCase()));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center shrink-0 shadow-2xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Student Lab Reflections & Conceptual Synthesis
                </h2>
                <span className="text-[10px] uppercase font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded">
                  Non-Graded Inquiries
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Reflective writing strengthens your scientific reasoning. Formulate complete, thoughtful answers in your own words. Your notes are <strong>auto-saved locally</strong> and can be copied or printed for your teacher or lab portfolio.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyAll}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
            >
              {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedAll ? 'Copied to Clipboard!' : 'Copy All Responses'}
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
          </div>
        </div>

        {/* Progress and Notice Bar */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-700 font-medium">
              <CheckCircle2 className={`w-4 h-4 ${completedCount === REFLECTION_QUESTIONS.length ? 'text-emerald-600' : 'text-indigo-600'}`} />
              <span>
                Progress: <strong>{completedCount}</strong> of <strong>{REFLECTION_QUESTIONS.length}</strong> reflections completed
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-32 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200 hidden sm:block">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${(completedCount / REFLECTION_QUESTIONS.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <span>💡 Write in your own words using clear reasoning.</span>
            {onOpenAITutor && (
              <button
                onClick={onOpenAITutor}
                className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 underline underline-offset-2"
              >
                <Bot className="w-3 h-3" /> Chat with AI Tutor
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-500 font-semibold px-1">Jump to Topic:</span>
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1 rounded-lg font-medium transition ${
            activeFilter === 'all'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          All Topics ({REFLECTION_QUESTIONS.length})
        </button>
        <button
          onClick={() => setActiveFilter('Measurement')}
          className={`px-3 py-1 rounded-lg font-medium transition ${
            activeFilter === 'Measurement'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          1. Certain & Estimated Digits
        </button>
        <button
          onClick={() => setActiveFilter('Trailing')}
          className={`px-3 py-1 rounded-lg font-medium transition ${
            activeFilter === 'Trailing'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          2. Trailing Zeros
        </button>
        <button
          onClick={() => setActiveFilter('Tool')}
          className={`px-3 py-1 rounded-lg font-medium transition ${
            activeFilter === 'Tool'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          3. Beakers vs. Cylinders
        </button>
      </div>

      {/* Reflection Question Cards */}
      <div className="space-y-6">
        {filteredQuestions.map((q) => {
          const answerText = answers[q.id] || '';
          const wordCount = answerText.trim() ? answerText.trim().split(/\s+/).length : 0;
          const isComplete = answerText.trim().length >= 30;

          return (
            <div
              key={q.id}
              id={`reflection-card-${q.id}`}
              className={`bg-white border rounded-xl p-5 shadow-xs transition-all ${
                isComplete ? 'border-slate-300' : 'border-slate-200'
              }`}
            >
              {/* Category & Badge */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                  {q.category}
                </span>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded flex items-center gap-1 ${
                      isComplete
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isComplete ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Response Recorded
                      </>
                    ) : (
                      'In Progress'
                    )}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {wordCount} words
                  </span>
                </div>
              </div>

              {/* Title & Context */}
              <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1.5">{q.title}</h3>
              <p className="text-xs text-slate-500 mb-3 italic">{q.context}</p>

              {/* Main Prompt Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-3.5 text-xs text-slate-800 font-medium leading-relaxed shadow-2xs">
                {q.question}
              </div>

              {/* Guiding Questions & Vocabulary */}
              <div className="mb-3.5 grid sm:grid-cols-2 gap-3 text-xs">
                {/* Guiding questions */}
                <div className="bg-indigo-50/40 border border-indigo-100 rounded-lg p-3">
                  <div className="font-semibold text-indigo-950 mb-1.5 flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                    Guiding Thought Starters:
                  </div>
                  <ul className="space-y-1 text-slate-600 text-[11px] list-disc list-inside">
                    {q.guidingQuestions.map((gq, i) => (
                      <li key={i} className="leading-snug">
                        {gq}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Key vocabulary to include */}
                <div className="bg-amber-50/40 border border-amber-100 rounded-lg p-3">
                  <div className="font-semibold text-amber-950 mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Key Scientific Terms to Integrate:
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {q.keyVocabulary.map((vocab, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-white text-amber-900 border border-amber-200 px-1.5 py-0.5 rounded font-medium shadow-2xs"
                      >
                        {vocab}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Text Input Area */}
              <div className="space-y-1.5 mb-3">
                <label className="block text-xs font-semibold text-slate-700">
                  Your Scientific Explanation:
                </label>
                <textarea
                  value={answerText}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  placeholder="Write your explanation in your own words using clear reasoning and examples..."
                  rows={4}
                  className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none leading-relaxed transition shadow-2xs"
                />
              </div>

              {/* Bottom Card Controls */}
              {onOpenAITutor && (
                <div className="flex justify-end pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={onOpenAITutor}
                    className="text-[11px] text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition"
                  >
                    <Bot className="w-3 h-3" /> Need help brainstorming? Ask AI Tutor
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Summary Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div>
          <span className="font-semibold text-slate-800">Lab Notebook Status:</span>{' '}
          {completedCount === REFLECTION_QUESTIONS.length ? (
            <strong className="text-emerald-700">All {REFLECTION_QUESTIONS.length} reflection prompts completed!</strong>
          ) : (
            <span>
              {completedCount} of {REFLECTION_QUESTIONS.length} written ({REFLECTION_QUESTIONS.length - completedCount} remaining)
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleClearAll}
            className="text-slate-400 hover:text-red-600 flex items-center gap-1 text-[11px] transition"
          >
            <Trash2 className="w-3 h-3" /> Clear My Notes
          </button>
          <button
            onClick={handleCopyAll}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold flex items-center gap-1.5 transition shadow-xs"
          >
            <Copy className="w-3.5 h-3.5" />
            {copiedAll ? 'Copied!' : 'Copy All Responses'}
          </button>
        </div>
      </div>
    </div>
  );
};
