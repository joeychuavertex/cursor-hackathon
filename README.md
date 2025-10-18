# 🦈 Shark Tank Simulator

An immersive AI-powered Shark Tank experience featuring realistic judge avatars with micro expressions, real-time speech recognition, and intelligent questioning powered by Gemini AI.

## ✨ Features

- **🎬 Cinematic Landing Page**: Immersive Three.js-powered landing experience with animated intro sequence
- **🚪 Interactive Door Entry**: Clickable 3D door that routes to the main application
- **🎭 3D Immersive Environment**: Full Three.js-powered 3D Shark Tank room with realistic lighting and shadows
- **🤖 3D Judge Avatars**: Detailed 3D models of iconic Shark Tank judges with micro expressions and animations
- **🎤 Interactive 3D Podium**: Realistic presentation podium with timer and microphone
- **🎨 Dynamic Lighting**: Professional lighting setup with spotlights, ambient lighting, and color effects
- **🔄 Smooth Animations**: Fluid micro expressions, floating animations, and reaction effects
- **📱 Camera Controls**: Orbit controls for 360° room exploration and dynamic camera positioning
- **🎯 Speech Recognition**: Present your pitch using voice or text input
- **🧠 AI-Powered Questions**: Judges ask intelligent, personalized questions based on your pitch
- **📊 Real-time Scoring**: Get detailed feedback and scores across multiple criteria
- **🎵 Voice Synthesis**: Hear judges speak with realistic voices using ElevenLabs
- **💾 Persistent Memory**: Judges remember your previous interactions using Mem0
- **📈 Session History**: Track your pitching progress with Supabase
- **🤖 Judge API Integration**: Real-time judge responses powered by OpenAI GPT-4 with conversation history

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **3D Graphics**: Three.js, React Three Fiber
- **AI & ML**: 
  - Gemini API for intelligent questioning and scoring
  - OpenAI GPT-4 for judge responses and conversation
  - ElevenLabs for voice synthesis
  - Mem0 for persistent memory
  - Fal.ai for avatar generation
- **Database**: Supabase for session storage
- **Additional**: Groq, Exa.ai for enhanced AI capabilities

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- API keys for the following services:
  - Gemini API
  - OpenAI API (for judge responses)
  - ElevenLabs
  - Supabase
  - Fal.ai
  - Mem0
  - Groq (optional)
  - Exa.ai (optional)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd shark-tank-simulator
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Add your API keys to `.env.local`:
```env
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_FAL_KEY=your_fal_key
NEXT_PUBLIC_MEM0_API_KEY=your_mem0_api_key
NEXT_PUBLIC_GROQ_API_KEY=your_groq_api_key
NEXT_PUBLIC_EXA_API_KEY=your_exa_api_key
BACKEND_URL=http://localhost:8000
```

5. Set up the Python backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r REQUIREMENTS.TXT
uvicorn main:app --reload --port 8000
```

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎮 How to Use

1. **Landing Experience**: Start with the cinematic Three.js landing page featuring an animated intro
2. **Enter the Tank**: Click the interactive 3D door to proceed to judge selection
3. **Select Judges**: Choose 2-5 judges from the available Shark Tank personalities
4. **Enter the Tank**: Step into the 3D presentation room
5. **Present Your Idea**: Use speech recognition or type your 30-second pitch
6. **Answer Questions**: Respond to intelligent questions from each judge
7. **Get Scored**: Receive detailed feedback and scores across multiple criteria
8. **Track Progress**: View your session history and improvement over time

## 🏗️ Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── judges/        # Judge API endpoints
│   │       └── chat/      # Chat completion endpoint
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── backend/               # Python FastAPI backend
│   ├── api/               # Backend API modules
│   │   └── judge.py       # Judge personality and chat logic
│   ├── main.py            # FastAPI application entry point
│   └── REQUIREMENTS.TXT   # Python dependencies
├── components/            # React components
│   ├── LandingPage.tsx    # Cinematic landing page with Three.js
│   ├── JudgeAvatar.tsx    # 3D judge avatar component
│   ├── JudgeSelection.tsx # Judge selection interface
│   ├── PresentationTimer.tsx # Presentation timer
│   ├── QuestionSession.tsx # Q&A session
│   ├── ScoringResults.tsx # Results display
│   ├── SharkTankRoom.tsx  # Main room component
│   └── SpeechRecognition.tsx # Speech input
├── hooks/                 # Custom React hooks
│   ├── useGeminiAI.ts     # Gemini AI integration
│   ├── useJudgeChat.ts    # Judge API integration
│   ├── useElevenLabs.ts   # Voice synthesis
│   ├── useSupabase.ts     # Database operations
│   └── useMem0.ts         # Memory management
├── lib/                   # Utility libraries
│   ├── config.ts          # Judge configurations
│   └── supabase.ts        # Database client
└── types/                 # TypeScript type definitions
    ├── judge.ts           # Judge-related types
    └── session.ts         # Session-related types
```

