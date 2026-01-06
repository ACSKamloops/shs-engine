/**
 * PracticeQuiz - Interactive vocabulary and concept quizzes
 * 
 * Features:
 * - Multiple choice questions
 * - Vocabulary matching
 * - Immediate feedback
 * - Progress tracking
 * - Celebration on completion
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VocabItem {
  secwepemc?: string;
  term?: string;
  english?: string;
  definition?: string;
}

interface PracticeQuizProps {
  vocabulary?: VocabItem[];
  lessonTitle?: string;
  onComplete?: (score: number, total: number) => void;
}

export function PracticeQuiz({ vocabulary = [], lessonTitle, onComplete }: PracticeQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Generate quiz questions from vocabulary
  const questions = useMemo(() => {
    if (vocabulary.length < 2) return [];
    
    return vocabulary.slice(0, 5).map((item, index) => {
      const correctAnswer = item.english || item.definition || '';
      const otherAnswers = vocabulary
        .filter((_, i) => i !== index)
        .map(v => v.english || v.definition || '')
        .slice(0, 3);
      
      // Shuffle answers
      const allAnswers = [correctAnswer, ...otherAnswers].sort(() => Math.random() - 0.5);
      
      return {
        question: item.secwepemc || item.term || '',
        correctAnswer,
        answers: allAnswers,
        correctIndex: allAnswers.indexOf(correctAnswer),
      };
    });
  }, [vocabulary]);

  if (questions.length === 0) {
    return (
      <div className="text-center py-8">
        <span className="text-4xl mb-3 block">📝</span>
        <p className="text-gray-500">Not enough vocabulary for a quiz yet.</p>
        <p className="text-sm text-gray-400 mt-1">Add more vocabulary terms to enable practice.</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return; // Already answered
    
    setSelectedAnswer(answerIndex);
    const correct = answerIndex === currentQuestion.correctIndex;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(prev => prev + 1);
    }

    // Move to next question after delay
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
      } else {
        setIsComplete(true);
        onComplete?.(score + (correct ? 1 : 0), questions.length);
      }
    }, 1500);
  };

  if (isComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    const isGood = percentage >= 80;
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="text-6xl mb-4"
        >
          {isGood ? '🎉' : '💪'}
        </motion.div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {isGood ? 'Great Job!' : 'Keep Practicing!'}
        </h3>
        <p className="text-gray-600 mb-4">
          You scored <span className="font-bold text-shs-forest-600">{score}/{questions.length}</span> ({percentage}%)
        </p>
        
        <div className="flex justify-center gap-3">
          <button
            onClick={() => {
              setCurrentIndex(0);
              setSelectedAnswer(null);
              setIsCorrect(null);
              setScore(0);
              setIsComplete(false);
            }}
            className="px-6 py-2.5 bg-shs-forest-600 text-white font-semibold rounded-xl hover:bg-shs-forest-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="py-4">
      {/* Progress */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm text-gray-500">
          Question {currentIndex + 1} of {questions.length}
        </span>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i < currentIndex ? 'bg-shs-forest-500' :
                i === currentIndex ? 'bg-shs-forest-300' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <div className="bg-shs-forest-50 rounded-2xl p-6 mb-6 text-center">
            <p className="text-sm text-shs-forest-600 font-medium mb-2">What does this mean?</p>
            <p className="text-3xl font-bold text-shs-forest-800">
              {currentQuestion.question}
            </p>
          </div>

          {/* Answers */}
          <div className="grid grid-cols-1 gap-3">
            {currentQuestion.answers.map((answer, i) => {
              const isSelected = selectedAnswer === i;
              const isThisCorrect = i === currentQuestion.correctIndex;
              
              let buttonClass = 'bg-white border-gray-200 hover:border-shs-forest-300 hover:bg-gray-50';
              if (selectedAnswer !== null) {
                if (isThisCorrect) {
                  buttonClass = 'bg-green-50 border-green-500 text-green-800';
                } else if (isSelected) {
                  buttonClass = 'bg-red-50 border-red-500 text-red-800';
                }
              }
              
              return (
                <motion.button
                  key={i}
                  whileHover={selectedAnswer === null ? { scale: 1.01 } : {}}
                  whileTap={selectedAnswer === null ? { scale: 0.99 } : {}}
                  onClick={() => handleAnswer(i)}
                  disabled={selectedAnswer !== null}
                  className={`p-4 rounded-xl border-2 text-left font-medium transition-all ${buttonClass}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                      selectedAnswer !== null 
                        ? isThisCorrect ? 'bg-green-500 text-white' : isSelected ? 'bg-red-500 text-white' : 'bg-gray-100'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {selectedAnswer !== null && isThisCorrect ? '✓' : String.fromCharCode(65 + i)}
                    </span>
                    <span>{answer}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Feedback */}
      <AnimatePresence>
        {isCorrect !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mt-4 p-4 rounded-xl text-center font-semibold ${
              isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {isCorrect ? '✓ Correct!' : '✗ Not quite. The answer was: ' + currentQuestion.correctAnswer}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PracticeQuiz;
