import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// Get all progress for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const progress = await prisma.progress.findMany({
      where: { userId: session.user.id },
      select: {
        slug: true,
        completed: true,
        completedAt: true,
      },
    });

    return NextResponse.json({ progress });
  } catch (error) {
    console.error('Progress fetch error:', error);
    return NextResponse.json(
      { error: '進捗の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// Toggle progress for a specific slug
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { slug, completed } = await req.json();

    if (!slug) {
      return NextResponse.json(
        { error: 'slugは必須です' },
        { status: 400 }
      );
    }

    const progress = await prisma.progress.upsert({
      where: {
        userId_slug: {
          userId: session.user.id,
          slug,
        },
      },
      update: {
        completed,
        completedAt: completed ? new Date() : null,
      },
      create: {
        userId: session.user.id,
        slug,
        completed,
        completedAt: completed ? new Date() : null,
      },
    });

    return NextResponse.json({ progress });
  } catch (error) {
    console.error('Progress update error:', error);
    return NextResponse.json(
      { error: '進捗の更新中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
