'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod'; 
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { BecomeSellerSchema } from '@/lib/schemas'; 
import { redirect } from 'next/navigation';

export async function becomeSeller(values: any) {
  const validatedFields = BecomeSellerSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: 'Некорректные данные' };
  }

  const { city } = validatedFields.data;

  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  if (!token) return { error: 'Не авторизован' };

  try {
    const payload = verify(token.value, process.env.JWT_SECRET || 'secret') as { id: number };

    await db.user.update({
      where: { id: payload.id },
      data: {
        role: 'seller', // Меняем роль
        city: city,     // Сохраняем город
      }
    });
    
  } catch (e) {
    return { error: 'Ошибка сервера' };
  }

  return { success: true };
}


// Схема для валидации ID
const DeleteProductSchema = z.object({
  productId: z.number().positive(),
});

export async function deleteProduct(productId: number) {
  const result = DeleteProductSchema.safeParse({ productId });
  
  if (!result.success) {
    return { error: 'Некорректный ID товара' };
  }

  const activeOrders = await db.orderItem.findFirst({
    where: {
      productId: productId,
      order: {
        status: {
          not: 'received'
        }
      }
    }
  });

  if (activeOrders) {
    return { error: 'Нельзя удалить товар! Он есть в активных заказах. Дождитесь получения.' };
  }

  
  try {
    await db.product.delete({
      where: { id: productId }
    });
    
    revalidatePath('/profile');
    return { success: true };
  } catch (e) {
    return { error: 'Ошибка удаления. Возможно, товар связан с историей заказов.' };
  }
}


export async function confirmOrderReceived(orderId: number) {
  await db.order.update({
    where: { id: orderId },
    data: { status: 'received' }
  });
  revalidatePath('/profile');
}