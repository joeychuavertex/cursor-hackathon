import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface GeneratePersonalityRequest {
  name: string
  specialties: string[]
  investmentStyle: string
  causes?: string[]
}

export async function POST(request: NextRequest) {
  try {
    const { name, specialties, investmentStyle, causes = [] }: GeneratePersonalityRequest = await request.json()

    if (!name || !specialties || !investmentStyle) {
      return NextResponse.json({ error: 'Name, specialties, and investment style are required' }, { status: 400 })
    }

    const prompt = `Create a detailed Shark Tank judge personality for "${name}" based on the following information:

Name: ${name}
Specialties: ${specialties.join(', ')}
Investment Style: ${investmentStyle}
Causes: ${causes.length > 0 ? causes.join(', ') : 'Not specified'}

Please generate a comprehensive judge profile that includes:

1. A detailed personality description (2-3 sentences)
2. 4-6 personality traits
3. 3-4 catchphrases they might use
4. Scoring criteria weights (innovation, marketPotential, team, financials, presentation) that total to 1.0
5. 4-5 micro expressions with triggers, durations, and intensities

Format the response as JSON with the following structure:
{
  "personality": "detailed personality description",
  "personalityTraits": ["trait1", "trait2", "trait3", "trait4", "trait5", "trait6"],
  "catchphrases": ["catchphrase1", "catchphrase2", "catchphrase3", "catchphrase4"],
  "scoringCriteria": {
    "innovation": 0.0,
    "marketPotential": 0.0,
    "team": 0.0,
    "financials": 0.0,
    "presentation": 0.0
  },
  "microExpressions": [
    {
      "id": "expression1",
      "name": "Expression Name",
      "trigger": "trigger_condition",
      "duration": 2000,
      "intensity": 0.8
    }
  ]
}

Make the personality authentic to a real Shark Tank judge - they should be direct, insightful, and have strong opinions about business. The scoring criteria should reflect their investment style and specialties.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert at creating realistic Shark Tank judge personalities. Generate detailed, authentic profiles that would fit perfectly in the Shark Tank environment."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 2000
    })

    const responseText = completion.choices[0]?.message?.content
    if (!responseText) {
      throw new Error('No response from OpenAI')
    }

    // Parse the JSON response
    const judgeProfile = JSON.parse(responseText)

    // Validate that scoring criteria adds up to 1.0
    const totalWeight = (Object.values(judgeProfile.scoringCriteria) as number[]).reduce((sum: number, weight: number) => sum + weight, 0)
    if (Math.abs(totalWeight - 1.0) > 0.01) {
      // Normalize the weights
      Object.keys(judgeProfile.scoringCriteria).forEach(key => {
        judgeProfile.scoringCriteria[key] = judgeProfile.scoringCriteria[key] / totalWeight
      })
    }

    return NextResponse.json(judgeProfile)
  } catch (error) {
    console.error('Error generating judge personality:', error)
    return NextResponse.json({ error: 'Failed to generate judge personality' }, { status: 500 })
  }
}
