import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Get annotations for a specific document
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ error: 'slugは必須です' }, { status: 400 });
    }

    const annotations = await prisma.annotation.findMany({
      where: {
        userId: session.user.id,
        slug,
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ annotations });
  } catch (error) {
    console.error('Annotation fetch error:', error);
    return NextResponse.json(
      { error: 'アノテーションの取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// Create a new annotation
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { slug, selectedText, prefix, suffix, comment, color } = await req.json();

    if (!slug || !selectedText || !comment) {
      return NextResponse.json(
        { error: '必須パラメータが不足しています' },
        { status: 400 }
      );
    }

    const annotation = await prisma.annotation.create({
      data: {
        userId: session.user.id,
        slug,
        selectedText,
        prefix: prefix || '',
        suffix: suffix || '',
        comment,
        color: color || 'yellow',
      },
    });

    return NextResponse.json({ annotation });
  } catch (error) {
    console.error('Annotation create error:', error);
    return NextResponse.json(
      { error: 'アノテーションの作成中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// Delete an annotation
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'idは必須です' }, { status: 400 });
    }

    // Verify ownership
    const annotation = await prisma.annotation.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!annotation) {
      return NextResponse.json(
        { error: 'アノテーションが見つかりません' },
        { status: 404 }
      );
    }

    await prisma.annotation.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Annotation delete error:', error);
    return NextResponse.json(
      { error: 'アノテーションの削除中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// Update an annotation
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { id, comment, color } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'idは必須です' }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.annotation.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'アノテーションが見つかりません' },
        { status: 404 }
      );
    }

    const annotation = await prisma.annotation.update({
      where: { id },
      data: {
        ...(comment !== undefined && { comment }),
        ...(color !== undefined && { color }),
      },
    });

    return NextResponse.json({ annotation });
  } catch (error) {
    console.error('Annotation update error:', error);
    return NextResponse.json(
      { error: 'アノテーションの更新中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
