'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BecomeSellerSchema } from '@/lib/schemas';
import { becomeSeller } from '@/actions/seller';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export const BecomeSellerForm = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof BecomeSellerSchema>>({
    resolver: zodResolver(BecomeSellerSchema),
    defaultValues: {
      city: "",
    },
  });

  const onSubmit = (values: z.infer<typeof BecomeSellerSchema>) => {
    startTransition(async () => {
      const data = await becomeSeller(values);

      if (data?.error) {
        toast.error(data.error);
      }

      if (data?.success) {
        toast.success('Поздравляем! Вы стали продавцом 🎉');
        router.push('/profile');
        router.refresh(); // Обновляем данные профиля
      }
    });
  };

  return (
    <div style={{ maxWidth: 400, margin: '50px auto', padding: 30, border: '1px solid #ddd', borderRadius: 12, background: 'white' }}>
      <h2 style={{ marginBottom: 10, textAlign: 'center' }}>Стать продавцом 💼</h2>
      <p style={{ textAlign: 'center', marginBottom: 20, color: '#666', fontSize: 14 }}>
        Заполните данные, чтобы начать продавать товары на нашей платформе.
      </p>

      <form onSubmit={form.handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
        
        <div>
          <label style={{ display: 'block', marginBottom: 5, fontSize: 14 }}>Ваш Город</label>
          <input 
            {...form.register("city")}
            disabled={isPending}
            placeholder="Москва"
            style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
          />
          {form.formState.errors.city && (
            <p style={{ color: 'red', fontSize: 12, marginTop: 5 }}>{form.formState.errors.city.message}</p>
          )}
        </div>

        <button 
          type="submit" 
          disabled={isPending}
          style={{ padding: 15, background: '#cb11ab', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold', marginTop: 10 }}
        >
          {isPending ? 'Обработка...' : 'Подтвердить'}
        </button>

      </form>
    </div>
  );
};