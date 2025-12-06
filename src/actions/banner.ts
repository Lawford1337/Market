'use server';

import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { revalidatePath } from 'next/cache';

export async function createBanner(formData: FormData) {
  const imageUrl = formData.get('imageUrl') as string;
  const link = formData.get('link') as string;

  if (!imageUrl) return { error: 'Нет картинки' };

  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  if (!token) return { error: 'Не авторизован' };

  try {
    const user = verify(token.value, process.env.JWT_SECRET || 'secret') as { id: number };

    // Проверка прав
    const dbUser = await db.user.findUnique({ where: { id: user.id } });
    if (dbUser?.role !== 'partner' && dbUser?.role !== 'admin') {
      return { error: 'Нет прав' };
    }

    await db.banner.create({
      data: {
        imageUrl,
        link,
        userId: user.id,
      }
    });

    revalidatePath('/profile');
    revalidatePath('/'); 
    
    return { success: true };

  } catch (e) {
    return { error: 'Ошибка сервера' };
  }
}

export async function deleteBanner(id: number) {
  try {
    await db.banner.delete({ where: { id } });
    revalidatePath('/profile');
    revalidatePath('/');
    return { success: true }; 
  } catch (e) {
    return { error: 'Ошибка удаления' };
  }
}
