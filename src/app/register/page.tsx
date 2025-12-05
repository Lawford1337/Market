import Link from 'next/link';
import { registerUser } from '@/actions/auth';
import styles from './register.module.css';

export default function RegisterPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Регистрация</h1>
      
      {/* action={registerUser} - это Server Actions. 
          Форма сама отправит данные на сервер в  функцию */}
      <form action={registerUser} className={styles.form}>
        <input 
          name="username" 
          type="text" 
          placeholder="Ваше имя" 
          className={styles.input} 
          required 
        />
        <input 
          name="email" 
          type="email" 
          placeholder="Email" 
          className={styles.input} 
          required 
        />
        <input 
          name="password" 
          type="password" 
          placeholder="Пароль" 
          className={styles.input} 
          required 
        />
        
        <button type="submit" className={styles.button}>
          Создать аккаунт
        </button>
      </form>

      <Link href="/login" className={styles.link}>
        Уже есть аккаунт? Войти
      </Link>
    </div>
  );
}