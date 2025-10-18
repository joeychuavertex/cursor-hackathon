import { Judge } from '@/types/judge'

export const JUDGES: Judge[] = [
  {
    id: 'barbara',
    name: 'Barbara Corcoran',
    personality: 'Tough but fair, focuses on market potential and team strength',
    expertise: ['Real Estate', 'Marketing', 'Team Building'],
    avatarUrl: '',
    voiceId: 'barbara_voice',
    isHeyGenAvatar: true,
    heygenAvatarId: process.env.NEXT_PUBLIC_HEYGEN_AVATAR_ID || 'Ann_Therapist_public',
    microExpressions: [
      { id: 'smile', name: 'Approving Smile', trigger: 'positive_feedback', duration: 2000, intensity: 0.8 },
      { id: 'frown', name: 'Concerned Frown', trigger: 'financial_concern', duration: 1500, intensity: 0.6 },
      { id: 'nod', name: 'Understanding Nod', trigger: 'listening', duration: 1000, intensity: 0.4 },
      { id: 'raise_eyebrow', name: 'Skeptical Look', trigger: 'skepticism', duration: 1200, intensity: 0.7 }
    ],
    scoringCriteria: {
      innovation: 0.2,
      marketPotential: 0.3,
      team: 0.25,
      financials: 0.15,
      presentation: 0.1
    }
  },
  {
    id: 'mark',
    name: 'Mark Cuban',
    personality: 'Tech-focused, analytical, asks tough questions about scalability',
    expertise: ['Technology', 'Scaling', 'Investments'],
    avatarUrl: '',
    voiceId: 'mark_voice',
    microExpressions: [
      { id: 'intense_stare', name: 'Intense Focus', trigger: 'analyzing', duration: 3000, intensity: 0.9 },
      { id: 'smirk', name: 'Confident Smirk', trigger: 'approval', duration: 1500, intensity: 0.7 },
      { id: 'head_tilt', name: 'Curious Tilt', trigger: 'questioning', duration: 2000, intensity: 0.5 },
      { id: 'lean_forward', name: 'Engaged Lean', trigger: 'interest', duration: 2500, intensity: 0.8 }
    ],
    scoringCriteria: {
      innovation: 0.35,
      marketPotential: 0.25,
      team: 0.15,
      financials: 0.15,
      presentation: 0.1
    }
  },
  {
    id: 'kevin',
    name: 'Kevin O\'Leary',
    personality: 'Mr. Wonderful - brutally honest about numbers and profitability',
    expertise: ['Finance', 'Profitability', 'Business Models'],
    avatarUrl: '',
    voiceId: 'kevin_voice',
    microExpressions: [
      { id: 'stern_look', name: 'Stern Expression', trigger: 'financial_concern', duration: 2000, intensity: 0.8 },
      { id: 'slight_smile', name: 'Satisfied Smile', trigger: 'profit_approval', duration: 1800, intensity: 0.6 },
      { id: 'shake_head', name: 'Disapproval', trigger: 'poor_numbers', duration: 1500, intensity: 0.9 },
      { id: 'calculating_look', name: 'Calculating', trigger: 'analyzing_numbers', duration: 3000, intensity: 0.7 }
    ],
    scoringCriteria: {
      innovation: 0.1,
      marketPotential: 0.2,
      team: 0.1,
      financials: 0.5,
      presentation: 0.1
    }
  },
  {
    id: 'lori',
    name: 'Lori Greiner',
    personality: 'The Queen of QVC - focuses on consumer appeal and marketability',
    expertise: ['Consumer Products', 'Retail', 'Marketing'],
    avatarUrl: '',
    voiceId: 'lori_voice',
    microExpressions: [
      { id: 'excited_eyes', name: 'Excited Eyes', trigger: 'product_excitement', duration: 2000, intensity: 0.8 },
      { id: 'thoughtful_touch', name: 'Thoughtful Touch', trigger: 'considering', duration: 2500, intensity: 0.6 },
      { id: 'warm_smile', name: 'Warm Smile', trigger: 'approval', duration: 1800, intensity: 0.7 },
      { id: 'concerned_look', name: 'Concerned Look', trigger: 'market_concern', duration: 2000, intensity: 0.5 }
    ],
    scoringCriteria: {
      innovation: 0.15,
      marketPotential: 0.4,
      team: 0.15,
      financials: 0.2,
      presentation: 0.1
    }
  },
  {
    id: 'robert',
    name: 'Robert Herjavec',
    personality: 'Tech entrepreneur with cybersecurity background, values innovation',
    expertise: ['Cybersecurity', 'Technology', 'Entrepreneurship'],
    avatarUrl: '',
    voiceId: 'robert_voice',
    microExpressions: [
      { id: 'intrigued_look', name: 'Intrigued Look', trigger: 'tech_interest', duration: 2200, intensity: 0.8 },
      { id: 'protective_stance', name: 'Protective Stance', trigger: 'security_concern', duration: 2000, intensity: 0.7 },
      { id: 'encouraging_nod', name: 'Encouraging Nod', trigger: 'support', duration: 1500, intensity: 0.6 },
      { id: 'analytical_focus', name: 'Analytical Focus', trigger: 'deep_analysis', duration: 3000, intensity: 0.9 }
    ],
    scoringCriteria: {
      innovation: 0.3,
      marketPotential: 0.25,
      team: 0.2,
      financials: 0.15,
      presentation: 0.1
    }
  }
]

export const PRESENTATION_DURATION = 30 // seconds
export const MAX_QUESTIONS_PER_JUDGE = 3
export const SATISFACTION_THRESHOLD = 0.7
