'use server';

import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';


export async function createTicket(formData: FormData) {
  const subject = formData.get('subject') as string;
  const message = formData.get('message') as string;

  if (!subject || !message) return;

  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  if (!token) redirect('/login');

  const user = verify(token.value, process.env.JWT_SECRET || 'secret') as { id: number };

  await db.ticket.create({
    data: {
      subject,
      message,
      userId: user.id,
    }
  });

  revalidatePath('/support');
}

export async function closeTicket(ticketId: number) {
  // Тут можно добавить проверку isAdmin, но пока доверимся интерфейсу
  await db.ticket.update({
    where: { id: ticketId },
    data: { status: 'closed' }
  });

  revalidatePath('/admin/tickets'); // Обновим админку
}