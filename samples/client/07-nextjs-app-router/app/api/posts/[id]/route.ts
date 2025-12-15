/**
 * 動的API Route Handler
 *
 * app/api/posts/[id]/route.ts → GET/PUT/DELETE /api/posts/:id
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPost, updatePost, deletePost } from '@/lib/db';

type RouteParams = {
  params: { id: string };
};

// GET /api/posts/:id
export async function GET(request: NextRequest, { params }: RouteParams) {
  const post = await getPost(params.id);

  if (!post) {
    return NextResponse.json(
      { error: 'Post not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(post);
}

// PUT /api/posts/:id
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json();

    const post = await updatePost(params.id, {
      title: body.title,
      content: body.content,
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Failed to update post:', error);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/:id
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const deleted = await deletePost(params.id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}

/*
 * 動的ルートのパラメータ:
 *
 * [id] → params.id
 * [slug] → params.slug
 * [...slug] → params.slug (配列)
 *
 * 例:
 * app/api/users/[userId]/posts/[postId]/route.ts
 * → params = { userId: '1', postId: '2' }
 */
