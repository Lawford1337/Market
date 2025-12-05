'use client';

import { useState } from 'react';
import { sendMessage } from '@/actions/chat';
import { Image as ImageIcon, X, Send } from 'lucide-react'; 
import toast from 'react-hot-toast';

export const ChatInput = ({ receiverId }: { receiverId: number }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');

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
      
      console.log('Ответ от Cloudinary:', data); 

      if (data.error) {
        throw new Error(data.error.message);
      }

      // взять secure_url, если нет - берем url
      const link = data.secure_url || data.url;
      
      setImageUrl(link); 
      
      if (link) {
        toast.success('Фото готово к отправке!');
      } else {
        toast.error('Ссылка не пришла...');
      }

    } catch (err) {
      console.error(err);
      toast.error('Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    if (loading) return; // Не даем отправить, пока грузится фото
    
    await sendMessage(formData);
    
    // Очищаем форму после отправки
    setText('');
    setImageUrl('');
  };

  return (
    <div style={{ padding: 20, borderTop: '1px solid #eee' }}>
      
      {/* Предпросмотр фото перед отправкой */}
      {imageUrl && (
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 10 }}>
          <img src={imageUrl} style={{ height: 100, borderRadius: 8 }} />
          <button 
            onClick={() => setImageUrl('')}
            style={{ position: 'absolute', top: -5, right: -5, background: 'red', color: 'white', borderRadius: '50%', border: 'none', cursor: 'pointer', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={12} />
          </button>
        </div>
      )}

<form action={handleSubmit} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <input type="hidden" name="receiverId" value={receiverId} />
        
        <input type="hidden" name="imageUrl" value={imageUrl || ''} />

        <label style={{ cursor: 'pointer', color: '#cb11ab', display: 'flex', alignItems: 'center' }}>
          {loading ? '⏳' : <ImageIcon size={24} />}
          <input type="file" onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />
        </label>

        <input 
          name="text" 
          value={text || ''}
          onChange={(e) => setText(e.target.value)}
          placeholder="Напишите сообщение..." 
          style={{ flex: 1, padding: 12, border: '1px solid #ddd', borderRadius: 8, outline: 'none' }} 
          autoComplete="off"
        />
        
        <button 
          type="submit" 
          disabled={loading || (!text && !imageUrl)}
          style={{ padding: '10px 20px', background: '#cb11ab', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};