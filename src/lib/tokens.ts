import { db } from "@/lib/db";
import crypto from "crypto";

export const generateTwoFactorToken = async (email: string) => {
  const token = crypto.randomInt(100_000, 1_000_000).toString();
  
  // 2. Код живет 5 минут
  const expires = new Date(new Date().getTime() + 5 * 60 * 1000);
// 3. удаляем старое письмо от картеля
  const existingToken = await db.twoFactorToken.findFirst({
    where: { email }
  });

  if (existingToken) {
    await db.twoFactorToken.delete({
      where: { id: existingToken.id }
    });
  }

  // 4. Создаем новый
  const twoFactorToken = await db.twoFactorToken.create({
    data: {
      email,
      token,
      expires,
    }
  });

  return twoFactorToken;
};