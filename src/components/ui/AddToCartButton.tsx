'use client';

import { useCartStore } from '@/store/cart';
import toast from 'react-hot-toast'; 

// ВОТ ЭТОЙ ЧАСТИ НЕ ХВАТАЛО
interface Props {
  product: {
    id: number;
    title: string;
    price: number;
    images: string[];
  };
}

export const AddToCartButton = ({ product }: Props) => {
  const addItem = useCartStore((state) => state.addItem);

  const handleClick = () => {
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      imageUrl: product.images[0],
      quantity: 1,
    });
    
    toast.success('Добавлено в корзину');
  };

  return (
    <button
      onClick={handleClick}
      style={{
        background: '#cb11ab',
        color: 'white',
        border: 'none',
        padding: '15px 40px',
        fontSize: '18px',
        borderRadius: '10px',
        cursor: 'pointer',
        fontWeight: 'bold',
      }}
    >
      Добавить в корзину
    </button>
  );
};