'use client';

import { useState, useTransition } from 'react';
import { loginUser } from '@/actions/auth';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export const LoginForm = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  
  // Данные формы
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      // Вызываем серверный экшен
      const data = await loginUser({ 
        email, 
        password, 
        code: showTwoFactor ? code : undefined // Отправляем код только если мы на 2 шаге
      });

      if (data?.error) {
        toast.error(data.error);
      }

      if (data?.twoFactor) {
        setShowTwoFactor(true);
        toast.success('Код отправлен на почту!');
      }

      if (data?.success) {
        toast.success('Вход выполнен!');
        router.push('/profile');
        router.refresh();
      }
    });
  };

  return (
    <div style={{ maxWidth: 400, margin: '50px auto', padding: 30, border: '1px solid #ddd', borderRadius: 12 }}>
      <h2 style={{ marginBottom: 20, textAlign: 'center' }}>
        {showTwoFactor ? '🔐 Введите код' : '🔑 Вход'}
      </h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
        
        {/* Если 2FA включен, скрываем поля логина/пароля, но держим их в памяти */}
        {!showTwoFactor && (
          <>
            <div>
              <label>Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isPending}
                required
                style={{ width: '100%', padding: 10, marginTop: 5, borderRadius: 8, border: '1px solid #ccc' }}
              />
            </div>
            <div>
              <label>Пароль</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isPending}
                required
                style={{ width: '100%', padding: 10, marginTop: 5, borderRadius: 8, border: '1px solid #ccc' }}
              />
            </div>
          </>
        )}

        {showTwoFactor && (
          <div>
            <label>Код из письма</label>
            <input 
              type="text" 
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={isPending}
              placeholder="123456"
              style={{ width: '100%', padding: 10, marginTop: 5, borderRadius: 8, border: '1px solid #ccc', textAlign: 'center', letterSpacing: 5, fontSize: 20 }}
            />
          </div>
        )}

        <button 
          type="submit" 
          disabled={isPending}
          style={{ padding: 15, background: '#cb11ab', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold', marginTop: 10 }}
        >
          {isPending ? 'Загрузка...' : (showTwoFactor ? 'Подтвердить' : 'Войти')}
        </button>

      </form>
    </div>
  );
};