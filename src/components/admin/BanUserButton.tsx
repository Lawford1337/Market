'use client';

import { toggleBanUser } from '@/actions/admin';
import { useTransition } from 'react';
import toast from 'react-hot-toast';

export const BanUserButton = ({ userId, isBanned }: { userId: number, isBanned: boolean }) => {
  const [isPending, startTransition] = useTransition();

  const handleBan = () => {
    if (!confirm(isBanned ? 'Разбанить?' : 'Забанить пользователя?')) return;

    startTransition(async () => {
      await toggleBanUser(userId, !isBanned);
      toast.success(isBanned ? 'Пользователь разбанен' : 'Пользователь забанен 🔨');
    });
  };

  return (
    <button 
      onClick={handleBan}
      disabled={isPending}
      style={{
        padding: '5px 10px',
        borderRadius: 5,
        border: 'none',
        cursor: 'pointer',
        background: isBanned ? '#28a745' : '#ff4444',
        color: 'white',
        fontSize: 12
      }}
    >
      {isBanned ? 'Разбанить' : 'Забанить'}
    </button>
  );
};