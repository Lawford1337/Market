'use client';

import { deleteMessage } from '@/actions/chat';
import { Trash2 } from 'lucide-react';
import { useTransition } from 'react';
import toast from 'react-hot-toast';

export const DeleteMsgBtn = ({ id }: { id: number }) => {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm('Удалить сообщение?')) return;

    startTransition(async () => {
      await deleteMessage(id);
      toast.success('Удалено');
    });
  };

  return (
    <button 
      onClick={handleDelete} 
      disabled={isPending}
      style={{
        background: 'transparent',
        border: 'none',
        color: 'white', 
        cursor: 'pointer',
        marginLeft: 10,
        opacity: 0.7,
        padding: 0
      }}
      title="Удалить"
    >
      <Trash2 size={14} />
    </button>
  );
};