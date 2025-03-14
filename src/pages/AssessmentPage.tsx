import { useState } from 'react';
import { motion } from 'framer-motion';
import React from 'react';
import { 
  ArrowLeft, 
  Check, 
  Brain, 
  Compass, 
  Flame, 
  Target,
  Users,
  Share2
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Questions are organized by trait category
const assessmentQuestions = [
  // Critical Thinking
  {
    category: 'Critical Thinking',
    questions: [
      {
        id: 'ct1',
        text: 'When faced with a complex problem, I prefer to:',
        options: [
          { value: 'analyze', label: 'Break it down into smaller parts and analyze each component' },
          { value: 'intuition', label: 'Go with my intuition and experience to find a solution' },
          { value: 'delegate', label: 'Consult with others or delegate to someone with expertise' },
          { value: 'postpone', label: 'Postpone dealing with it until I have more information' }
        ]
      },
      {
        id: 'ct2',
        text: 'When making important decisions:',
        options: [
          { value: 'data', label: 'I rely heavily on data and facts' },
          { value: 'balanced', label: 'I balance facts with intuition' },
          { value: 'feelings', label: 'I trust my feelings and instincts' },
          { value: 'advice', label: 'I seek advice from others before deciding' }
        ]
      },
      {
        id: 'ct3',
        text: 'When someone presents a new idea that contradicts my understanding:',
        options: [
          { value: 'challenge', label: 'I ask questions to understand their reasoning' },
          { value: 'evaluate', label: 'I evaluate the evidence supporting their claim' },
          { value: 'defend', label: 'I defend my existing position with my own evidence' },
          { value: 'accept', label: "I'm open to changing my mind if their idea has merit" }
        ]
      }
    ]
  },
  // Independence
  {
    category: 'Independence',
    questions: [
      {
        id: 'ind1',
        text: 'When working on a project:',
        options: [
          { value: 'autonomous', label: 'I prefer complete autonomy with minimal supervision' },
          { value: 'check-ins', label: 'I like having periodic check-ins but working independently' },
          { value: 'collaboration', label: 'I prefer collaborating closely with a team' },
          { value: 'guidance', label: 'I want clear guidance and direction throughout' }
        ]
      },
      {
        id: 'ind2',
        text: 'When I encounter an obstacle in my work:',
        options: [
          { value: 'solve-alone', label: 'I try to solve it on my own before asking for help' },
          { value: 'research', label: 'I research solutions independently then discuss with others' },
          { value: 'immediate-help', label: 'I immediately seek guidance from colleagues or managers' },
          { value: 'workaround', label: 'I find a workaround and continue with my tasks' }
        ]
      },
      {
        id: 'ind3',
        text: 'My ideal work environment is one where:',
        options: [
          { value: 'freedom', label: 'I have freedom to set my own schedule and approach' },
          { value: 'structure', label: "There's a clear structure but room for personal initiative" },
          { value: 'team', label: "I'm part of a tight-knit team with shared responsibilities" },
          { value: 'direction', label: 'There are detailed processes and regular guidance' }
        ]
      }
    ]
  },
  // Passion
  {
    category: 'Passion',
    questions: [
      {
        id: 'p1',
        text: 'What motivates me most in my work is:',
        options: [
          { value: 'purpose', label: 'Contributing to a meaningful purpose or mission' },
          { value: 'mastery', label: 'Developing expertise and mastering new skills' },
          { value: 'recognition', label: 'Recognition and appreciation for my contributions' },
          { value: 'compensation', label: 'Financial rewards and career advancement' }
        ]
      },
      {
        id: 'p2',
        text: 'When it comes to learning new skills for my job:',
        options: [
          { value: 'excited', label: "I'm excited and actively seek learning opportunities" },
          { value: 'willing', label: "I'm willing to learn what's necessary to perform well" },
          { value: 'reluctant', label: 'I prefer sticking to what I already know and do well' },
          { value: 'practical', label: 'I focus only on practical skills with immediate application' }
        ]
      },
      {
        id: 'p3',
        text: 'At the end of a challenging workday, I typically feel:',
        options: [
          { value: 'fulfilled', label: 'Fulfilled, especially if I overcame difficult problems' },
          { value: 'satisfied', label: 'Satisfied if I completed my tasks and responsibilities' },
          { value: 'exhausted', label: 'Exhausted and ready to disconnect from work' },
          { value: 'neutral', label: 'Neutral - work is just one part of life' }
        ]
      }
    ]
  },
  // Role Clarity
  {
    category: 'Role Clarity',
    questions: [
      {
        id: 'rc1',
        text: 'When taking on a new role or responsibility:',
        options: [
          { value: 'boundaries', label: 'I want clear boundaries and expectations defined' },
          { value: 'flexibility', label: 'I prefer flexibility to define my role as I go' },
          { value: 'examples', label: 'I look for examples of how others have succeeded in this role' },
          { value: 'mission', label: 'I focus on understanding how it contributes to the bigger mission' }
        ]
      },
      {
        id: 'rc2',
        text: "When my role overlaps with a colleague's responsibilities:",
        options: [
          { value: 'clarify', label: 'I seek to clarify boundaries and establish clear ownership' },
          { value: 'collaborate', label: 'I view it as an opportunity for collaboration' },
          { value: 'defer', label: 'I tend to defer to them to avoid stepping on toes' },
          { value: 'negotiate', label: "I negotiate a compromise that serves the project's needs" },
        ]
      },
      {
        id: 'rc3',
        text: 'In terms of my career path:',
        options: [
          { value: 'specialist', label: 'I prefer becoming a specialist with deep expertise in one area' },
          { value: 'generalist', label: 'I enjoy being a generalist who can perform various roles' },
          { value: 'leadership', label: 'I aspire to leadership positions managing people and strategy' },
          { value: 'entrepreneurial', label: "I'm drawn to entrepreneurial roles creating new initiatives" }
        ]
      }
    ]
  }
];

export function AssessmentPage() {
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  const currentCategory = assessmentQuestions[currentSection];
  const questionsInCategory = currentCategory?.questions || [];
  const currentQuestionData = questionsInCategory[currentQuestion];
  
  const totalQuestions = assessmentQuestions.reduce((count, section) => count + section.questions.length, 0);
  const answeredQuestions = Object.keys(answers).length;
  const progressPercentage = (answeredQuestions / totalQuestions) * 100;

  function handleAnswerSelect(questionId: string, answer: string) {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
    
    // Move to next question or section
    if (currentQuestion < questionsInCategory.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else if (currentSection < assessmentQuestions.length - 1) {
      setCurrentSection(currentSection + 1);
      setCurrentQuestion(0);
    } else {
      // Assessment completed
      setIsCompleted(true);
    }
  }

  function handlePrevious() {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      const prevCategoryQuestions = assessmentQuestions[currentSection - 1].questions;
      setCurrentQuestion(prevCategoryQuestions.length - 1);
    }
  }

  function calculateResults() {
    // In a real app, this would do more sophisticated analysis
    const traits = {
      criticalThinking: 0,
      independence: 0,
      passion: 0,
      roleClarity: 0,
      collaboration: 0
    };
    
    // Simple mapping of answers to scores for demo purposes
    Object.entries(answers).forEach(([questionId, answer]) => {
      if (questionId.startsWith('ct')) {
        if (['analyze', 'data', 'challenge', 'evaluate'].includes(answer)) {
          traits.criticalThinking += 1;
        }
      } else if (questionId.startsWith('ind')) {
        if (['autonomous', 'solve-alone', 'freedom'].includes(answer)) {
          traits.independence += 1;
        }
      } else if (questionId.startsWith('p')) {
        if (['purpose', 'excited', 'fulfilled'].includes(answer)) {
          traits.passion += 1;
        }
      } else if (questionId.startsWith('rc')) {
        if (['boundaries', 'clarify', 'specialist'].includes(answer)) {
          traits.roleClarity += 1;
        }
        // Add collaboration score based on certain answers
        if (['collaborate', 'team', 'negotiate'].includes(answer)) {
          traits.collaboration += 1;
        }
      }
      
      // Add additional collaboration traits from answers that indicate team orientation
      if (['delegate', 'advice', 'accept', 'team', 'collaborate'].includes(answer)) {
        traits.collaboration += 0.5;
      }
    });
    
    // Normalize collaboration score to be in the same range as others
    traits.collaboration = Math.min(3, Math.round(traits.collaboration));
    
    // Determine the primary and secondary archetypes based on trait scores
    const traitValues = Object.entries(traits);
    traitValues.sort((a, b) => b[1] - a[1]);
    
    const primaryTrait = traitValues[0][0];
    const secondaryTrait = traitValues[1][0]; 
    
    const primaryArchetype = getArchetype(primaryTrait);
    const secondaryArchetype = getArchetype(secondaryTrait);
    
    return {
      ...traits,
      primaryTrait,
      secondaryTrait,
      primaryArchetype,
      secondaryArchetype
    };
  }
  
  function getArchetype(primaryTrait: string) {
    const archetypes = {
      criticalThinking: {
        name: "The Analyst",
        description: "You excel at breaking down complex problems, evaluating evidence, and making data-driven decisions. Your logical approach allows you to see patterns others might miss.",
        icon: Brain,
        color: "#3B82F6", // Blue
        strengths: ["Problem-solving", "Data analysis", "Logical thinking"],
        growth: "Consider how emotions and interpersonal dynamics might impact your analytical approach."
      },
      independence: {
        name: "The Pathfinder",
        description: "You thrive when given autonomy and prefer to chart your own course. Self-reliant and resourceful, you're comfortable taking initiative without constant direction.",
        icon: Compass,
        color: "#10B981", // Green
        strengths: ["Self-reliance", "Initiative", "Adaptability"],
        growth: "Remember to keep stakeholders informed of your direction and invite input at key decision points."
      },
      passion: {
        name: "The Catalyst",
        description: "You bring energy and enthusiasm to your work, inspiring those around you. Deeply motivated by purpose, you're always eager to learn and grow in pursuit of your goals.",
        icon: Flame,
        color: "#F59E0B", // Amber
        strengths: ["Motivation", "Inspiration", "Drive"],
        growth: "Balance your enthusiasm with pragmatic planning to ensure your vision translates into tangible results."
      },
      roleClarity: {
        name: "The Specialist",
        description: "You prefer clear boundaries and well-defined responsibilities. Your focused expertise and attention to detail make you exceptionally reliable in your domain.",
        icon: Target,
        color: "#8B5CF6", // Purple
        strengths: ["Focus", "Reliability", "Technical expertise"],
        growth: "Explore adjacent domains to broaden your expertise and find new ways to apply your specialized knowledge."
      },
      collaboration: {
        name: "The Connector",
        description: "You excel at building relationships and facilitating teamwork. Your ability to bring people together and leverage diverse perspectives leads to innovative solutions.",
        icon: Users,
        color: "#EC4899", // Pink
        strengths: ["Team-building", "Communication", "Empathy"],
        growth: "Don't hesitate to assert your own viewpoint when necessary, even when it differs from the team consensus."
      }
    };
    
    return archetypes[primaryTrait as keyof typeof archetypes];
  }

  if (isCompleted) {
    const results = calculateResults();
    
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="bg-black text-white p-8 text-center">
              <h1 className="text-3xl font-bold mb-2">Assessment Complete!</h1>
              <p className="text-gray-300">Thank you for completing the CoreTrack Assessment</p>
            </div>
            
            <div className="p-8">
              <div className="flex items-center justify-center mb-6">
                <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ backgroundColor: results.primaryArchetype.color }}>
                  {React.createElement(results.primaryArchetype.icon, { className: "w-12 h-12 text-white" })}
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-center mb-2">Your Primary Archetype: {results.primaryArchetype.name}</h2>
              <p className="text-center text-gray-600 mb-6">{results.primaryArchetype.description}</p>
              
              {/* Strengths & Growth Areas */}
              <div className="mb-8 bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2">Key Strengths:</h3>
                <ul className="list-disc pl-5 mb-4">
                  {results.primaryArchetype.strengths.map((strength, index) => (
                    <li key={index} className="text-gray-700">{strength}</li>
                  ))}
                </ul>
                <h3 className="font-bold text-lg mb-2">Growth Opportunity:</h3>
                <p className="text-gray-700">{results.primaryArchetype.growth}</p>
              </div>
              
              {/* Secondary Archetype */}
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: results.secondaryArchetype.color }}>
                  {React.createElement(results.secondaryArchetype.icon, { className: "w-5 h-5 text-white" })}
                </div>
                <div>
                  <h3 className="font-bold">Secondary Influence: {results.secondaryArchetype.name}</h3>
                  <p className="text-sm text-gray-600">You also show traits of this archetype</p>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-center my-6">Your Trait Breakdown</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold flex items-center"><Brain size={18} className="mr-2 text-[#3B82F6]" /> Critical Thinking</h3>
                  <div className="w-full bg-gray-200 h-4 rounded-full mt-2">
                    <div 
                      className="bg-[#3B82F6] h-4 rounded-full" 
                      style={{ width: `${(results.criticalThinking / 3) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold flex items-center"><Compass size={18} className="mr-2 text-[#10B981]" /> Independence</h3>
                  <div className="w-full bg-gray-200 h-4 rounded-full mt-2">
                    <div 
                      className="bg-[#10B981] h-4 rounded-full" 
                      style={{ width: `${(results.independence / 3) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold flex items-center"><Flame size={18} className="mr-2 text-[#F59E0B]" /> Passion</h3>
                  <div className="w-full bg-gray-200 h-4 rounded-full mt-2">
                    <div 
                      className="bg-[#F59E0B] h-4 rounded-full" 
                      style={{ width: `${(results.passion / 3) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold flex items-center"><Target size={18} className="mr-2 text-[#8B5CF6]" /> Role Clarity</h3>
                  <div className="w-full bg-gray-200 h-4 rounded-full mt-2">
                    <div 
                      className="bg-[#8B5CF6] h-4 rounded-full" 
                      style={{ width: `${(results.roleClarity / 3) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                  <h3 className="font-bold flex items-center"><Users size={18} className="mr-2 text-[#EC4899]" /> Collaboration</h3>
                  <div className="w-full bg-gray-200 h-4 rounded-full mt-2">
                    <div 
                      className="bg-[#EC4899] h-4 rounded-full" 
                      style={{ width: `${(results.collaboration / 3) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="text-center mb-2">
                <button 
                  onClick={() => window.print()}
                  className="inline-flex items-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg"
                >
                  <Share2 size={16} className="mr-2" />
                  Share Results
                </button>
              </div>
              
              <div className="flex justify-center mt-8">
                <Link 
                  to="/reports" 
                  className="bg-[#FF0000] hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg"
                >
                  View Reports
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Progress bar */}
          <div className="w-full bg-gray-100 h-2">
            <div 
              className="bg-[#FF0000] h-2 transition-all duration-300" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          
          {/* Question section */}
          <div className="p-8">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase text-[#FF0000]">
                  {currentCategory.category}
                </h2>
                <span className="text-sm text-gray-500">
                  Question {answeredQuestions + 1} of {totalQuestions}
                </span>
              </div>
              
              <motion.h3 
                key={currentQuestionData.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold mt-2"
              >
                {currentQuestionData.text}
              </motion.h3>
            </div>
            
            {/* Answer options */}
            <motion.div 
              className="space-y-3 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
            >
              {currentQuestionData.options.map((option) => (
                <motion.button
                  key={option.value}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    answers[currentQuestionData.id] === option.value
                      ? 'border-[#FF0000] bg-[#FF0000]/5'
                      : 'border-gray-200 hover:border-[#FF0000]/50'
                  }`}
                  onClick={() => handleAnswerSelect(currentQuestionData.id, option.value)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      answers[currentQuestionData.id] === option.value
                        ? 'border-[#FF0000] bg-[#FF0000]'
                        : 'border-gray-300'
                    }`}>
                      {answers[currentQuestionData.id] === option.value && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span>{option.label}</span>
                  </div>
                </motion.button>
              ))}
            </motion.div>
            
            {/* Navigation buttons */}
            <div className="flex justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentSection === 0 && currentQuestion === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  currentSection === 0 && currentQuestion === 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>
              
              <div className="text-sm text-gray-500">
                {currentSection + 1} of {assessmentQuestions.length} sections
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
