import { useState } from 'react';
import { ResultsPage } from '../components/assessment/ResultsPage';
import { questions } from '../lib/questions';

export function AssessmentResults() {
  const [showResults, setShowResults] = useState(false);

  const generateRandomAnswers = () => {
    const answers: Record<number, number | string> = {};
    
    questions.forEach(question => {
      if (question.options.length === 1 && question.options[0].text.includes('...')) {
        // For text questions, generate a random response
        const responses = [
          "I adapted my communication style to be more direct and focused on data when working with our engineering team.",
          "I shifted from my usual collaborative approach to take more ownership of critical decisions during a crisis.",
          "I learned to balance my natural leadership style with a more supportive role to help the team succeed."
        ];
        answers[question.id] = responses[Math.floor(Math.random() * responses.length)];
      } else {
        // For multiple choice questions, pick a random option
        const randomOption = question.options[Math.floor(Math.random() * question.options.length)];
        answers[question.id] = randomOption.value;
      }
    });

    return answers;
  };

  const handleGenerateResults = () => {
    setShowResults(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      {!showResults ? (
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h1 className="text-3xl font-montserrat font-bold mb-6">Assessment Results Demo</h1>
            <p className="text-gray-600 mb-8">
              Click the button below to generate random assessment results for a mock user.
              This helps visualize different possible outcomes of the assessment.
            </p>
            <button
              onClick={handleGenerateResults}
              className="bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Generate Random Results
            </button>
          </div>
        </div>
      ) : (
        <ResultsPage
          answers={generateRandomAnswers()}
          onReset={() => setShowResults(false)}
        />
      )}
    </div>
  );
}