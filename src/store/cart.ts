import { create } from 'zustand';

// 1. Описываем, как выглядит один товар в корзине
interface CartItem {
  id: number;
  title: string;
  price: number;
  imageUrl?: string;
  quantity: number; 
}

// 2. какие функции  у корзины
interface CartState {
  items: CartItem[];
  
  // Функция добавления товара
  addItem: (item: CartItem) => void;
  
  // Функция удаления товара
  removeItem: (id: number) => void;
  
  // Очистка корзины (после покупки)
  clearCart: () => void;
}

// 3. Создаем само хранилище
export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (product) => {
    const { items } = get();
    const existingItem = items.find((i) => i.id === product.id);

    if (existingItem) {
      set({
        items: items.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      });
    } else {
      set({ items: [...items, { ...product, quantity: 1 }] });
    }
  },

  removeItem: (id) => {
    set({ items: get().items.filter((i) => i.id !== id) });
  },

  clearCart: () => set({ items: [] }),
}));