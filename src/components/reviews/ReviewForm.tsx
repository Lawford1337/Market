'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { addReview } from '@/actions/review';
import toast from 'react-hot-toast';

export const ReviewForm = ({ productId }: { productId: number }) => {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);

  const handleSubmit = async (formData: FormData) => {
    // Добавляем рейтинг в форму вручную, так как это не input
    formData.append('rating', rating.toString());
    
    const res = await addReview(formData);
    if (res?.success) {
      toast.success('Отзыв опубликован!');
      // Очистка формы (по желанию можно сбросить text через ref)
    } else {
      toast.error('Ошибка');
    }
  };

  return (
    <form action={handleSubmit} style={{ marginTop: 20, padding: 20, border: '1px solid #eee', borderRadius: 12 }}>
      <h3>Оставить отзыв</h3>
      
      {/* Звезды */}
      <div style={{ display: 'flex', gap: 5, margin: '10px 0', cursor: 'pointer' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star}
            size={24}
            fill={(hover || rating) >= star ? '#FFD700' : 'transparent'} 
            color={(hover || rating) >= star ? '#FFD700' : '#ccc'}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(star)}
          />
        ))}
      </div>
      <div style={{fontSize: 12, color: '#888', marginBottom: 10}}>Ваша оценка: {rating} из 5</div>

      <input type="hidden" name="productId" value={productId} />
      
      <textarea 
        name="text" 
        placeholder="Как вам товар?" 
        required
        style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc', minHeight: 80 }} 
      />

      <button type="submit" style={{ marginTop: 10, padding: '10px 20px', background: '#333', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
        Отправить отзыв
      </button>
    </form>
  );
};