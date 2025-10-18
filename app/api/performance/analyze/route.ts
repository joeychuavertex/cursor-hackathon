import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { conversationId } = await request.json()

    if (!conversationId) {
      return NextResponse.json({ error: 'conversationId is required' }, { status: 400 })
    }

    // Get authorization token from request headers
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization token is required' }, { status: 401 })
    }

    // Call the backend API
    const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000'

    const response = await fetch(`${backendUrl}/performance/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({
        conversation_id: conversationId,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.detail || 'Failed to analyze performance' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error analyzing performance:', error)
    return NextResponse.json(
      { error: 'Failed to analyze performance', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
