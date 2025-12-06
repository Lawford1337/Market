import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { logoutUser } from '@/actions/auth';
import Link from 'next/link';
import { DeleteProductBtn } from '@/components/ui/DeleteProductBtn';
import { confirmOrderReceived } from '@/actions/seller';
import { simulateDelivery } from '@/actions/order';
import { deleteBanner } from '@/actions/banner'; 
import { CreateBannerForm } from '@/components/partner/CreateBannerForm'; 
import styles from './profile.module.css';
import { Edit } from 'lucide-react';

interface Props {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function ProfilePage({ searchParams }: Props) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  if (!token) redirect('/login');

  let payload;
  try {
    payload = verify(token.value, process.env.JWT_SECRET || 'secret') as { id: number };
  } catch (e) {
    redirect('/login');
  }

  // 1. Достаем юзера + Покупки + Товары
  const user = await db.user.findUnique({
    where: { id: payload.id },
    include: {
      orders: {
        orderBy: { createdAt: 'desc' },
        include: { items: { include: { product: true } } }
      }
    }
  });

  if (!user) redirect('/login');

  const isSeller = user.role === 'seller';
  const isPartner = user.role === 'partner'; // <--- Вернули проверку роли

  // --- ЛОГИКА ПРОДАВЦА ---
  let products: any[] = [];
  let totalPages = 0;
  let currentPage = 1;
  let sales: any[] = [];
  
  if (isSeller) {
    // Продажи
    sales = await db.orderItem.findMany({
      where: { product: { sellerId: user.id } },
      orderBy: { id: 'desc' },
      take: 5,
      include: {
        product: true,
        order: { include: { buyer: true } }
      }
    });

    // Товары (Пагинация)
    const PAGE_SIZE = 5;
    const params = await searchParams;
    currentPage = Number(params.page) || 1;
    const skip = (currentPage - 1) * PAGE_SIZE;
    
    products = await db.product.findMany({
      where: { sellerId: user.id },
      take: PAGE_SIZE,
      skip: skip,
      orderBy: { id: 'desc' },
    });

    const totalProducts = await db.product.count({ where: { sellerId: user.id } });
    totalPages = Math.ceil(totalProducts / PAGE_SIZE);
  }

  // --- ЛОГИКА ПАРТНЕРА --- 
  const myBanners = isPartner ? await db.banner.findMany({ where: { userId: user.id } }) : [];

