'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce'; 

export const AdminSearch = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Хук делает так, что функция сработает только через 300мс после того, как ты ПЕРЕСТАЛ печатать
  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);

    if (term) {
      params.set('q', term);
    } else {
      params.delete('q');
    }

    router.replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div style={{ position: 'relative', marginBottom: 30, maxWidth: 400 }}>
      <Search 
        size={18} 
        style={{ position: 'absolute', left: 12, top: 12, color: '#999' }} 
      />
      <input
        type="text"
        placeholder="Поиск по юзерам, почте или ID..."
        onChange={(e) => handleSearch(e.target.value)} 
        defaultValue={searchParams.get('q')?.toString()}
        style={{
          width: '100%',
          padding: '12px 12px 12px 40px',
          borderRadius: 8,
          border: '1px solid #ddd',
          fontSize: 16,
          outline: 'none'
        }}
      />
    </div>
  );
};