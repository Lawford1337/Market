'use client';

import { useState } from 'react';
import { updateProduct } from '@/actions/product';
import styles from '../../create/create.module.css'; // Используем те же стили!
import toast from 'react-hot-toast';
import Link from 'next/link';

// Тип данных, которые придут от сервера
interface ProductData {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
}

export default function EditForm({ product }: { product: ProductData }) {
  // Начальное состояние картинки берем из товара
  const [imageUrl, setImageUrl] = useState(product.images[0] || '');
  const [loading, setLoading] = useState(false);

  // --- Та же логика загрузки (Cloudinary) ---
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    const UPLOAD_PRESET = 'marketplace'; 
    const CLOUD_NAME = 'ddeujbnvy';    

    formData.append('upload_preset', UPLOAD_PRESET);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      
      setImageUrl(data.secure_url);
      toast.success('Новое фото загружено!');
    } catch (err) {
      toast.error('Ошибка загрузки фото');
    } finally {
      setLoading(false);
    }
  };

  return (
    
    <div className={styles.container}>
      <h1 className={styles.title}>Редактировать товар</h1>
      
      <form action={updateProduct} className={styles.form}>
        {/* СКРЫТОЕ ПОЛЕ С ID ТОВАРА */}
        <input type="hidden" name="id" value={product.id} />

        <div>
          <label className={styles.label}>Название</label>
          <input name="title" defaultValue={product.title} className={styles.input} required />
        </div>

        <div>
          <label className={styles.label}>Описание</label>
          <textarea name="description" defaultValue={product.description} className={styles.textarea} required />
        </div>

{/* ... Цена ... */}
        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ flex: 1 }}>
            <label className={styles.label}>Цена (₽)</label>
            <input name="price" type="number" placeholder="0" className={styles.input} required />
          </div>
          
          <div style={{ flex: 1 }}>
            <label className={styles.label}>Количество (шт)</label>
            <input name="quantity" type="number" defaultValue="1" min="1" className={styles.input} required />
          </div>
        </div>
        
        <div>
          <label className={styles.label}>Категория</label>
          <select name="category" className={styles.select}>
            <option value="electronics">Электроника</option>
            <option value="clothes">Одежда</option>
            <option value="home">Дом</option>
            <option value="auto">Автотовары</option> {/* Новые категории */}
            <option value="sport">Спорт</option>
            <option value="books">Книги</option>
            <option value="beauty">Красота</option>
          </select>
        </div>

        <div>
          <label className={styles.label}>Фотография</label>
          <div className={styles.uploadBox}>
            <input type="file" onChange={handleFileChange} accept="image/*" />
            {loading && <p style={{marginTop: 10}}>Загрузка...</p>}
          </div>
          {imageUrl && <img src={imageUrl} alt="Preview" className={styles.preview} />}
          <input type="hidden" name="imageUrl" value={imageUrl} />
        </div>

        <button type="submit" className={styles.button} disabled={loading}>
          Сохранить изменения
        </button>
      </form>

      <Link href="/profile" className={styles.backLink}>Отмена</Link>
    </div>
  );
}