  return (
    <div className={styles.container}>
      {/* --- ШАПКА --- */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Привет, {user.username}! 👋</h1>
          <p style={{ color: '#888' }}>{user.email}</p>
          {user.city && <p style={{ color: '#cb11ab', fontSize: 14 }}>📍 г. {user.city}</p>}
        </div>
        <form action={logoutUser}>
          <button className={styles.logoutButton}>Выйти</button>
        </form>
      </div>

      {/* --- СТАТИСТИКА --- */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Ваш баланс</div>
          <div className={`${styles.statValue} ${styles.highlight}`}>{user.balance} ₽</div>
          {/* Форма пополнения */}
          <form action={async (fd) => {
            'use server';
            await db.user.update({ where: { id: user.id }, data: { balance: { increment: Number(fd.get('amount')) } } });
            redirect('/profile');
          }} style={{ marginTop: 10, display: 'flex', gap: 5 }}>
            <input name="amount" type="number" placeholder="Пополнить" style={{width: 80, padding: 5, border: '1px solid #ddd', borderRadius: 4}} required />
            <button type="submit" style={{background: '#333', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer'}}>+</button>
          </form>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Статус</div>
          <div className={styles.statValue}>
            {isSeller ? 'Продавец 💼' : (isPartner ? 'Партнер 🤝' : 'Покупатель 🛒')}
          </div>
        </div>
        {(isSeller || isPartner) && (
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Бонусы</div>
            <div className={styles.statValue} style={{ color: '#28a745' }}>{user.bonuses} Б</div>
          </div>
        )}
      </div>

      {/* === БЛОК ПАРТНЕР=== */}
      {isPartner && (
        <div style={{ marginBottom: 60, borderTop: '2px solid #eee', paddingTop: 40 }}>
          <h2 style={{ fontSize: '28px', marginBottom: '20px', color: '#cb11ab' }}>🤝 Кабинет Партнера</h2>
          
          <CreateBannerForm />

          <h3 style={{ marginTop: 20 }}>Мои активные баннеры</h3>
          {myBanners.length === 0 ? <p style={{color:'#888'}}>Баннеров нет</p> : (
            <div style={{ display: 'flex', gap: 15, flexWrap: 'wrap', marginTop: 15 }}>
              {myBanners.map(b => (
                <div key={b.id} style={{ position: 'relative', border: '1px solid #eee' }}>
                  <img src={b.imageUrl} style={{ width: 150, height: 250, objectFit: 'cover' }} />
                      <form 
                        action={async () => {
                          'use server';
                          await deleteBanner(b.id);
                        }} 
                        style={{ position: 'absolute', top: 5, right: 5 }}>
                        <button style={{ background: 'red', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '50%', width: 24, height: 24 }}>×</button>
                      </form>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* === БЛОК ПРОДАВЦА === */}
      {isSeller && (
        <div style={{ marginBottom: 60, borderTop: '2px solid #eee', paddingTop: 40 }}>
          <h2 style={{ fontSize: '28px', marginBottom: '20px', color: '#cb11ab' }}>💼 Панель Продавца</h2>

          <h3 className={styles.sectionTitle}>💰 Входящие заказы (Последние 5)</h3>
          {sales.length === 0 ? (
            <div className={styles.emptyState}>Пока продаж нет.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 15, marginBottom: 40 }}>
              {sales.map((sale) => (
                <div key={sale.id} style={{ border: '1px solid #cb11ab', padding: 20, borderRadius: 12, background: '#fffcfc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <strong>Продажа #{sale.id}</strong>
                    <span style={{ color: sale.order.status === 'received' ? 'green' : 'orange' }}>
                      {sale.order.status === 'received' ? 'Получен' : 'В пути'}
                    </span>
                  </div>
                  <div>
                    {sale.product.title} — <strong>{sale.price * sale.quantity} ₽</strong>
                    <br />
                    <span style={{ fontSize: 12, color: '#888' }}>Покупатель: {sale.order.buyer.email}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 30 }}>
            <h3 className={styles.sectionTitle} style={{ margin: 0 }}>📦 Мои товары</h3>
            <Link href="/profile/create" className={styles.createButton}>+ Добавить товар</Link>
          </div>

          <div style={{ marginTop: 20 }}>
            {products.length === 0 ? (
              <div className={styles.emptyState}>Товаров нет.</div>
            ) : (
              <>
                <ul style={{ border: '1px solid #eee', borderRadius: 12, overflow: 'hidden' }}>
                  {products.map(p => (
                    <li key={p.id} style={{ padding: 15, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
                      <span>{p.title} — <b>{p.price} ₽</b> ({p.quantity} шт.)</span>
                      <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
                        <Link href={`/profile/edit/${p.id}`} style={{ color: '#cb11ab' }}><Edit size={20} /></Link>
                        <DeleteProductBtn id={p.id} />
                      </div>
                    </li>
                  ))}
                </ul>
                
                {/* Пагинация */}
                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 20, alignItems: 'center' }}>
                    {currentPage > 1 ? <Link href={`/profile?page=${currentPage - 1}`} className={styles.button} style={{ width: 'auto', background: '#333', padding: '5px 15px', fontSize: 14 }}>← Назад</Link> : null}
                    <span style={{ fontSize: 14 }}>Страница {currentPage} из {totalPages}</span>
                    {currentPage < totalPages ? <Link href={`/profile?page=${currentPage + 1}`} className={styles.button} style={{ width: 'auto', background: '#333', padding: '5px 15px', fontSize: 14 }}>Вперед →</Link> : null}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* === МОИ ПОКУПКИ === */}
      <div style={{ borderTop: '2px solid #eee', paddingTop: 40 }}>
        <h2 style={{ fontSize: '28px', marginBottom: '20px', color: '#333' }}>🛒 Мои Покупки</h2>
        {user.orders.length === 0 ? (
          <div className={styles.emptyState}>Вы еще ничего не заказывали. <Link href="/" style={{ color: '#cb11ab' }}>В каталог</Link></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {user.orders.map((order) => (
              <div key={order.id} style={{ border: '1px solid #eee', padding: 20, borderRadius: 12, background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15, borderBottom: '1px solid #f0f0f0', paddingBottom: 10 }}>
                  <div>
                    <strong>Заказ #{order.id}</strong>
                    <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{new Date(order.createdAt).toLocaleDateString()}{order.pickupLocation && ` • ПВЗ: ${order.pickupLocation}`}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', padding: '5px 10px', borderRadius: 5, background: order.status === 'received' ? '#e6fffa' : '#fff5eb', color: order.status === 'received' ? 'green' : 'orange' }}>
                      {order.status === 'received' && 'Получен ✅'}
                      {order.status === 'delivering' && 'В пути 🚚'}
                      {order.status === 'ready' && 'В ПВЗ 📦'}
                    </span>
                    <span style={{ fontWeight: 'bold', fontSize: 18 }}>{order.total} ₽</span>
                  </div>
                </div>
                {/* Список товаров */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {order.items.map((item) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {item.product ? (
                          <>
                            {item.product.images[0] && <img src={item.product.images[0]} style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover' }} />}
                            <span>{item.product.title}</span>
                          </>
                        ) : <span style={{ color: 'red' }}>Товар удален</span>}
                      </div>
                      <div style={{ color: '#666' }}>{item.quantity} шт. x {item.price} ₽</div>
                    </div>
                  ))}
                </div>
                {/* Кнопки */}
                <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  {order.status === 'delivering' && (
                    <form action={async () => { 'use server'; await simulateDelivery(order.id); }}>
                      <button style={{ fontSize: 13, padding: '10px 20px', background: '#333', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>🚀 Симулировать доставку</button>
                    </form>
                  )}
                  {order.status === 'ready' && (
                    <form action={async () => { 'use server'; await confirmOrderReceived(order.id); }}>
                      <button style={{ fontSize: 13, padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Я забрал заказ</button>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!isSeller && !isPartner && (
        <div style={{ marginTop: 60, textAlign: 'center', borderTop: '1px solid #eee', paddingTop: 20 }}>
          <Link href="/become-seller" style={{ color: '#cb11ab', fontWeight: 'bold' }}>💼 Хотите продавать свои товары?</Link>
        </div>
      )}
    </div>
  );
}