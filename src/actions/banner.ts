'use server';

import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createBanner(formData: FormData) {
  const imageUrl = formData.get('imageUrl') as string;
  const link = formData.get('link') as string;

  if (!imageUrl) return;

  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  if (!token) redirect('/login');

  const user = verify(token.value, process.env.JWT_SECRET || 'secret') as { id: number };

  // Проверка прав
  const dbUser = await db.user.findUnique({ where: { id: user.id } });
  if (dbUser?.role !== 'partner' && dbUser?.role !== 'admin') {
    throw new Error('Только партнеры могут создавать рекламу');
  }

  await db.banner.create({
    data: {
      imageUrl,
      link,
      userId: user.id,
    }
  });

  revalidatePath('/profile');
  revalidatePath('/'); // Обновляем главную, чтобы там появился баннер
}

export async function deleteBanner(id: number) {
  await db.banner.delete({ where: { id } });
  revalidatePath('/profile');
  revalidatePath('/');
}

// Того рот...