'use server';

import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { sendOrderEmail, sendSellerEmail, sendArrivalEmail } from '@/lib/mail';
import { revalidatePath } from 'next/cache';

type CartItem = {
  id: number;
  quantity: number;
};



// Вспомогательная функция расчета доставки (чтобы логика была в одном месте)
function calculateShipping(amount: number) {
  if (amount >= 5000) {
    return 0; 
  }
  return 300; 
}

export async function placeOrder(cartItems: CartItem[], location: string, useBonuses: boolean = false) {
  
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  if (!token) return { error: 'unauthorized' };
  const buyerPayload = verify(token.value, process.env.JWT_SECRET || 'secret') as { id: number; email: string };
  const buyer = await db.user.findUnique({ where: { id: buyerPayload.id } });
  if (!buyer) return { error: 'Покупатель не найден' };

  
  const productIds = cartItems.map((item) => item.id);
  const dbProducts = await db.product.findMany({
    where: { id: { in: productIds } },
    include: { seller: true }, 
  });

  let total = 0;
  const orderItemsData: any[] = [];

  for (const cartItem of cartItems) {
    const product = dbProducts.find((p) => p.id === cartItem.id);
    if (!product) throw new Error(`Товар ${cartItem.id} не найден`);
    if (product.quantity < cartItem.quantity) {
      return { error: `Товара "${product.title}" недостаточно` };
    }
    const itemTotal = product.price * cartItem.quantity;
    total += itemTotal;
    orderItemsData.push({
      productId: product.id,
      quantity: cartItem.quantity,
      price: product.price,
      productTitle: product.title,
      sellerEmail: product.seller.email,
      sellerId: product.sellerId
    });
  }


  const shippingCost = calculateShipping(total);

  let discount = 0;
  if (useBonuses && buyer.bonuses > 0) {
    if (buyer.bonuses >= total) {
      discount = total;
    } else {
      discount = buyer.bonuses;
    }
  }

  const finalPrice = (total - discount) + shippingCost;

  const cashback = Math.floor((total - discount) * 0.05); // Кэшбек только за товары
  const bonusChange = cashback - discount;

  // Проверка баланса
  if (buyer.balance < finalPrice) {
    return { error: `Недостаточно средств! К оплате: ${finalPrice} ₽ (вкл. доставку ${shippingCost} ₽)` };
  }

  // ТРАНЗАКЦИЯ
  const order = await db.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: buyer.id },
      data: { 
        balance: { decrement: finalPrice }, 
        bonuses: { increment: bonusChange } 
      }
    });

    const newOrder = await tx.order.create({
      data: {
        buyerId: buyer.id,
        total: total + shippingCost,
        status: 'delivering',
        pickupLocation: location,
        items: {
          create: orderItemsData.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });

    for (const item of orderItemsData) {
      await tx.product.update({
        where: { id: item.productId },
        data: { quantity: { decrement: item.quantity } }
      });

      await tx.user.update({
        where: { id: item.sellerId },
        data: { balance: { increment: item.price * item.quantity } }
      });
    }

    return newOrder;
  });

  console.log(`✅ Заказ ${order.id}. Доставка: ${shippingCost}`);
  
  await sendOrderEmail(buyerPayload.email, order.id, total + shippingCost);
  
  for (const item of orderItemsData) {
    if (item.sellerEmail) {
      await sendSellerEmail(item.sellerEmail, item.productTitle, item.price * item.quantity, buyerPayload.email);
    }
  }
  
  revalidatePath('/profile');
  return { success: true };
}

export async function simulateDelivery(orderId: number) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { buyer: true }
  });
  if (!order || order.status !== 'delivering') return;

  await db.order.update({
    where: { id: orderId },
    data: { status: 'ready' }
  });

  if (order.pickupLocation) {
    await sendArrivalEmail(order.buyer.email, order.id, order.pickupLocation);
  }
  revalidatePath('/profile');
}