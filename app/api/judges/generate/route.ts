import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Get the backend URL from environment variables
    const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000'
    
    // Get the authorization header from the request
    const authorization = request.headers.get('authorization')
    
    if (!authorization) {
      return NextResponse.json(
        { error: 'Authorization header is required' },
        { status: 401 }
      )
    }
    
    // Get the request body
    const body = await request.json()
    
    // Forward the request to the backend
    const response = await fetch(`${backendUrl}/judges/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authorization,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      return NextResponse.json(
        { error: errorData?.detail || `Backend responded with status: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in judge generate API:', error)
    return NextResponse.json(
      { error: 'Failed to generate judge response' },
      { status: 500 }
    )
  }
}
