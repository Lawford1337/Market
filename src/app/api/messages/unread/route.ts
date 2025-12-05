import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  if (!token) return NextResponse.json({ count: 0 });

  try {
    const me = verify(token.value, process.env.JWT_SECRET || 'secret') as { id: number };

    // Считаем сообщения, где я получатель, и (в идеале) статус "не прочитано"
    // Но пока у нас нет поля isRead, будем просто искать новые за последние 10 секунд
    // ДЛЯ ПРОСТОТЫ: Просто вернем количество входящих сообщений всего.
    // Если число выросло - значит пришло новое.
    
    const count = await db.message.count({
      where: {
        receiverId: me.id
      }
    });

    return NextResponse.json({ count });
  } catch (e) {
    return NextResponse.json({ count: 0 });
  }
}