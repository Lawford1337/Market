'use server';

import { db } from '@/lib/db';
import { compare, hash } from 'bcryptjs'; // hash
import { cookies } from 'next/headers';
import { sign } from 'jsonwebtoken';
import { generateTwoFactorToken } from '@/lib/tokens'; 
import { sendTwoFactorTokenEmail } from '@/lib/mail';
import { LoginSchema } from '@/lib/schemas'; 
import { redirect } from 'next/navigation'; 

const SECRET = process.env.JWT_SECRET || 'secret';

// 2FA и Zod
export async function loginUser(values: any) {
  //  Валидация Zod
  const validatedFields = LoginSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: 'Неверные данные!' };
  }

  const { email, password, code } = validatedFields.data;

  // Ищем пользователя
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !user.password) {
    return { error: 'Пользователь не найден' };
  }

  // Проверяем пароль
  const passwordsMatch = await compare(password, user.password);
  if (!passwordsMatch) {
    return { error: 'Неверный пароль' };
  }

  //  ЛОГИКА 2FA 

  // Сценарий А: Кода нет 
  if (!code) {
    const twoFactorToken = await generateTwoFactorToken(user.email);
    await sendTwoFactorTokenEmail(twoFactorToken.email, twoFactorToken.token);
    return { twoFactor: true };
  }

  // Сценарий Б: Код есть 
  if (code) {
    const twoFactorToken = await db.twoFactorToken.findFirst({
      where: { email: user.email, token: code }
    });

    if (!twoFactorToken) {
      return { error: 'Неверный код!' };
    }

    const hasExpired = new Date(twoFactorToken.expires) < new Date();
    if (hasExpired) {
      return { error: 'Код истек!' };
    }

    await db.twoFactorToken.delete({
      where: { id: twoFactorToken.id }
    });
  }

  // Вход
  const token = sign(
    { id: user.id, email: user.email, role: user.role }, 
    SECRET, 
    { expiresIn: '7d' }
  );

  const cookieStore = await cookies();
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  return { success: true };
}

// registration 
export async function registerUser(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const username = formData.get('username') as string;

  if (!email || !password || !username) {
    // В серверных экшенах лучше не кидать throw new Error, если нет перехвата
    // но для простоты оставим redirect или return
    console.log('Ошибка: заполните поля');
    return; 
  }

  const existingUser = await db.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    redirect('/login'); 
  }

  //  hash импортирован и ошибки не будет
  const hashedPassword = await hash(password, 10);

  await db.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
      role: 'buyer',
    },
  });

  redirect('/login');
}

// logout
export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  redirect('/');
}