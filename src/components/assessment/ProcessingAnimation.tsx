import { motion } from 'framer-motion';
import { Brain, BarChart, Fingerprint, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ProcessingStep {
  icon: JSX.Element;
  title: string;
  description: string;
}

interface ProcessingAnimationProps {
  onComplete: () => void;
}

export function ProcessingAnimation({ onComplete }: ProcessingAnimationProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: ProcessingStep[] = [
    {
      icon: <Brain className="w-8 h-8 text-primary" />,
      title: "Analyzing Response Patterns",
      description: "Processing your unique answer combinations..."
    },
    {
      icon: <Fingerprint className="w-8 h-8 text-primary" />,
      title: "Generating Synergy Signature",
      description: "Creating your professional dynamics profile..."
    },
    {
      icon: <BarChart className="w-8 h-8 text-primary" />,
      title: "Calculating Team Fit",
      description: "Evaluating optimal team dynamics..."
    },
    {
      icon: <Sparkles className="w-8 h-8 text-primary" />,
      title: "Finalizing Results",
      description: "Preparing your personalized insights..."
    }
  ];

  useEffect(() => {
    const intervals = [2500, 2500, 2500, 2500]; // Time for each step
    let timeout: NodeJS.Timeout;

    const progressSteps = () => {
      if (currentStep < steps.length - 1) {
        timeout = setTimeout(() => {
          setCurrentStep(prev => prev + 1);
        }, intervals[currentStep]);
      } else {
        // Final delay before showing results
        timeout = setTimeout(onComplete, 2000);
      }
    };

    progressSteps();

    return () => clearTimeout(timeout);
  }, [currentStep, onComplete]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-montserrat font-bold mb-4">
            Generating Your Results
          </h2>
          <p className="text-gray-600">
            Our AI is analyzing your responses to create your personalized assessment...
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className={`flex items-start gap-4 ${
                index !== steps.length - 1 ? 'mb-8' : ''
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: index <= currentStep ? 1 : 0.3,
                y: 0
              }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex-shrink-0">
                {index <= currentStep ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.5 }}
                  >
                    {step.icon}
                  </motion.div>
                ) : (
                  <div className="w-8 h-8 rounded-full border-2 border-gray-200" />
                )}
              </div>
              <div>
                <h3 className="font-montserrat font-bold text-lg mb-1">
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.description}</p>
                {index === currentStep && (
                  <motion.div
                    className="h-1 bg-gray-100 rounded-full mt-3 overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2 }}
                    />
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}