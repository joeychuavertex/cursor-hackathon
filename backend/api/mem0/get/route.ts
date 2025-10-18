import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    const userId = searchParams.get('userId')

    if (!key || !userId) {
      return NextResponse.json({ error: 'Key and userId are required' }, { status: 400 })
    }

    const response = await fetch(`https://api.mem0.ai/v1/memories?user_id=${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_MEM0_API_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Mem0 API error: ${response.statusText}`)
    }

    const result = await response.json()
    
    // Filter memories by key
    const filteredMemories = result.results?.filter((memory: any) => 
      memory.memory?.toLowerCase().includes(key.toLowerCase())
    ) || []

    return NextResponse.json({
      value: filteredMemories.length > 0 ? filteredMemories[0].memory : null,
      memories: filteredMemories
    })
  } catch (error) {
    console.error('Mem0 get error:', error)
    return NextResponse.json({ error: 'Failed to get memory' }, { status: 500 })
  }
}
