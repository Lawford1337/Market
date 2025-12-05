'use client';

import { useState } from 'react';
import { createBanner } from '@/actions/banner';
import toast from 'react-hot-toast';

export const CreateBannerForm = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    
    const UPLOAD_PRESET = 'marketplace'; 
    const CLOUD_NAME = 'dhdv3cvhz'; 

    formData.append('upload_preset', UPLOAD_PRESET);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setImageUrl(data.secure_url);
      toast.success('Баннер загружен!');
    } catch {
      toast.error('Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, border: '1px solid #cb11ab', borderRadius: 12, background: '#fdfdfd', marginBottom: 30 }}>
      <h3>📢 Создать рекламу</h3>
      <form action={createBanner} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 15 }}>
        
        {/* Загрузка фото */}
        <input type="file" onChange={handleFileChange} accept="image/*" />
        {imageUrl && <img src={imageUrl} style={{ height: 100, objectFit: 'contain' }} />}
        <input type="hidden" name="imageUrl" value={imageUrl} />

        {/* Ссылка */}
        <input name="link" placeholder="Ссылка (https://t.me/...)" style={{ padding: 10, borderRadius: 5, border: '1px solid #ccc' }} />

        <button type="submit" disabled={!imageUrl || loading} style={{ padding: 10, background: '#cb11ab', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer' }}>
          Опубликовать баннер
        </button>
      </form>
    </div>
  );
};