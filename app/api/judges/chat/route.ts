import { NextRequest, NextResponse } from 'next/server'
import { BACKEND_URL } from '@/lib/config'

interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface ConversationHistory {
  messages: Message[]
}

interface MessageRequest {
  judge: string
  conversation_history: ConversationHistory
  new_message: string
}

export async function POST(request: NextRequest) {
  try {
    const body: MessageRequest = await request.json()
    
    // Validate required fields
    if (!body.judge || !body.new_message) {
      return NextResponse.json(
        { error: 'Missing required fields: judge and new_message' },
        { status: 400 }
      )
    }

    // Call the Python backend
    const response = await fetch(`${BACKEND_URL}/judges/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.detail || 'Backend API error' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error calling judge API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
