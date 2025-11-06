import { NextRequest, NextResponse } from 'next/server';
import { firestore, FieldValue } from '@/lib/firebaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      question,
      userId,
      deviceType,
      screenSize,
      timezone,
      language,
      pageUrl
    } = body;

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Invalid question' },
        { status: 400 }
      );
    }

    const userAgent = request.headers.get('user-agent') || '';

    // Detect platform from user agent
    const platform = userAgent.includes('Win') ? 'Windows' :
                     userAgent.includes('Mac') ? 'macOS' :
                     userAgent.includes('Linux') ? 'Linux' :
                     userAgent.includes('Android') ? 'Android' :
                     userAgent.includes('iOS') ? 'iOS' : 'Unknown';

    // Simpan pertanyaan ke Firestore dengan metadata lengkap
    const docRef = await firestore.collection('questions').add({
      // Core data
      question: question.trim(),
      questionLength: question.trim().length,
      userId: userId || null,

      // Timestamps
      createdAt: FieldValue.serverTimestamp(),

      // Device & Browser info
      userAgent,
      deviceType: deviceType || 'unknown',
      screenSize: screenSize || null,
      platform,

      // Context
      pageUrl: pageUrl || null,
      referrer: request.headers.get('referer') || null,
      language: language || null,
      timezone: timezone || null,

      // Status
      isAnonymous: !userId,
      status: 'pending',
    });

    return NextResponse.json(
      {
        success: true,
        id: docRef.id,
        message: 'Question saved successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to save question to Firestore:', error);
    return NextResponse.json(
      { error: 'Failed to save question' },
      { status: 500 }
    );
  }
}
