import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import styles from "./product.module.css";
import { AddToCartButton } from "@/components/ui/AddToCartButton";
import Link from 'next/link';
import { ProductQR } from '@/components/ui/ProductQR';
import { ReviewForm } from '@/components/reviews/ReviewForm'; 
import { Star } from 'lucide-react'

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductPage({ params }: Props) {
  // 1. Ждем получения ID из URL
  const { id } = await params;

  // 2. Ищем товар в базе данных по ID
const product = await db.product.findUnique({
    where: { id: Number(id) },
    include: {
      seller: true,
      reviews: { //  Достаем отзывы
        orderBy: { createdAt: 'desc' },
        include: { user: true } // И авторов
      }
    }
  });

  // 3. Если товара нет (например, ввели id 999999) - показываем 404
  if (!product) {
    return notFound();
  }

  // 4. Если нашли - рисуем страницу
  return (
    <div className={styles.container}>
      {/* Левая колонка: Фото */}
      <div className={styles.imagePlaceholder}>
        {product.images[0] ? (
          <img 
            src={product.images[0]} 
            alt={product.title} 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'contain', 
              borderRadius: '12px' 
            }} 
          />
        ) : (
          <span style={{fontSize: 100}}>📦</span>
        )}
      </div>

      {/* Правая колонка: Инфо */}
      <div className={styles.info}>
        <span className={styles.category}>{product.category}</span>
        <h1 className={styles.title}>{product.title}</h1>
        <p className={styles.description}>{product.description}</p>
        
        <div className={styles.priceBlock}>
          <span className={styles.price}>{product.price} ₽</span>
          
          {/* Блок с кнопками (Flex, чтобы стояли рядом) */}
          <div style={{ display: 'flex', gap: '10px' }}>
            
            {/* 1. Кнопка "В корзину" */}
            <AddToCartButton product={product} />

            {/* 2. Кнопка Чата (Вставили сюда) */}
            <Link 
              href={`/chat/${product.seller.id}`}
              style={{
                padding: '15px',
                border: '2px solid #cb11ab',
                borderRadius: 10,
                color: '#cb11ab',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                minWidth: '60px', // Чтобы кнопка не сплющилась
                fontSize: '24px'
              }}
              title="Написать продавцу"
            >
              💬
            </Link>

          </div>
        </div>
          <ProductQR productId={product.id} />
        <p style={{marginTop: 20, color: '#999', fontSize: 14}}>
          Продавец: {product.seller.username || "Аноним"}
        </p>
      </div>
      {/* Секция ОТЗЫВОВ */}
      <div style={{ marginTop: 60, borderTop: '1px solid #eee', paddingTop: 40 }}>
        <h2 style={{ fontSize: 24, marginBottom: 20 }}>Отзывы ({product.reviews.length})</h2>
        
        {/* Форма */}
        <ReviewForm productId={product.id} />

        {/* Список */}
        <div style={{ marginTop: 30, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {product.reviews.map((review) => (
            <div key={review.id} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <strong>{review.user.username}</strong>
                <div style={{ display: 'flex' }}>
                  {/* Рисуем звездочки рейтинга */}
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill={i < review.rating ? '#FFD700' : 'transparent'} color={i < review.rating ? '#FFD700' : '#ddd'} />
                  ))}
                </div>
              </div>
              <p style={{ color: '#444' }}>{review.text}</p>
              <span style={{ fontSize: 12, color: '#999' }}>
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}