import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Volume2 } from 'lucide-react';
import { Question } from '../../lib/questions';
import { cn } from '../../lib/utils';

interface QuestionCardProps {
  question: Question;
  onAnswer: (value: number | string) => void;
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
  useVoiceMode: boolean | null;
}

export function QuestionCard({ 
  question, 
  onAnswer, 
  onNext, 
  onPrevious, 
  isFirst, 
  isLast,
  useVoiceMode
}: QuestionCardProps) {
  const [selectedValue, setSelectedValue] = useState<number | string | null>(null);
  const [textInput, setTextInput] = useState('');

  const handleSelect = (value: number) => {
    setSelectedValue(value);
    onAnswer(value);
  };

  const handleTextInput = (value: string) => {
    setTextInput(value);
    setSelectedValue(value);
    onAnswer(value);
  };

  const speakQuestion = () => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(question.text);
    
    const voices = synth.getVoices();
    const femaleVoice = voices.find(voice => 
      voice.name.toLowerCase().includes('samantha') ||
      voice.name.toLowerCase().includes('microsoft zira') ||
      voice.name.toLowerCase().includes('google uk english female')
    );
    
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }
    
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    synth.speak(utterance);
  };

  useEffect(() => {
    if (useVoiceMode) {
      window.speechSynthesis.onvoiceschanged = () => {
        speakQuestion();
      };
      
      if (window.speechSynthesis.getVoices().length > 0) {
        speakQuestion();
      }
    }
  }, [question.text, useVoiceMode]);

  // Reset text input when question changes
  useEffect(() => {
    setTextInput('');
    setSelectedValue(null);
  }, [question.id]);

  const isTextQuestion = question.options.length === 1 && question.options[0].text.includes('...');

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8 transform transition-all duration-500 hover:shadow-xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1">
            <span className="text-sm font-medium text-primary mb-2 block">
              Question {question.id} of 28
            </span>
            <h3 className="text-2xl font-montserrat font-bold text-gray-900">
              {question.text}
            </h3>
          </div>
          {useVoiceMode && (
            <button 
              onClick={() => {
                window.speechSynthesis.cancel();
                setTimeout(speakQuestion, 2000);
              }}
              className="p-3 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Repeat question"
            >
              <Volume2 className="w-6 h-6 text-primary" />
            </button>
          )}
        </div>

        <div className="space-y-4">
          {isTextQuestion ? (
            <div className="space-y-2">
              <textarea
                value={textInput}
                onChange={(e) => handleTextInput(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full h-32 p-4 rounded-lg border-2 border-gray-200 focus:border-primary focus:ring focus:ring-primary/20 transition-all duration-200 resize-none font-open-sans"
              />
              <p className="text-sm text-gray-500">
                {textInput.length === 0 ? 'Share your thoughts...' : `${textInput.length} characters`}
              </p>
            </div>
          ) : (
            question.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "w-full p-4 text-left rounded-lg border-2 transition-all duration-200",
                  selectedValue === option.value
                    ? "border-primary bg-primary/5 text-primary shadow-sm"
                    : "border-gray-200 hover:border-primary/50 hover:bg-gray-50"
                )}
              >
                <span className="font-open-sans text-lg">{option.text}</span>
              </button>
            ))
          )}
        </div>

        <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={onPrevious}
            disabled={isFirst}
            className={cn(
              "flex items-center gap-2 px-6 py-2 rounded-lg transition-all duration-200 font-medium",
              isFirst
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-100"
            )}
          >
            <ArrowLeft className="w-5 h-5" />
            Previous
          </button>
          <button
            onClick={onNext}
            disabled={selectedValue === null || (isTextQuestion && textInput.trim() === '')}
            className={cn(
              "flex items-center gap-2 px-8 py-2 rounded-lg font-medium transition-all duration-200",
              selectedValue === null || (isTextQuestion && textInput.trim() === '')
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-black text-white hover:bg-black/90"
            )}
          >
            {isLast ? "Complete" : "Continue"}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}