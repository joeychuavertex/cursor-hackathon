import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get the backend URL from environment variables
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'
    
    // Fetch judges from the backend using the /select endpoint without a specific judge
    const response = await fetch(`${backendUrl}/judges/select`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}), // Empty body to get the list of judges
    })

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const judges = await response.json()
    
    return NextResponse.json(judges)
  } catch (error) {
    console.error('Error fetching judges:', error)
    return NextResponse.json(
      { error: 'Failed to fetch judges' },
      { status: 500 }
    )
  }
}
