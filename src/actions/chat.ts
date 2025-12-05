'use server';

import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';



export async function sendMessage(formData: FormData) {
  const text = formData.get('text') as string;
  const imageUrl = formData.get('imageUrl') as string; 
  const receiverId = Number(formData.get('receiverId'));
  
  
  if ((!text && !imageUrl) || !receiverId) return;

  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  if (!token) redirect('/login');

  const sender = verify(token.value, process.env.JWT_SECRET || 'secret') as { id: number };

  await db.message.create({
    data: {
      text: text || '', 
      imageUrl: imageUrl || null, 
      senderId: sender.id,
      receiverId: receiverId,
    },
  });
  revalidatePath(`/chat/${receiverId}`);
}


export async function deleteMessage(messageId: number) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  if (!token) return;

  const user = verify(token.value, process.env.JWT_SECRET || 'secret') as { id: number };

  
  const message = await db.message.findUnique({
    where: { id: messageId }
  });

  if (!message) return;

  if (message.senderId !== user.id) {
    throw new Error('Нельзя удалять чужие сообщения');
  }

  await db.message.delete({
    where: { id: messageId }
  });

  revalidatePath(`/chat/${message.receiverId}`);
}