import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { prompt, judgeId } = await request.json()

    if (!prompt || !judgeId) {
      return NextResponse.json({ error: 'Prompt and judgeId are required' }, { status: 400 })
    }

    const response = await fetch('https://fal.run/fal-ai/flux/schnell', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.NEXT_PUBLIC_FAL_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: `${prompt}, professional headshot, business attire, confident expression, high quality, photorealistic`,
        image_size: 'square_hd',
        num_inference_steps: 4,
        enable_safety_checker: true,
      }),
    })

    if (!response.ok) {
      throw new Error(`Fal.ai API error: ${response.statusText}`)
    }

    const result = await response.json()
    
    return NextResponse.json({
      imageUrl: result.images[0].url,
      judgeId,
    })
  } catch (error) {
    console.error('Fal.ai avatar generation error:', error)
    return NextResponse.json({ error: 'Failed to generate avatar' }, { status: 500 })
  }
}
