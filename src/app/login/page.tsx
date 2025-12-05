import { LoginForm } from '@/components/auth/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div>
      <LoginForm />
      
      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <Link href="/register" style={{ color: '#cb11ab' }}>
          Нет аккаунта? Зарегистрироваться
        </Link>
      </div>
    </div>
  );
}