import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { redirect } from 'next/navigation';
import EditForm from './EditForm';

interface Props {
  params: Promise<{ id: string }>; // В Next.js 15 params - это Promise!
}

export default async function EditProductPage({ params }: Props) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  
  if (!token) redirect('/login');

  const user = verify(token.value, process.env.JWT_SECRET || 'secret') as { id: number };

  // 1. Ожидаем параметры (ВАЖНО!)
  const { id } = await params;

  // 2. Ищем товар
  const product = await db.product.findUnique({
    where: { id: Number(id) }
  });

  // 3. Если товара нет или это не мой товар — уходим
  if (!product || product.sellerId !== user.id) {
    redirect('/profile');
  }

  // 4. Передаем товар в форму. Теперь product точно не undefined.
  return <EditForm product={product} />;
}