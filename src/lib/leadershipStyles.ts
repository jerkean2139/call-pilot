export interface LeadershipStyle {
  title: string;
  description: string;
  strengths: string[];
  challenges: string[];
  idealRoles: string[];
  teamDynamics: string;
  growthAreas: string[];
}

export const leadershipStyles: Record<string, LeadershipStyle> = {
  "Transformational Leader": {
    title: "Transformational Leader",
    description: "A visionary who inspires and motivates others through innovation and change.",
    strengths: [
      "Vision creation and communication",
      "Team empowerment",
      "Change management",
      "Innovation fostering"
    ],
    challenges: [
      "Detail-oriented tasks",
      "Routine management",
      "Process documentation"
    ],
    idealRoles: [
      "Innovation Director",
      "Change Management Lead",
      "Strategic Planning Head",
      "Organizational Development Director"
    ],
    teamDynamics: "Excels in leading teams through major changes and inspiring high performance.",
    growthAreas: [
      "Operational efficiency",
      "Detail management",
      "Process standardization"
    ]
  },
  "Strategic Architect": {
    title: "Strategic Architect",
    description: "A methodical planner who excels at building sustainable systems and processes.",
    strengths: [
      "Long-term planning",
      "System design",
      "Risk assessment",
      "Resource optimization"
    ],
    challenges: [
      "Rapid adaptation",
      "Emotional engagement",
      "Spontaneous decision-making"
    ],
    idealRoles: [
      "Strategic Planning Director",
      "Operations Head",
      "Business Architecture Lead",
      "Program Manager"
    ],
    teamDynamics: "Creates structured environments that promote efficiency and clear goals.",
    growthAreas: [
      "Adaptability",
      "Team engagement",
      "Quick decision-making"
    ]
  },
  "Collaborative Catalyst": {
    title: "Collaborative Catalyst",
    description: "A relationship-focused leader who builds strong teams through cooperation and engagement.",
    strengths: [
      "Team building",
      "Conflict resolution",
      "Stakeholder management",
      "Inclusive decision-making"
    ],
    challenges: [
      "Decisive action",
      "Individual work",
      "Direct confrontation"
    ],
    idealRoles: [
      "Team Development Lead",
      "HR Director",
      "Community Manager",
      "Partnership Coordinator"
    ],
    teamDynamics: "Fosters a collaborative environment with high engagement and strong relationships.",
    growthAreas: [
      "Decision assertiveness",
      "Individual productivity",
      "Direct communication"
    ]
  },
  "Innovation Champion": {
    title: "Innovation Champion",
    description: "A creative force who drives breakthrough thinking and technological advancement.",
    strengths: [
      "Creative problem-solving",
      "Future-thinking",
      "Technology adoption",
      "Experimental mindset"
    ],
    challenges: [
      "Traditional processes",
      "Routine tasks",
      "Risk management"
    ],
    idealRoles: [
      "R&D Director",
      "Innovation Lab Head",
      "Digital Transformation Lead",
      "Product Innovation Manager"
    ],
    teamDynamics: "Drives teams toward creative solutions and breakthrough innovations.",
    growthAreas: [
      "Process adherence",
      "Risk assessment",
      "Operational stability"
    ]
  },
  "Operational Excellence Leader": {
    title: "Operational Excellence Leader",
    description: "An efficiency-focused leader who optimizes processes and delivers consistent results.",
    strengths: [
      "Process optimization",
      "Quality management",
      "Performance tracking",
      "Resource efficiency"
    ],
    challenges: [
      "Disruptive change",
      "Abstract thinking",
      "Creative exploration"
    ],
    idealRoles: [
      "Operations Director",
      "Quality Assurance Head",
      "Process Improvement Lead",
      "Production Manager"
    ],
    teamDynamics: "Creates highly efficient teams with clear processes and metrics.",
    growthAreas: [
      "Innovation mindset",
      "Change adaptation",
      "Vision creation"
    ]
  }
};