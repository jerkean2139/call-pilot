import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, CheckCircle, AlertCircle, BookOpen } from 'lucide-react';
import { leadershipStyles } from '../lib/leadershipStyles';

export function UserGuide() {
  const [expandedStyle, setExpandedStyle] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-montserrat font-bold mb-4">
            SynergizePro Leadership Guide
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Understanding your leadership style and maximizing your potential
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-start gap-4 mb-6">
              <BookOpen className="w-8 h-8 text-primary flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold mb-2">How to Use Your Results</h2>
                <p className="text-gray-600">
                  Your SynergizePro assessment results provide deep insights into your leadership style,
                  strengths, and growth opportunities. Here's how to make the most of your report:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h3 className="font-bold text-lg">1. Understanding Your Style</h3>
                <p className="text-gray-600">
                  Review your primary leadership style and its characteristics. This reflects your
                  natural approach to leadership and team management.
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="font-bold text-lg">2. Leveraging Strengths</h3>
                <p className="text-gray-600">
                  Focus on opportunities that align with your core strengths. These are areas where
                  you'll have the most significant impact.
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="font-bold text-lg">3. Growth Planning</h3>
                <p className="text-gray-600">
                  Use the identified growth areas to create a development plan. Consider both
                  immediate and long-term opportunities.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Leadership Styles Guide</h2>
            <div className="space-y-4">
              {Object.entries(leadershipStyles).map(([key, style]) => (
                <div key={key} className="border border-gray-200 rounded-lg">
                  <button
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedStyle(expandedStyle === key ? null : key)}
                  >
                    <span className="font-bold text-lg">{style.title}</span>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${
                        expandedStyle === key ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {expandedStyle === key && (
                    <div className="px-6 py-4 border-t border-gray-200">
                      <p className="text-gray-600 mb-6">{style.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-bold mb-3">Core Strengths</h3>
                          <ul className="space-y-2">
                            {style.strengths.map((strength) => (
                              <li key={strength} className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <span>{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h3 className="font-bold mb-3">Growth Areas</h3>
                          <ul className="space-y-2">
                            {style.challenges.map((challenge) => (
                              <li key={challenge} className="flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-yellow-500" />
                                <span>{challenge}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="mt-6">
                        <h3 className="font-bold mb-3">Ideal Roles</h3>
                        <div className="flex flex-wrap gap-2">
                          {style.idealRoles.map((role) => (
                            <span
                              key={role}
                              className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="mt-6">
                        <h3 className="font-bold mb-3">Team Impact</h3>
                        <p className="text-gray-600">{style.teamDynamics}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}