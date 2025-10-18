import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { key, value, userId } = await request.json()

    if (!key || !value || !userId) {
      return NextResponse.json({ error: 'Key, value, and userId are required' }, { status: 400 })
    }

    const response = await fetch('https://api.mem0.ai/v1/memories', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_MEM0_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: `Store this information: ${key}: ${JSON.stringify(value)}`
          }
        ],
        user_id: userId,
      }),
    })

    if (!response.ok) {
      throw new Error(`Mem0 API error: ${response.statusText}`)
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Mem0 save error:', error)
    return NextResponse.json({ error: 'Failed to save memory' }, { status: 500 })
  }
}
