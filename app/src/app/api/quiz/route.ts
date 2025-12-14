import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// Get quiz results for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (slug) {
      // Get result for specific quiz
      const result = await prisma.quizResult.findFirst({
        where: {
          userId: session.user.id,
          slug,
        },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ result });
    }

    // Get all results
    const results = await prisma.quizResult.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Quiz result fetch error:', error);
    return NextResponse.json(
      { error: 'クイズ結果の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// Save quiz result
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { slug, score, total, answers } = await req.json();

    if (!slug || score === undefined || !total || !answers) {
      return NextResponse.json(
        { error: '必須パラメータが不足しています' },
        { status: 400 }
      );
    }

    const result = await prisma.quizResult.create({
      data: {
        userId: session.user.id,
        slug,
        score,
        total,
        answers,
      },
    });

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Quiz result save error:', error);
    return NextResponse.json(
      { error: 'クイズ結果の保存中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
