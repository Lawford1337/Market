import CartClient from '@/components/carts/CartClient';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';

export default async function CartPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  
  let userBonuses = 0;

  // Если юзер залогинен — узнаем его бонусы
  if (token) {
    try {
      const payload = verify(token.value, process.env.JWT_SECRET || 'secret') as { id: number };
      const user = await db.user.findUnique({ 
        where: { id: payload.id },
        select: { bonuses: true } // Достаем только бонусы
      });
      if (user) {
        userBonuses = user.bonuses;
      }
    } catch (e) {
      // Если токен протух, просто считаем что бонусов 0
    }
  }

  // Отдаем клиенту готовые данные
  return <CartClient userBonuses={userBonuses} />;
}