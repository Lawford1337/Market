import { db } from "@/lib/db";
import styles from "./page.module.css";
import Link from "next/link";
import { PriceTag } from "@/components/shared/PriceTag";

interface Props {
  searchParams: Promise<{
    q?: string;
    category?: string;
    page?: string;
  }>;
}

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  
  // --- 1. ЛОГИКА КАТАЛОГА ---
  const PAGE_SIZE = 20;
  const currentPage = Number(params.page) || 1;
  const skip = (currentPage - 1) * PAGE_SIZE;

  const whereCondition: any = {};
  
  if (params.q) {
    whereCondition.title = { 
      contains: params.q, 
      mode: 'insensitive' 
    };
  }
  
  if (params.category) {
    whereCondition.category = params.category;
  }

  const products = await db.product.findMany({
    where: whereCondition,
    take: PAGE_SIZE,
    skip: skip,
    orderBy: { id: 'desc' },
  });

  const totalProducts = await db.product.count({ where: whereCondition });
  const totalPages = Math.ceil(totalProducts / PAGE_SIZE);

  // --- 2. ЛОГИКА БАННЕРОВ (ВЕРНУЛИ ЕЁ!) ---
  const banners = await db.banner.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div style={{ display: 'flex', maxWidth: 1600, margin: '0 auto', gap: 20, padding: 20 }}>
      
      {/* 👈 ЛЕВАЯ КОЛОНКА С РЕКЛАМОЙ (Показываем четные: 0, 2, 4...) */}
      <aside style={{ width: 250, display: 'flex', flexDirection: 'column', gap: 20, flexShrink: 0 }}>
        {banners.length > 0 && banners.filter((_, i) => i % 2 === 0).map(b => (
          <a key={b.id} href={b.link || '#'} target="_blank" style={{ display: 'block', transition: 'transform 0.2s' }}>
            <img 
              src={b.imageUrl} 
              style={{ width: '100%', borderRadius: 12, border: '1px solid #eee', objectFit: 'cover', minHeight: 150 }} 
              alt="Реклама"
            />
          </a>
        ))}
        {/* Заглушка, если баннеров нет (чтобы было видно место) */}
        {banners.length === 0 && (
          <div style={{ padding: 20, background: '#f9f9f9', borderRadius: 12, color: '#ccc', textAlign: 'center', fontSize: 12 }}>
            Место для рекламы
          </div>
        )}
      </aside>

      {/* 👇 ЦЕНТРАЛЬНАЯ КОЛОНКА (КАТАЛОГ) 👇 */}
      <main className={styles.main} style={{ flex: 1, maxWidth: '100%' }}>
        <h1 className={styles.title}>
          {params.category 
            ? `Категория: ${params.category}` 
            : params.q 
              ? `Поиск: "${params.q}"` 
              : 'Горячие новинки'}
        </h1>

        {/* Категории */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 30, flexWrap: 'wrap' }}>
          <Link href="/" className={styles.categoryChip} style={{ fontWeight: !params.category ? 'bold' : 'normal' }}>Все</Link>
          <Link href="/?category=electronics" className={styles.categoryChip} style={{ fontWeight: params.category === 'electronics' ? 'bold' : 'normal' }}>Электроника</Link>
          <Link href="/?category=clothes" className={styles.categoryChip} style={{ fontWeight: params.category === 'clothes' ? 'bold' : 'normal' }}>Одежда</Link>
          <Link href="/?category=home" className={styles.categoryChip} style={{ fontWeight: params.category === 'home' ? 'bold' : 'normal' }}>Дом</Link>
          <Link href="/?category=auto" className={styles.categoryChip} style={{ fontWeight: params.category === 'auto' ? 'bold' : 'normal' }}>Авто</Link>
        </div>

        {products.length === 0 && (
          <div className={styles.empty}>
            <p>В этой категории пока пусто 😔</p>
            <Link href="/" style={{ color: '#cb11ab', marginTop: 10, display: 'block' }}>Вернуться ко всем товарам</Link>
          </div>
        )}

        {/* Сетка товаров */}
        <div className={styles.grid}>
          {products.map((product) => {
            const isOutOfStock = product.quantity === 0;
            return (
              <Link 
                key={product.id} 
                href={`/product/${product.id}`} 
                className={`${styles.card} ${isOutOfStock ? styles.outOfStockCard : ''}`}
                style={{ display: 'block', textDecoration: 'none', color: 'inherit', position: 'relative' }}
              >
                <div className={styles.imagePlaceholder} style={{ position: 'relative' }}>
                  {product.images[0] ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.title} 
                      style={{ 
                        width: '100%', height: '100%', objectFit: 'cover',
                        filter: isOutOfStock ? 'grayscale(100%)' : 'none' 
                      }} 
                    />
                  ) : '📦'}
                  
                  {/* Штамп РАСКУПЛЕНО */}
                  {isOutOfStock && (
                    <div className={styles.overlay}><span className={styles.soldOutBadge}>Раскуплено</span></div>
                  )}
                </div>
                
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{product.title}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    {!isOutOfStock ? (
                      <>
                        <PriceTag price={product.price} className={styles.price} />
                        <span className={styles.stockCount}>{product.quantity} шт.</span>
                      </>
                    ) : (
                      <span className={styles.noStockText}>Нет в наличии</span>
                    )}
                  </div>
                  <button className={`${styles.button} ${isOutOfStock ? styles.disabledButton : ''}`} disabled={isOutOfStock}>
                    {isOutOfStock ? 'Недоступно' : 'Подробнее'}
                  </button>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Пагинация */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 50, alignItems: 'center' }}>
            {currentPage > 1 ? (
              <Link href={`/?page=${currentPage - 1}${params.q ? `&q=${params.q}` : ''}`} className={styles.button} style={{ width: 'auto', background: '#333' }}>← Назад</Link>
            ) : <button disabled style={{ padding: '10px 20px', background: '#eee', color: '#aaa', border: 'none', borderRadius: 8 }}>← Назад</button>}
            
            <span style={{ fontWeight: 'bold' }}>Страница {currentPage} из {totalPages}</span>
            
            {currentPage < totalPages ? (
              <Link href={`/?page=${currentPage + 1}${params.q ? `&q=${params.q}` : ''}`} className={styles.button} style={{ width: 'auto', background: '#333' }}>Вперед →</Link>
            ) : <button disabled style={{ padding: '10px 20px', background: '#eee', color: '#aaa', border: 'none', borderRadius: 8 }}>Вперед →</button>}
          </div>
        )}
      </main>

      {/* 👉 ПРАВАЯ КОЛОНКА С РЕКЛАМОЙ (Показываем нечетные: 1, 3, 5...) */}
      <aside style={{ width: 250, display: 'flex', flexDirection: 'column', gap: 20, flexShrink: 0 }}>
        {banners.length > 0 && banners.filter((_, i) => i % 2 !== 0).map(b => (
          <a key={b.id} href={b.link || '#'} target="_blank" style={{ display: 'block', transition: 'transform 0.2s' }}>
            <img 
              src={b.imageUrl} 
              style={{ width: '100%', borderRadius: 12, border: '1px solid #eee', objectFit: 'cover', minHeight: 150 }} 
              alt="Реклама"
            />
          </a>
        ))}
      </aside>

    </div>
  );
}