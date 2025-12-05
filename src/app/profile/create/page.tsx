'use client';

import { useState } from 'react';
import { createProduct } from '@/actions/product'; 
import styles from './create.module.css';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function CreateProductPage() {
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  // ЛОГИКА ЗАГРУЗКИ ФОТО 
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
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      setImageUrl(data.secure_url); // Сохраняем ссылку на фото
      toast.success('Фото успешно загружено!');
    } catch (err) {
      console.error(err);
      toast.error('Ошибка загрузки фото. Проверь Preset!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Новый товар</h1>
      
      {/* Форма отправит данные на сервер (createProduct) */}
      <form action={createProduct} className={styles.form}>
        
        <div>
          <label className={styles.label}>Название</label>
          <input name="title" placeholder="Например: iPhone 15" className={styles.input} required />
        </div>

        <div>
          <label className={styles.label}>Описание</label>
          <textarea name="description" placeholder="Расскажите о товаре..." className={styles.textarea} required />
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

        {/* Блок загрузки фото */}
        <div>
          <label className={styles.label}>Фотография</label>
          <div className={styles.uploadBox}>
            <input type="file" onChange={handleFileChange} accept="image/*" />
            {loading && <p style={{marginTop: 10, color: '#cb11ab'}}>Загрузка...</p>}
          </div>
          
          {/* Предпросмотр */}
          {imageUrl && (
            <img src={imageUrl} alt="Preview" className={styles.preview} />
          )}
          
          {/* Скрытое поле, чтобы передать ссылку на сервер вместе с формой */}
          <input type="hidden" name="imageUrl" value={imageUrl} />
        </div>

        {/* Кнопка заблокирована, пока фото не загрузится */}
        <button type="submit" className={styles.button} disabled={loading || !imageUrl}>
          {loading ? 'Ждем фото...' : 'Создать товар'}
        </button>
      </form>

      <Link href="/profile" className={styles.backLink}>
        ← Назад в профиль
      </Link>
    </div>
  );
}