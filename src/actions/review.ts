'use server'
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';


export async function addReview(formData: FormData) {
  const productId = Number(formData.get('productId'));
  const rating = Number(formData.get('rating'));
  const text = formData.get('text') as string;

  if (!text || !rating || !productId) return;

  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  if (!token) return { error: 'Нужно войти' };

  try {
    const user = verify(token.value, process.env.JWT_SECRET || 'secret') as { id: number };
 
    //  (Опционально) Проверка: А купил ли он этот товар?
    // Пока пропустил для простоты тестирования, но в будущем можно добавить запрос в OrderItem.

    await db.review.create({
      data: {
        text,
        rating,
        productId,
        userId: user.id,
      }
    });

    revalidatePath(`/product/${productId}`);
    return { success: true };

  } catch (e) {
    return { error: 'Ошибка сервера' };
  }
}