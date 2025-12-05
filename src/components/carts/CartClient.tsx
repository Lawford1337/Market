'use client';

import { useState, useTransition } from 'react';
import { useCartStore } from '@/store/cart';
import { placeOrder } from '@/actions/order';
import { Trash2, MapPin, Sparkles } from 'lucide-react';
import styles from '@/app/cart/cart.module.css'; 
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { PICKUP_POINTS } from '@/lib/constants';
import dynamic from 'next/dynamic';

const PickupMap = dynamic(() => import('@/components/ui/PickupMap'), { 
  ssr: false,
  loading: () => <div style={{height: 350, background: '#f0f0f0', borderRadius: 12}}>Загрузка...</div>
});

//  Принимаем бонусы как проп
export default function CartClient({ userBonuses = 0 }: { userBonuses?: number }) {
  const { items, removeItem, clearCart } = useCartStore(); 
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [selectedPointId, setSelectedPointId] = useState(PICKUP_POINTS[0].id);
  const [useBonuses, setUseBonuses] = useState(false);

  const selectedPointData = PICKUP_POINTS.find(p => p.id === selectedPointId) || PICKUP_POINTS[0];
  const addressString = `${selectedPointData.city}, ${selectedPointData.address}`;

  const itemsPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const shippingCost = itemsPrice >= 5000 ? 0 : 300;

  let discount = 0;
  if (useBonuses && userBonuses > 0) {
    if (userBonuses >= itemsPrice) {
      discount = itemsPrice;
    } else {
      discount = userBonuses;
    }
  }

  const finalPrice = (itemsPrice - discount) + shippingCost;

  const handleCheckout = async () => {
    startTransition(async () => {
      const result = await placeOrder(items, addressString, useBonuses);

      if (result?.error === 'unauthorized') {
        router.push('/login');
        return;
      }
      if (result?.error) {
        toast.error(result.error);
        return;
      }

      if (result?.success) {
        clearCart(); 
        toast.success('Заказ оформлен! 🎉');
        router.push('/profile');
      }
    });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Корзина</h1>

      {items.length === 0 ? (
        <div className={styles.empty}><h2>Ваша корзина пуста 😔</h2></div>
      ) : (
        <div className={styles.content}>
          {/* Список товаров */}
          <div className={styles.cartList}>
            {items.map((item) => (
              <div key={item.id} className={styles.item}>
                <div className={styles.image}>📦</div>
                <div className={styles.info}>
                  <h3 className={styles.itemTitle}>{item.title}</h3>
                  <p className={styles.itemPrice}>{item.price} ₽ x {item.quantity}</p>
                </div>
                <button onClick={() => removeItem(item.id)} className={styles.removeBtn}>
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>

        <div className={styles.summary}>
            {/* Строки чека */}
            <div style={{ marginBottom: 15 }}>
              <div className={styles.summaryRow}>
                <span>Товары:</span>
                <span>{itemsPrice} ₽</span>
              </div>
              
              <div className={styles.summaryRow} style={{ color: shippingCost === 0 ? '#28a745' : '#666' }}>
                <span>Доставка:</span>
                <span>{shippingCost === 0 ? 'Бесплатно' : `${shippingCost} ₽`}</span>
              </div>

              {discount > 0 && (
                <div className={styles.summaryRow} style={{ color: '#28a745' }}>
                  <span>Бонусы:</span>
                  <span>- {discount} ₽</span>
                </div>
              )}
            </div>

            <div className={`${styles.summaryRow} ${styles.total}`} style={{ borderTop: '1px solid #eee', paddingTop: 10 }}>
              <span>Итого:</span>
              <span>{finalPrice} ₽</span>
            </div>

            <hr style={{ margin: '15px 0', border: 'none', borderTop: '1px solid #eee' }} />

            {/* Блок Бонусов */}
            <div style={{ marginTop: 15, padding: 15, background: '#e6fffa', borderRadius: 8, border: '1px solid #b2f5ea' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 10, fontSize: 14, fontWeight: 'bold' }}>
                <input 
                  type="checkbox" 
                  checked={useBonuses} 
                  onChange={(e) => setUseBonuses(e.target.checked)}
                  disabled={userBonuses === 0} // Блокируем, если бонусов нет
                  style={{ width: 18, height: 18, accentColor: '#28a745' }}
                />
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Sparkles size={16} color="#28a745" />
                  Списать бонусы
                </span>
              </label>
              <div style={{ fontSize: 12, color: '#28a745', marginTop: 5, marginLeft: 28 }}>
                Доступно: <strong>{userBonuses} Б</strong>
              </div>
            </div>

            {/* Карта и Кнопка (без изменений) */}
            <div style={{ marginTop: 20, marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 10, fontSize: 14, fontWeight: 'bold' }}>
                <MapPin size={16} style={{ display: 'inline', marginRight: 5 }} />
                Пункт выдачи:
              </label>
              <select 
                value={selectedPointId}
                onChange={(e) => setSelectedPointId(e.target.value)}
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc', marginBottom: 10 }}
              >
                {PICKUP_POINTS.map((p) => (
                  <option key={p.id} value={p.id}>{p.city} — {p.address}</option>
                ))}
              </select>
              <PickupMap selectedId={selectedPointId} onSelect={setSelectedPointId} />
              <div style={{ fontSize: 12, color: '#666', marginTop: 10, background: '#f9f9f9', padding: 8, borderRadius: 6 }}>
                Доставка в: <b>{addressString}</b>
              </div>
            </div>

            <button 
              onClick={handleCheckout} 
              disabled={isPending}
              className={styles.checkoutBtn}
              style={{ opacity: isPending ? 0.5 : 1 }}
            >
              {isPending ? 'Оформляем...' : 'Оформить заказ'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}