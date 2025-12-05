'use client';

import { deleteProduct } from '@/actions/seller';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const DeleteProductBtn = ({ id }: { id: number }) => {
  const handleDelete = async () => {
    if (!confirm('Точно удалить?')) return;
    
    const res = await deleteProduct(id);
    if (res?.error) {
      toast.error(res.error); 
    } else {
      toast.success('Товар удален');
    }
  };

  return (
    <button onClick={handleDelete} style={{ border: 'none', background: 'transparent', color: 'red', cursor: 'pointer' }}>
      <Trash2 size={18} />
    </button>
  );
};