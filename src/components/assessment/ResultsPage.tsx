import { motion } from 'framer-motion';
import { ArrowRight, Download, Share2, CheckCircle, XCircle, Brain, Users, Zap, Trophy, Briefcase, Target, TrendingUp, AlertCircle, Lightbulb, ChevronDown } from 'lucide-react';
import { BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Bar, ResponsiveContainer, Legend } from 'recharts';
import { useState } from 'react';

interface ResultsPageProps {
  answers: Record<number, number | string>;
  onReset: () => void;
}

export function ResultsPage({ answers, onReset }: ResultsPageProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const animalAvatars = [
    {
      animal: "Lion",
      trait: "Leadership",
      score: 92,
      image: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80",
      description: "Like a lion leading their pride, you have natural authority and inspire others to follow your vision"
    },
    {
      animal: "Owl",
      trait: "Strategic Thinking",
      score: 88,
      image: "https://images.unsplash.com/photo-1579965342575-16428a7c8881?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80",
      description: "Your wisdom and analytical approach mirrors an owl's careful observation before taking action"
    },
    {
      animal: "Dolphin",
      trait: "Communication",
      score: 85,
      image: "https://images.unsplash.com/photo-1607153333879-c174d265f1d2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80",
      description: "Like dolphins in their pod, you excel at collaborative communication and building team harmony"
    },
    {
      animal: "Beaver",
      trait: "Execution",
      score: 78,
      image: "https://images.unsplash.com/photo-1589656966895-2f33e7653819?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80",
      description: "Your methodical approach and attention to detail reflects a beaver's precise engineering skills"
    }
  ];

  const decisionMakingData = [
    { name: 'Analytical', value: 85 },
    { name: 'Intuitive', value: 65 },
    { name: 'Collaborative', value: 90 },
    { name: 'Directive', value: 45 }
  ];

  const teamCompatibility = [
    { role: 'Visionary Leaders', score: 95 },
    { role: 'Strategic Planners', score: 88 },
    { role: 'Project Managers', score: 75 },
    { role: 'Team Facilitators', score: 92 },
    { role: 'Technical Experts', score: 65 }
  ];

  const businessImpactAreas = [
    {
      area: "Innovation Leadership",
      potential: 92,
      description: "High capacity for driving innovative initiatives and transformational change",
      recommendations: [
        "Lead innovation workshops",
        "Develop strategic vision",
        "Foster creative problem-solving"
      ]
    },
    {
      area: "Team Development",
      potential: 88,
      description: "Strong ability to build and develop high-performing teams",
      recommendations: [
        "Implement mentorship programs",
        "Create team building initiatives",
        "Establish growth frameworks"
      ]
    },
    {
      area: "Strategic Planning",
      potential: 85,
      description: "Excellence in long-term strategic thinking and planning",
      recommendations: [
        "Lead strategy sessions",
        "Develop business plans",
        "Guide organizational direction"
      ]
    }
  ];

  const riskFactors = [
    {
      factor: "Decision Paralysis",
      risk: "Low",
      mitigation: "Your decisive nature helps avoid analysis paralysis, but maintain balance with thorough evaluation."
    },
    {
      factor: "Team Burnout",
      risk: "Medium",
      mitigation: "Your high-energy style may need moderation to prevent team exhaustion. Implement regular check-ins."
    },
    {
      factor: "Innovation Overload",
      risk: "Medium",
      mitigation: "Balance new initiatives with operational stability to maintain sustainable growth."
    }
  ];

  const growthTrajectory = {
    immediate: [
      "Lead innovation task force",
      "Mentor emerging leaders",
      "Drive strategic initiatives"
    ],
    sixMonths: [
      "Develop cross-functional leadership",
      "Build strategic partnerships",
      "Launch transformation projects"
    ],
    oneYear: [
      "Scale organizational impact",
      "Establish thought leadership",
      "Create innovation frameworks"
    ]
  };

  const industryInsights = [
    {
      industry: "Technology",
      fit: "Excellent",
      roles: [
        "Innovation Director",
        "Digital Transformation Lead",
        "Product Strategy Head"
      ]
    },
    {
      industry: "Consulting",
      fit: "Very Good",
      roles: [
        "Change Management Consultant",
        "Strategy Advisor",
        "Leadership Coach"
      ]
    },
    {
      industry: "Healthcare",
      fit: "Good",
      roles: [
        "Healthcare Innovation Lead",
        "Patient Experience Director",
        "Digital Health Strategist"
      ]
    }
  ];

  const renderYAxisTick = (props: any) => {
    const { x, y, payload } = props;
    return (
      <text 
        x={x} 
        y={y} 
        dy={3} 
        textAnchor="end" 
        fill="#000000"
        style={{ fontWeight: 600 }}
      >
        {payload.value}
      </text>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        <div className="text-center">
          <h1 className="text-4xl font-montserrat font-bold mb-4">Your Leadership DNA Report™</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Based on our AI analysis, you're a Transformational Leader with exceptional potential 
            for driving innovation and organizational change.
          </p>
        </div>

        <div className="bg-black text-white rounded-xl p-8">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <Brain className="w-12 h-12 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Your Leadership Spirit Animals</h2>
              <p className="text-gray-300 mb-6">Each animal represents a core aspect of your leadership style</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {animalAvatars.map((avatar) => (
                  <div key={avatar.animal} className="bg-white/10 rounded-lg p-4 text-center">
                    <img 
                      src={avatar.image} 
                      alt={avatar.animal}
                      className="w-32 h-32 object-cover rounded-full mx-auto mb-4"
                    />
                    <h3 className="text-xl font-bold text-primary mb-1">{avatar.animal}</h3>
                    <p className="text-sm text-gray-300 mb-2">{avatar.trait}</p>
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <div className="h-2 bg-white/20 rounded-full w-24">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${avatar.score}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{avatar.score}%</span>
                    </div>
                    <p className="text-sm text-gray-400">{avatar.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-montserrat font-bold mb-6">Decision Making Style</h2>
            <div className="h-[400px] -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={decisionMakingData} 
                  layout="vertical" 
                  margin={{ left: 140, right: 30, top: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    tick={renderYAxisTick}
                    width={140}
                  />
                  <Tooltip />
                  <Bar dataKey="value" fill="#D50000" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-montserrat font-bold mb-6">Team Compatibility</h2>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={teamCompatibility}
                  layout="vertical"
                  margin={{ left: 140, right: 30, top: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis 
                    dataKey="role" 
                    type="category"
                    width={140}
                    tick={renderYAxisTick}
                  />
                  <Tooltip />
                  <Bar dataKey="score" fill="#D50000" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-montserrat font-bold mb-6">Business Impact Potential</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {businessImpactAreas.map((area) => (
              <div key={area.area} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">{area.area}</h3>
                  <span className="text-2xl font-bold text-primary">{area.potential}%</span>
                </div>
                <p className="text-gray-600">{area.description}</p>
                <div className="space-y-2">
                  {area.recommendations.map((rec) => (
                    <div key={rec} className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-primary" />
                      <span className="text-sm">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary to-highlight text-white rounded-xl p-8">
          <h2 className="text-2xl font-montserrat font-bold mb-6">Industry Alignment</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {industryInsights.map((industry) => (
              <div key={industry.industry} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Target className="w-8 h-8" />
                  <div>
                    <h3 className="font-bold text-lg">{industry.industry}</h3>
                    <span className="text-white/80">Fit: {industry.fit}</span>
                  </div>
                </div>
                <ul className="space-y-2">
                  {industry.roles.map((role) => (
                    <li key={role} className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm">{role}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-montserrat font-bold mb-6">Risk Analysis & Mitigation</h2>
          <div className="space-y-6">
            {riskFactors.map((factor) => (
              <div key={factor.factor} className="border-b border-gray-200 pb-6 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold">{factor.factor}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    factor.risk === 'Low' ? 'bg-green-100 text-green-800' :
                    factor.risk === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {factor.risk} Risk
                  </span>
                </div>
                <p className="text-gray-600">{factor.mitigation}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-black text-white rounded-xl p-8">
          <h2 className="text-2xl font-montserrat font-bold mb-6">Growth Trajectory</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold text-primary mb-4">Immediate Impact</h3>
              <ul className="space-y-3">
                {growthTrajectory.immediate.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-primary mb-4">6 Months</h3>
              <ul className="space-y-3">
                {growthTrajectory.sixMonths.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-primary mb-4">1 Year</h3>
              <ul className="space-y-3">
                {growthTrajectory.oneYear.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <button className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-black/90 transition-colors">
            <Download className="w-5 h-5" />
            Download Full Report
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-black text-black rounded-lg font-semibold hover:bg-gray-50 transition-colors">
            <Share2 className="w-5 h-5" />
            Share Results
          </button>
          <button 
            onClick={onReset}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
            Take Assessment Again
          </button>
        </div>
      </motion.div>
    </div>
  );
}