'use client';

import { useState, useTransition, FormEvent } from 'react';
import { createBanner } from '@/actions/banner';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export const CreateBannerForm = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // 1. Загрузка фото в Cloudinary
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
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
      
      console.log("📸 Ответ Cloudinary:", data); // ЛОГ 1

      if (data.error) {
        toast.error('Ошибка Cloudinary: ' + data.error.message);
      } else {
        setImageUrl(data.secure_url || '');
        toast.success('Фото готово!');
      }
    } catch (err) {
      console.error(err);
      toast.error('Ошибка сети при загрузке фото');
    } finally {
      setUploading(false);
    }
  };

  // 2. Отправка формы (Классический метод)
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Останавливаем стандартную отправку
    console.log(" Кнопка нажата!"); // ЛОГ 2

    // Собираем данные формы вручную
    const formData = new FormData(e.currentTarget);
    
    // Если картинки нет в форме, добавим её вручную из стейта
    if (!formData.get('imageUrl') && imageUrl) {
      formData.set('imageUrl', imageUrl);
    }

    console.log(" Данные перед отправкой:", Object.fromEntries(formData)); // ЛОГ 3

    startTransition(async () => {
      const res = await createBanner(formData);
      
      console.log("📩 Ответ сервера:", res); // ЛОГ 4
      
      if (res?.error) {
        toast.error(res.error);
      }
      
      if (res?.success) {
        toast.success('Баннер опубликован! 🚀');
        setImageUrl('');
        router.refresh();
      }
    });
  };

  return (
    <div style={{ padding: 20, border: '1px solid #cb11ab', borderRadius: 12, background: '#fdfdfd', marginBottom: 30 }}>
      <h3>📢 Создать рекламу</h3>
      
      {/* Используем onSubmit вместо action */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 15 }}>
        
        <input type="file" onChange={handleFileChange} accept="image/*" />
        
        {imageUrl && <img src={imageUrl} style={{ height: 100, objectFit: 'contain' }} alt="Preview" />}
        
        {/* Скрытое поле обязательно! */}
        <input type="hidden" name="imageUrl" value={imageUrl || ''} />

        <input name="link" placeholder="Ссылка (https://t.me/...)" style={{ padding: 10, borderRadius: 5, border: '1px solid #ccc' }} />

        <button 
          type="submit" 
          style={{ 
            padding: 10, 
            background: '#cb11ab', 
            color: 'white', 
            border: 'none', 
            borderRadius: 5, 
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          {isPending ? 'Публикуем...' : 'Опубликовать баннер (ЖМИ!)'}
        </button>
      </form>
    </div>
  );
};