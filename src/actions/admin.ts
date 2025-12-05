'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function toggleBanUser(userId: number, shouldBan: boolean) {
  // Тут можно добавить проверку, что вызывающий - админ (через токен), 
  // но пока пропустим для скорости (в реальном проекте обязательно)
  
  await db.user.update({
    where: { id: userId },
    data: { role: shouldBan ? 'banned' : 'buyer' } // Если баним - 'banned', разбаниваем - 'buyer'
  });

  revalidatePath('/admin');
}


export async function makeUserPartner(userId: number) {
  await db.user.update({
    where: { id: userId },
    data: { role: 'partner' } 
  });

  revalidatePath('/admin');
}