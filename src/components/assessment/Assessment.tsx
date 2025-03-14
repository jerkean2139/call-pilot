import { useState } from 'react';
import { questions, sectionMotivationalCards } from '../../lib/questions';
import { QuestionCard } from './QuestionCard';
import { ClaudiaIntro } from './ClaudiaIntro';
import { ResultsPage } from './ResultsPage';
import { ProcessingAnimation } from './ProcessingAnimation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

export function Assessment() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [answers, setAnswers] = useState<Record<number, number | string>>({});
  const [useVoiceMode, setUseVoiceMode] = useState<boolean | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePreferenceSelected = (useVoice: boolean) => {
    setUseVoiceMode(useVoice);
    setCurrentQuestionIndex(0);
  };

  const handleAnswer = (value: number | string) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentQuestionIndex].id]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setIsProcessing(true);
    }
  };

  const handleProcessingComplete = () => {
    setIsProcessing(false);
    setShowResults(true);
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const resetToIntro = () => {
    setCurrentQuestionIndex(-1);
    setUseVoiceMode(null);
    setShowResults(false);
    setAnswers({});
    setIsProcessing(false);
  };

  if (isProcessing) {
    return <ProcessingAnimation onComplete={handleProcessingComplete} />;
  }

  if (showResults) {
    return <ResultsPage answers={answers} onReset={resetToIntro} />;
  }

  if (currentQuestionIndex === -1) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4">
        <ClaudiaIntro onPreferenceSelected={handlePreferenceSelected} />
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const showMotivationalCard = currentQuestionIndex > 0 && 
    questions[currentQuestionIndex].section !== questions[currentQuestionIndex - 1].section;

  const motivationalCard = currentQuestion.section ? sectionMotivationalCards[currentQuestion.section] : null;

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <nav className="flex items-center space-x-2 mb-8 text-sm">
        <button 
          onClick={resetToIntro}
          className="text-gray-600 hover:text-primary transition-colors"
        >
          Choose Mode
        </button>
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <span className="text-primary font-semibold">
          {useVoiceMode ? 'Voice Mode' : 'Standard Mode'}
        </span>
      </nav>

      <div className="mb-12">
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500 ease-in-out"
            style={{
              width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`
            }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {showMotivationalCard && motivationalCard && (
          <motion.div
            key="motivational-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8"
          >
            <div className="bg-black text-white p-8 rounded-xl">
              <h3 className="text-2xl font-montserrat font-bold mb-4">{motivationalCard.title}</h3>
              <p className="text-lg text-gray-200">{motivationalCard.message}</p>
            </div>
          </motion.div>
        )}
        
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <QuestionCard
            question={currentQuestion}
            onAnswer={handleAnswer}
            onNext={handleNext}
            onPrevious={handlePrevious}
            isFirst={currentQuestionIndex === 0}
            isLast={currentQuestionIndex === questions.length - 1}
            useVoiceMode={useVoiceMode}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}