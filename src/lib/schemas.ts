import * as z from 'zod';

export const LoginSchema = z.object({
  email: z.string().email({
    message: "Введите корректный Email",
  }),
  password: z.string().min(1, {
    message: "Пароль обязателен",
  }),
  code: z.optional(z.string()), // Код 2FA
});

export const RegisterSchema = z.object({
  email: z.string().email({
    message: "Введите корректный Email",
  }),
  password: z.string().min(6, {
    message: "Минимум 6 символов",
  }),
  username: z.string().min(2, {
    message: "Имя должно быть не короче 2 букв",
  }),
});


export const BecomeSellerSchema = z.object({
  city: z.string().min(2, {
    message: "Название города должно быть длиннее 2 букв",
  }),
});