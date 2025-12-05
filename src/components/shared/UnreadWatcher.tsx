'use client';

import useSWR from 'swr';
import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

// Функция-"fetcher" для SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const UnreadWatcher = () => {
  // Опрашиваем API каждые 5 секунд (refreshInterval: 5000)
  const { data } = useSWR('/api/messages/unread', fetcher, { 
    refreshInterval: 5000 
  });

  // Храним предыдущее количество сообщений
  const prevCountRef = useRef(0);

  useEffect(() => {
    if (data) {
      const currentCount = data.count;
      const prevCount = prevCountRef.current;

      // Если сообщений стало БОЛЬШЕ, чем было -> Показываем тост
      // (Проверка prevCount > 0 нужна, чтобы не спамить при первой загрузке сайта)
      if (prevCount > 0 && currentCount > prevCount) {
        toast('📩 Вам пришло новое сообщение!', {
          icon: '💬',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
          duration: 4000
        });
        
        // Можно проиграть звук (опционально)
        // const audio = new Audio('/notification.mp3');
        // audio.play();
      }

      // Обновляем "память"
      prevCountRef.current = currentCount;
    }
  }, [data]);

  return null; // Этот компонент ничего не рисует на экране
};