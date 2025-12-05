'use server';

import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { redirect } from 'next/navigation';

export async function createProduct(formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const price = Number(formData.get('price'));
  const category = formData.get('category') as string;
  const imageUrl = formData.get('imageUrl') as string;
  
  const quantity = Number(formData.get('quantity')) || 1;

  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  if (!token) {
    redirect('/login');
  }

  let userPayload;
  try {
    const secret = process.env.JWT_SECRET || 'secret';
    userPayload = verify(token.value, secret) as { id: number };
  } catch (e) {
    redirect('/login');
  }

  await db.product.create({
    data: {
      title,
      description,
      price,
      category,
      quantity: quantity,
      images: [imageUrl],
      sellerId: userPayload.id,
    },
  });

  console.log('✅ Товар создан:', title);
  redirect('/profile');
}


export async function updateProduct(formData: FormData) {
  const id = Number(formData.get('id'));
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const price = Number(formData.get('price'));
  const category = formData.get('category') as string;
  const imageUrl = formData.get('imageUrl') as string;
  
  const quantity = Number(formData.get('quantity'));

  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  if (!token) redirect('/login');

  const user = verify(token.value, process.env.JWT_SECRET || 'secret') as { id: number };

  const product = await db.product.findUnique({ where: { id } });
  
  if (!product || product.sellerId !== user.id) {
    throw new Error('У вас нет прав редактировать этот товар');
  }

  await db.product.update({
    where: { id },
    data: {
      title,
      description,
      price,
      category,
      quantity: quantity,
      images: [imageUrl],
    },
  });

  console.log('✅ Товар обновлен:', title);
  redirect('/profile');
}