## 🎭 3D Features

### Immersive 3D Environment
- **Realistic Room**: Detailed 3D Shark Tank set with walls, floor, ceiling, and decorative elements
- **Professional Lighting**: Multiple light sources including spotlights, ambient lighting, and colored accent lights
- **Interactive Elements**: Clickable judges, floating money symbols, and animated decorations
- **Camera Controls**: Full orbit controls for 360° room exploration and zoom functionality

### 3D Judge Avatars
- **Detailed Models**: Realistic 3D representations of each Shark Tank judge
- **Micro Expressions**: 20+ different facial expressions and body language animations
- **Dynamic Reactions**: Judges react in real-time to your presentation with appropriate expressions
- **Individual Personalities**: Each judge has unique visual characteristics and animation styles

### 3D Presentation Podium
- **Realistic Design**: Professional presentation podium with microphone and timer display
- **Dynamic Timer**: Color-changing timer that reflects urgency (green → yellow → red)
- **Interactive Elements**: Pulsing animations and visual feedback during presentations
- **Shark Tank Branding**: Integrated logo and branding elements

## 🎯 Judge Personalities

### Barbara Corcoran
- **Focus**: Market potential and team strength
- **Expertise**: Real Estate, Marketing, Team Building
- **Personality**: Tough but fair, focuses on market potential
- **3D Features**: Gold-themed avatar with warm expressions

### Mark Cuban
- **Focus**: Innovation and scalability
- **Expertise**: Technology, Scaling, Investments
- **Personality**: Tech-focused, analytical, asks tough questions
- **3D Features**: Blue-themed avatar with intense, focused expressions

### Kevin O'Leary
- **Focus**: Financials and profitability
- **Expertise**: Finance, Profitability, Business Models
- **Personality**: Mr. Wonderful - brutally honest about numbers
- **3D Features**: Red-themed avatar with stern, calculating expressions

### Lori Greiner
- **Focus**: Consumer appeal and marketability
- **Expertise**: Consumer Products, Retail, Marketing
- **Personality**: The Queen of QVC - focuses on consumer appeal
- **3D Features**: Purple-themed avatar with excited, enthusiastic expressions

### Robert Herjavec
- **Focus**: Innovation and cybersecurity
- **Expertise**: Cybersecurity, Technology, Entrepreneurship
- **Personality**: Tech entrepreneur with cybersecurity background
- **3D Features**: Green-themed avatar with analytical, protective expressions

## 🤖 Judge API Integration

The application features a sophisticated judge API integration that provides realistic, personality-driven responses to business pitches:

### Features
- **Real-time Responses**: Judges respond immediately to your business proposal
- **Conversation History**: Maintains context throughout the entire session
- **Personality-driven**: Each judge responds according to their unique personality and expertise
- **Live Transcription**: All responses appear in the real-time transcription panel
- **Voice Synthesis**: Judge responses are spoken aloud using HeyGen avatars

### How It Works
1. **Pitch Submission**: When you complete your presentation, the text is sent to the judge API
2. **AI Processing**: The backend uses OpenAI GPT-4 with judge-specific prompts to generate responses
3. **Live Display**: Responses appear in the transcription panel with loading indicators
4. **Voice Output**: The judge's response is spoken through the HeyGen avatar

### API Endpoints
- `POST /api/judges/chat` - Send message to judge and get response
- `POST /backend/judges/generate` - Backend endpoint for AI processing

### Configuration
The judge personalities are defined in `backend/placeholder/personas.json` and can be customized to add new judges or modify existing ones.

## 🔧 Customization

### Adding New Judges
1. Add judge configuration in `lib/config.ts`
2. Define micro expressions and scoring criteria
3. Add voice ID for ElevenLabs synthesis
4. Add personality data in `backend/placeholder/personas.json`

### Modifying Scoring Criteria
Edit the `scoringCriteria` object in judge configurations to adjust how each judge evaluates pitches.

### Customizing Micro Expressions
Add new expressions in the `microExpressions` array and implement corresponding animations in `JudgeAvatar.tsx`.

## 📊 Database Schema

The app uses Supabase with the following tables:
- `sessions`: Store pitch sessions and scores
- `presentations`: Store presentation text and audio
- `questions`: Store judge questions and answers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Shark Tank for inspiration
- All the AI service providers for their amazing APIs
- The open-source community for the incredible tools and libraries

## 🐛 Known Issues

- Speech recognition requires Chrome or Safari
- Avatar generation may take a few seconds
- Some API calls may have rate limits

## 🔮 Future Enhancements

- [ ] Real-time 3D avatars with WebGL
- [ ] More judge personalities
- [ ] Multi-language support
- [ ] Mobile app version
- [ ] Advanced analytics dashboard
- [ ] Integration with video recording
- [ ] Social sharing features
