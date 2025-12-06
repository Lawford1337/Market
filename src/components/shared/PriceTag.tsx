'use client';

import { useRegionStore } from '@/store/region';
import { useEffect, useState } from 'react';

interface Props {
  price: number; // Цена всегда приходит в рублях (из базы)
  className?: string;
}

export const PriceTag = ({ price, className }: Props) => {
  // Используем хак с mounted, чтобы избежать ошибки гидратации (когда сервер рисует рубли, а клиент резко меняет на доллары)
  const [mounted, setMounted] = useState(false);
  const { currentRegion } = useRegionStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span className={className}>{price} ₽</span>; // На сервере всегда рубли
  }

  // Конвертация
  const convertedPrice = Math.round(price * currentRegion.rate);

  return (
    <span className={className}>
      {/* Для долларов значок обычно ставят в начале ($100), для остальных - в конце (100 ₽) */}
      {currentRegion.id === 'us' 
        ? `${currentRegion.symbol}${convertedPrice}` 
        : `${convertedPrice} ${currentRegion.symbol}`}
    </span>
  );
};