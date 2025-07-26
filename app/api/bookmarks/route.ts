import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

function getTokenFromHeader(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) return null;
  return auth.replace('Bearer ', '');
}

async function fetchMetadata(url: string) {
  try {
    const res = await fetch(url, { timeout: 5000 });
    const html = await res.text();
    const $ = cheerio.load(html);
    const title = $('title').text() || '';
    const description = $('meta[name="description"]').attr('content') || '';
    return { title, description };
  } catch {
    return { title: '', description: '' };
  }
}

export async function GET(req: NextRequest) {
  const token = getTokenFromHeader(req);
  const payload = token && verifyJWT(token);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const skip = (page - 1) * limit;

  const [bookmarks, total] = await Promise.all([
    prisma.bookmark.findMany({
      where: { userId: (payload as any).userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        url: true,
        title: true,
        description: true,
        favorite: true,
        createdAt: true,
        updatedAt: true,
        tags: {
          select: {
            tag: { select: { name: true } }
          }
        }
      },
    }),
    prisma.bookmark.count({ where: { userId: (payload as any).userId } }),
  ]);

  return NextResponse.json({ bookmarks, total, page, limit });
}

export async function POST(req: NextRequest) {
  const token = getTokenFromHeader(req);
  const payload = token && verifyJWT(token);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let { url, title, description, tagNames, favorite } = await req.json();
  // tagNames: string[]

  // If title or description missing, fetch from URL
  if (!title || !description) {
    const meta = await fetchMetadata(url);
    if (!title) title = meta.title;
    if (!description) description = meta.description;
  }

  // Upsert tags
  const tags = await Promise.all(
    (tagNames || []).map((name: string) =>
      prisma.tag.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  );

  // Create bookmark
  const bookmark = await prisma.bookmark.create({
    data: {
      url,
      title,
      description,
      favorite: !!favorite,
      userId: (payload as any).userId,
      tags: {
        create: tags.map((tag) => ({ tagId: tag.id })),
      },
    },
    include: { tags: { include: { tag: true } } },
  });
  return NextResponse.json(bookmark);
}

export async function PUT(req: NextRequest) {
  const token = getTokenFromHeader(req);
  const payload = token && verifyJWT(token);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, url, title, description, tagNames, favorite } = await req.json();

  // Upsert tags
  const tags = await Promise.all(
    (tagNames || []).map((name: string) =>
      prisma.tag.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  );

  // Remove old tags
  await prisma.bookmarkTag.deleteMany({ where: { bookmarkId: id } });

  // Update bookmark
  const bookmark = await prisma.bookmark.update({
    where: { id, userId: (payload as any).userId },
    data: {
      url,
      title,
      description,
      favorite: !!favorite,
      tags: {
        create: tags.map((tag) => ({ tagId: tag.id })),
      },
    },
    include: { tags: { include: { tag: true } } },
  });
  return NextResponse.json(bookmark);
}

export async function DELETE(req: NextRequest) {
  const token = getTokenFromHeader(req);
  const payload = token && verifyJWT(token);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await req.json();
  await prisma.bookmark.delete({ where: { id, userId: (payload as any).userId } });
  return NextResponse.json({ success: true });
} 