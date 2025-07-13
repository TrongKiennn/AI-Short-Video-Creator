import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const {
      input,
      width = 1024,
      height = 1024,
      model = 'sdxl',
    } = await request.json();

    if (!input) {
      return NextResponse.json(
        { error: 'Image prompt is required' },
        { status: 400 }
      );
    }

    // Use your AIGuruLab API key from environment
    const API_KEY = process.env.NEXT_PUBLIC_AIGURULAB_API_KEY;

    if (!API_KEY) {
      return NextResponse.json(
        { error: 'AIGuruLab API key not configured' },
        { status: 500 }
      );
    }

    console.log(
      '🎨 Generating image with prompt:',
      input.substring(0, 100) + '...'
    );

    // Call AIGuruLab API
    const response = await fetch(
      'https://www.aigurulab.tech/api/generate-image',
      {
        method: 'POST',
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input,
          width,
          height,
          model,
          aspectRatio: '1:1',
        }),
        redirect: 'follow', // Follow redirects automatically
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AIGuruLab API error:', response.status, errorText);

      // If external API fails, return a placeholder image URL
      console.log('🔄 AIGuruLab API failed, using fallback placeholder');
      return NextResponse.json({
        success: true,
        image: '/default.png', // Use your default placeholder image
        message: 'Generated with fallback placeholder due to API limitations',
      });
    }

    const data = await response.json();

    if (data.image) {
      console.log('✅ Image generated successfully');
      return NextResponse.json({
        success: true,
        image: data.image,
      });
    } else {
      console.log('🔄 No image in response, using fallback');
      return NextResponse.json({
        success: true,
        image: '/default.png',
        message: 'Generated with fallback placeholder',
      });
    }
  } catch (error) {
    console.error('Image generation error:', error);

    // Always return a fallback to prevent workflow from breaking
    return NextResponse.json({
      success: true,
      image: '/default.png',
      message: 'Generated with fallback placeholder due to error',
    });
  }
}
