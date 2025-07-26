import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';

function getTokenFromHeader(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) return null;
  return auth.replace('Bearer ', '');
}

export async function GET(req: NextRequest) {
  const token = getTokenFromHeader(req);
  const payload = token && verifyJWT(token);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const skip = (page - 1) * limit;

  const [notes, total] = await Promise.all([
    prisma.note.findMany({
      where: { userId: (payload as any).userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        content: true,
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
    prisma.note.count({ where: { userId: (payload as any).userId } }),
  ]);

  return NextResponse.json({ notes, total, page, limit });
}

export async function POST(req: NextRequest) {
  const token = getTokenFromHeader(req);
  const payload = token && verifyJWT(token);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { title, content, tagNames, favorite } = await req.json();
  // tagNames: string[]

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

  // Create note
  const note = await prisma.note.create({
    data: {
      title,
      content,
      favorite: !!favorite,
      userId: (payload as any).userId,
      tags: {
        create: tags.map((tag) => ({ tagId: tag.id })),
      },
    },
    include: { tags: { include: { tag: true } } },
  });
  return NextResponse.json(note);
}

export async function PUT(req: NextRequest) {
  const token = getTokenFromHeader(req);
  const payload = token && verifyJWT(token);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, title, content, tagNames, favorite } = await req.json();

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
  await prisma.noteTag.deleteMany({ where: { noteId: id } });

  // Update note
  const note = await prisma.note.update({
    where: { id, userId: (payload as any).userId },
    data: {
      title,
      content,
      favorite: !!favorite,
      tags: {
        create: tags.map((tag) => ({ tagId: tag.id })),
      },
    },
    include: { tags: { include: { tag: true } } },
  });
  return NextResponse.json(note);
}

export async function DELETE(req: NextRequest) {
  const token = getTokenFromHeader(req);
  const payload = token && verifyJWT(token);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await req.json();
  await prisma.note.delete({ where: { id, userId: (payload as any).userId } });
  return NextResponse.json({ success: true });
}

// SubNote CRUD API
export async function PATCH(req: NextRequest) {
  const token = getTokenFromHeader(req);
  const payload = token && verifyJWT(token);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { action, noteId, subNoteId, title, content } = await req.json();

  if (action === 'get') {
    // Get all sub-notes for a note
    const subNotes = await prisma.subNote.findMany({
      where: { noteId },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(subNotes);
  }

  if (action === 'create') {
    const subNote = await prisma.subNote.create({
      data: {
        noteId,
        title,
        content,
      },
    });
    return NextResponse.json(subNote);
  }

  if (action === 'update') {
    const subNote = await prisma.subNote.update({
      where: { id: subNoteId },
      data: { title, content },
    });
    return NextResponse.json(subNote);
  }

  if (action === 'delete') {
    await prisma.subNote.delete({ where: { id: subNoteId } });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
} 