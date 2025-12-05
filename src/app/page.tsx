import { db } from "@/lib/db";
import styles from "./page.module.css";
import Link from "next/link";

interface Props {
  searchParams: Promise<{
    q?: string;
    category?: string;
    page?: string;
  }>;
}

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  
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

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>
        {params.category 
          ? `Категория: ${params.category}` 
          : params.q 
            ? `Поиск: "${params.q}"` 
            : 'Горячие новинки'}
      </h1>

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

      <div className={styles.grid}>
        {products.map((product) => {
          const isOutOfStock = product.quantity === 0;

          return (
            <Link 
              key={product.id} 
              href={`/product/${product.id}`} 
              className={styles.card}
              style={{ 
                display: 'block', 
                textDecoration: 'none', 
                color: 'inherit',
                opacity: isOutOfStock ? 0.6 : 1, // Делаем бледным если нет товара
                position: 'relative' // Для позиционирования плашки "Нет в наличии"
              }}
            >
              <div className={styles.imagePlaceholder} style={{ position: 'relative' }}>
                {product.images[0] ? (
                  <img 
                    src={product.images[0]} 
                    alt={product.title} 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      filter: isOutOfStock ? 'grayscale(100%)' : 'none' // Черно-белое фото если нет
                    }} 
                  />
                ) : '📦'}

                {isOutOfStock && (
                  <div style={{
                    position: 'absolute', inset: 0, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(255,255,255,0.6)', color: 'red', fontWeight: 'bold', fontSize: 18
                  }}>
                    Раскупили ❌
                  </div>
                )}
              </div>
              
              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{product.title}</h3>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <p className={styles.price} style={{ marginBottom: 0 }}>{product.price} ₽</p>
                  
                  {/* Вывод количества */}
                  <span style={{ fontSize: 12, color: isOutOfStock ? 'red' : 'green', fontWeight: 'bold' }}>
                    {isOutOfStock ? '0 шт.' : `${product.quantity} шт.`}
                  </span>
                </div>

                <button 
                  className={styles.button}
                  style={{ background: isOutOfStock ? '#ccc' : '#cb11ab' }}
                >
                  {isOutOfStock ? 'Посмотреть' : 'Подробнее'}
                </button>
              </div>
            </Link>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 50, alignItems: 'center' }}>
          {currentPage > 1 ? (
            <Link 
              href={`/?page=${currentPage - 1}${params.q ? `&q=${params.q}` : ''}${params.category ? `&category=${params.category}` : ''}`}
              className={styles.button}
              style={{ width: 'auto', background: '#333' }}
            >
              ← Назад
            </Link>
          ) : (
            <button disabled style={{ padding: '10px 20px', background: '#eee', color: '#aaa', border: 'none', borderRadius: 8 }}>← Назад</button>
          )}

          <span style={{ fontWeight: 'bold', color: '#333' }}>
            Страница {currentPage} из {totalPages}
          </span>

          {currentPage < totalPages ? (
            <Link 
              href={`/?page=${currentPage + 1}${params.q ? `&q=${params.q}` : ''}${params.category ? `&category=${params.category}` : ''}`}
              className={styles.button}
              style={{ width: 'auto', background: '#333' }}
            >
              Вперед →
            </Link>
          ) : (
            <button disabled style={{ padding: '10px 20px', background: '#eee', color: '#aaa', border: 'none', borderRadius: 8 }}>Вперед →</button>
          )}
        </div>
      )}
    </main>
  );
}