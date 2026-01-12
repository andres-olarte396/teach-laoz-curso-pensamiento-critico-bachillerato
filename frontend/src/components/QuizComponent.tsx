import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ChevronRight, RotateCcw, Award, Info, Loader2 } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  options: { id: string; text: string }[];
  correctAnswerId?: string;
  correctAnswerIds?: string[]; // Source of truth for multiple answers
  feedback?: string;
}

import type { MenuItem } from '../services/apiService';
import { Link } from 'react-router-dom';

interface QuizComponentProps {
  title: string;
  questions: Question[];
  onComplete?: (score: number, answers: { questionId: string; selectedOptionIds: string[] }[]) => void;
  nextLesson?: MenuItem | null;
}

export const QuizComponent: React.FC<QuizComponentProps> = ({ title, questions, onComplete, nextLesson }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);

  const [userAnswers, setUserAnswers] = useState<{ questionId: string; selectedOptionIds: string[] }[]>([]);

  const currentQuestion = questions[currentQuestionIndex];
  
  // Determine if question is multiple choice
  const isMultipleChoice = (currentQuestion.correctAnswerIds && currentQuestion.correctAnswerIds.length > 1);

  const handleOptionSelect = (optionId: string) => {
    if (showFeedback) return;
    
    if (isMultipleChoice) {
        // Toggle selection
        setSelectedOptions(prev => {
            if (prev.includes(optionId)) {
                return prev.filter(id => id !== optionId);
            } else {
                return [...prev, optionId];
            }
        });
    } else {
        // Single selection
        setSelectedOptions([optionId]);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleNext = async () => {
    // Determine correctness
    let isCorrect = false;
    const correctIds = currentQuestion.correctAnswerIds || (currentQuestion.correctAnswerId ? [currentQuestion.correctAnswerId] : []);
    
    // Check if lengths match and all selected are in correct list
    if (selectedOptions.length === correctIds.length) {
        isCorrect = selectedOptions.every(id => correctIds.includes(id));
    }
    
    // Track Answer
    const newAnswer = { questionId: currentQuestion.id, selectedOptionIds: selectedOptions };
    const updatedAnswers = [...userAnswers, newAnswer];
    setUserAnswers(updatedAnswers);
    
    const nextScore = isCorrect ? score + 1 : score;
    if (isCorrect) {
        setScore(prev => prev + 1);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOptions([]);
      setShowFeedback(false);
    } else {
      // Final Question
      if (onComplete) {
          setIsSubmitting(true);
          setSubmitError(null);
          try {
              // We cast result to Promise to support async handlers
              await Promise.resolve(onComplete(nextScore, updatedAnswers));
              setQuizComplete(true);
          } catch (error) {
              console.error(error);
              setSubmitError("Hubo un problema al guardar tus resultados. Por favor intenta nuevamente.");
          } finally {
              setIsSubmitting(false);
          }
      } else {
          setQuizComplete(true);
      }
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOptions([]);
    setShowFeedback(false);
    setScore(0);
    setQuizComplete(false);
    setUserAnswers([]);
  };

  if (quizComplete) {
    const finalScore = (score / questions.length) * 100;
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-center shadow-2xl"
      >
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Award className="text-primary" size={40} />
        </div>
        <h2 className="text-3xl font-bold text-[var(--text-main)] mb-2">{title}</h2>
        <p className="text-[var(--text-muted)] mb-8">Has completado el test satisfactoriamente.</p>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-6 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-color)]">
                <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Puntaje</div>
                <div className="text-4xl font-black text-primary">{Math.round(finalScore)}%</div>
            </div>
            <div className="p-6 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-color)]">
                <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Correctas</div>
                <div className="text-4xl font-black text-[var(--text-main)]">{score} / {questions.length}</div>
            </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
                onClick={restartQuiz}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-primary text-white font-bold uppercase tracking-wider hover:bg-primary/90 transition-all shadow-lg"
            >
                <RotateCcw size={18} /> Reintentar
            </button>
            {nextLesson && (
              <Link 
                  to={nextLesson.type === 'evaluation' ? `/evaluation/${nextLesson.path}` : `/course/${nextLesson.path}`}
                  className="flex items-center justify-center gap-2 px-10 py-4 rounded-full bg-emerald-500 !text-white font-black uppercase tracking-widest text-xs hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
              >
                  <span className="text-white">Siguiente Lección</span> <ChevronRight size={18} className="text-white" />
              </Link>
            )}
            <button 
                onClick={() => window.history.back()}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[var(--bg-app)] border border-[var(--border-color)] text-[var(--text-main)] font-bold uppercase tracking-wider hover:bg-[var(--bg-surface)] transition-all shadow-sm text-xs"
            >
                Regresar al Curso
            </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-10">
        <div className="flex justify-between items-end mb-3">
            <h3 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">Pregunta {currentQuestionIndex + 1} de {questions.length}</h3>
            <span className="text-[10px] font-bold px-2 py-1 rounded bg-primary/10 text-primary border border-primary/20">{(currentQuestionIndex / questions.length * 100).toFixed(0)}% COMPLETADO</span>
        </div>
        <div className="h-1.5 w-full bg-[var(--border-color)] rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}
            className="h-full bg-primary"
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          <h2 
            className="text-2xl font-bold text-[var(--text-main)] leading-tight quiz-content"
            dangerouslySetInnerHTML={{ __html: currentQuestion.text }}
          />

          <div className="grid gap-4">
            {currentQuestion.options.map((option) => {
               const isSelected = selectedOptions.includes(option.id);
               const correctIds = currentQuestion.correctAnswerIds || (currentQuestion.correctAnswerId ? [currentQuestion.correctAnswerId] : []);
               const isCorrectOption = correctIds.includes(option.id);

               return (
              <button
                key={option.id}
                onClick={() => handleOptionSelect(option.id)}
                disabled={showFeedback}
                className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all text-left group ${
                  isSelected
                    ? 'bg-primary/10 border-primary text-[var(--text-main)]'
                    : 'bg-[var(--bg-surface)] border-[var(--border-color)] text-[var(--text-muted)] hover:border-primary/30 hover:text-[var(--text-main)]'
                } ${showFeedback && isCorrectOption ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : ''} 
                  ${showFeedback && isSelected && !isCorrectOption ? 'border-red-500 bg-red-500/10 text-red-600 dark:text-red-400' : ''}
                `}
              >
                <div className="flex items-center gap-4">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                    isSelected ? 'bg-primary text-white' : 'bg-[var(--bg-app)] text-[var(--text-muted)] group-hover:bg-[var(--bg-surface)]'
                  }`}>
                    {option.id.toUpperCase()}
                  </span>
                  <span 
                    className="font-medium quiz-content"
                    dangerouslySetInnerHTML={{ __html: option.text }}
                  />
                </div>
                
                {showFeedback && isCorrectOption && (
                  <CheckCircle2 size={24} className="text-emerald-500" />
                )}
                {showFeedback && isSelected && !isCorrectOption && (
                  <XCircle size={24} className="text-red-500" />
                )}
              </button>
            );
            })}
          </div>

          {showFeedback && currentQuestion.feedback && (
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex gap-4"
            >
                <Info className="text-blue-500 shrink-0" size={20} />
                <div className="text-sm leading-relaxed">
                    <span className="font-bold text-blue-500 uppercase tracking-widest text-[10px] block mb-1">Explicación</span>
                    <div 
                      className="text-[var(--text-muted)] italic quiz-content"
                      dangerouslySetInnerHTML={{ __html: currentQuestion.feedback }}
                    />
                </div>
            </motion.div>
          )}

          <div className="pt-6 flex justify-end">
            {submitError && (
                 <div className="mr-auto text-red-500 text-xs font-bold bg-red-50 px-3 py-2 rounded-lg border border-red-100 flex items-center gap-2">
                    <XCircle size={14} /> {submitError}
                 </div>
            )}
            {!showFeedback ? (
                <button
                    onClick={() => setShowFeedback(true)}
                    disabled={selectedOptions.length === 0 || isSubmitting}
                    className="flex items-center gap-2 px-10 py-4 rounded-full bg-[var(--text-main)] text-[var(--bg-surface)] font-black uppercase tracking-widest text-xs hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl"
                >
                    Comprobar <ChevronRight size={16} />
                </button>
            ) : (
                <button
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-10 py-4 rounded-full bg-primary text-white font-black uppercase tracking-widest text-xs hover:opacity-90 disabled:opacity-70 transition-all shadow-xl"
                >
                    {isSubmitting ? (
                        <>
                           <Loader2 className="animate-spin" size={16} /> Guardando...
                        </>
                    ) : (
                        <>
                           {currentQuestionIndex < questions.length - 1 ? 'Siguiente Pregunta' : 'Finalizar Test'} <ChevronRight size={16} />
                        </>
                    )}
                </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
