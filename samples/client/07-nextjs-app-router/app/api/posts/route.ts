/**
 * API Route Handler
 *
 * app/api/posts/route.ts → GET/POST /api/posts
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPosts, createPost } from '@/lib/db';

// GET /api/posts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit');
  const offset = searchParams.get('offset');

  const posts = await getPosts({
    limit: limit ? parseInt(limit) : undefined,
    offset: offset ? parseInt(offset) : undefined,
  });

  return NextResponse.json(posts);
}

// POST /api/posts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // バリデーション
    if (!body.title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const post = await createPost({
      title: body.title,
      content: body.content,
      author: body.author,
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Failed to create post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}

/*
 * Route Handler の特徴:
 *
 * 1. HTTPメソッドで関数名を決める
 *    GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS
 *
 * 2. NextRequest / NextResponse
 *    - request.url でURLにアクセス
 *    - request.json() でボディを取得
 *    - NextResponse.json() でJSONレスポンス
 *
 * 3. 動的セグメント
 *    app/api/posts/[id]/route.ts
 *    → params.id でアクセス
 *
 * 4. キャッシュ制御
 *    export const dynamic = 'force-dynamic'; // 常に動的
 *    export const revalidate = 60; // 60秒キャッシュ
 */
