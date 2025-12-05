import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { redirect } from 'next/navigation';
import { createTicket } from '@/actions/ticket';
import Link from 'next/link';

export default async function SupportPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  if (!token) redirect('/login');

  const payload = verify(token.value, process.env.JWT_SECRET || 'secret') as { id: number };

  // Достаем мои тикеты
  const myTickets = await db.ticket.findMany({
    where: { userId: payload.id },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: 20 }}>
      <h1 style={{ fontSize: 32, marginBottom: 10 }}>🆘 Техподдержка</h1>
      <p style={{ color: '#666', marginBottom: 30 }}>У вас проблема? Опишите её, и мы поможем.</p>

      {/* Форма создания */}
      <div style={{ background: '#f9f9f9', padding: 20, borderRadius: 12, border: '1px solid #eee' }}>
        <h3 style={{ marginBottom: 15 }}>Новое обращение</h3>
        <form action={createTicket} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          <input 
            name="subject" 
            placeholder="Тема (например: Проблема с оплатой)" 
            required
            style={{ padding: 10, borderRadius: 8, border: '1px solid #ddd' }}
          />
          <textarea 
            name="message" 
            placeholder="Подробное описание..." 
            required
            rows={4}
            style={{ padding: 10, borderRadius: 8, border: '1px solid #ddd' }}
          />
          <button type="submit" style={{ padding: 12, background: '#333', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', alignSelf: 'flex-start' }}>
            Отправить тикет
          </button>
        </form>
      </div>

      {/* Список моих тикетов */}
      <h3 style={{ marginTop: 40, marginBottom: 20 }}>Мои обращения ({myTickets.length})</h3>
      
      {myTickets.length === 0 ? (
        <p style={{ color: '#999' }}>Вы еще не обращались в поддержку.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          {myTickets.map((ticket) => (
            <div key={ticket.id} style={{ border: '1px solid #eee', padding: 15, borderRadius: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <strong>{ticket.subject}</strong>
                <span style={{ 
                  color: ticket.status === 'open' ? 'orange' : 'green', 
                  fontWeight: 'bold', 
                  background: ticket.status === 'open' ? '#fff7e6' : '#e6fffa',
                  padding: '2px 8px', borderRadius: 5, fontSize: 12
                }}>
                  {ticket.status === 'open' ? 'В работе ⏳' : 'Решено ✅'}
                </span>
              </div>
              <p style={{ fontSize: 14, color: '#555' }}>{ticket.message}</p>
              <div style={{ fontSize: 12, color: '#999', marginTop: 5 }}>
                {new Date(ticket.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div style={{ marginTop: 30 }}>
        <Link href="/profile" style={{ color: '#cb11ab' }}>← Назад в профиль</Link>
      </div>
    </div>
  );
}