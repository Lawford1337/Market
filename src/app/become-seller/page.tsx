import { BecomeSellerForm } from '@/components/auth/BecomeSellerForm';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import styles from './page.module.css';

export default async function BecomeSellerPage() {
  // Защита: только для авторизованных
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  
  if (!token) {
    redirect('/login');
  }

  return (
    <div>
      <BecomeSellerForm />
    </div>
  );
}