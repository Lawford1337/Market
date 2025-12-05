'use client';

import Link from 'next/link';
import { ShoppingCart, User, MessageCircle } from 'lucide-react';
import styles from './Header.module.css';
import { useCartStore } from '@/store/cart';
import { useRouter, useSearchParams } from 'next/navigation'; 
import { useState } from 'react';
import { UnreadWatcher } from './UnreadWatcher';

export const Header = () => {
  const items = useCartStore((state) => state.items);
  
  // Логика поиска
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Если нажали Enter - меняем URL
      if (query.trim()) {
        router.push(`/?q=${query}`);
      } else {
        router.push('/'); // Если пусто - сбрасываем поиск
      }
    }
  };

  return (
    <header className={styles.header}>
      <UnreadWatcher />
      {/* Логотип сбрасывает поиск */}
      <Link href="/" className={styles.logo}>
        Marketplace
      </Link>

      <div className={styles.searchContainer}>
        <input 
          type="text" 
          placeholder="Найти на маркетплейсе..." 
          className={styles.searchInput}
          
          // Привязываем стейт
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleSearch}
        />
      </div>

      <nav className={styles.nav}>
        <Link href="/chat" className={styles.navLink}>
          <MessageCircle size={24} />
          <span>Чаты</span>
        </Link>
        <Link href="/cart" className={styles.navLink} style={{ position: 'relative' }}>
          <ShoppingCart size={24} />
          <span>Корзина</span>
          {items.length > 0 && (
            <span style={{
              position: 'absolute', top: -5, right: 5, background: 'red', color: 'white',
              borderRadius: '50%', width: '18px', height: '18px', fontSize: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
            }}>
              {items.length}
            </span>
          )}
        </Link>

        <Link href="/profile" className={styles.navLink}>
          <User size={24} />
          <span>Профиль</span>
        </Link>
      </nav>
    </header>
  );
};