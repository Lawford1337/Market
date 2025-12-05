import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { redirect } from 'next/navigation';
import { closeTicket } from '@/actions/ticket';
import { makeUserPartner } from '@/actions/admin'; 
import Link from 'next/link';
import { MessageCircle, CheckCircle, Briefcase } from 'lucide-react';

export default async function AdminTicketsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  if (!token) redirect('/login');

  // Проверка прав
  try {
    const payload = verify(token.value, process.env.JWT_SECRET || 'secret') as { id: number };
    const user = await db.user.findUnique({ where: { id: payload.id } });
    if (user?.role !== 'admin') redirect('/');
  } catch {
    redirect('/');
  }

  // Загружаем ВСЕ тикеты + инфо о юзере
  const tickets = await db.ticket.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: true }
  });

  return (
    <div style={{ maxWidth: 1000, margin: '40px auto', padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <h1 style={{ fontSize: 28, fontWeight: 'bold' }}>📨 Тикеты поддержки</h1>
        <Link href="/admin" style={{ color: '#cb11ab' }}>← В Админку</Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
        {tickets.map((t) => (
          <div key={t.id} style={{ border: '1px solid #ddd', padding: 20, borderRadius: 10, background: t.status === 'open' ? 'white' : '#f9f9f9' }}>
            
            {/* Заголовок тикета */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h3 style={{ margin: 0 }}>#{t.id}: {t.subject}</h3>
                  <span style={{ 
                    fontSize: 12, fontWeight: 'bold', padding: '2px 8px', borderRadius: 4,
                    background: t.status === 'open' ? '#fff7e6' : '#e6fffa',
                    color: t.status === 'open' ? 'orange' : 'green' 
                  }}>
                    {t.status === 'open' ? 'ОТКРЫТ' : 'ЗАКРЫТ'}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: '#666', marginTop: 5 }}>
                  От: <b>{t.user.email}</b> ({t.user.username}) • {new Date(t.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
            
            {/* Текст проблемы */}
            <p style={{ margin: '15px 0', color: '#333', background: '#fcfcfc', padding: 10, borderRadius: 6, border: '1px solid #eee' }}>
              {t.message}
            </p>
            
            {/*  ПАНЕЛЬ ДЕЙСТВИЙ АДМИНА */}
            <div style={{ display: 'flex', gap: 10, marginTop: 15, flexWrap: 'wrap' }}>
              
              {/* 1. Кнопка ЧАТА (Ведет в личку с юзером) */}
              <Link 
                href={`/chat/${t.user.id}`} 
                style={{ 
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '8px 15px', background: '#cb11ab', color: 'white', 
                  borderRadius: 5, textDecoration: 'none', fontSize: 14, fontWeight: 'bold'
                }}
              >
                <MessageCircle size={16} />
                Ответить в чате
              </Link>

              {/* 2. Кнопка СДЕЛАТЬ ПАРТНЕРОМ (Если еще не партнер) */}
              {t.user.role !== 'partner' && t.user.role !== 'admin' && (
                <form action={async () => {
                  'use server';
                  await makeUserPartner(t.user.id);
                }}>
                  <button style={{ 
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '8px 15px', background: '#333', color: 'white', 
                    border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 14, fontWeight: 'bold'
                  }}>
                    <Briefcase size={16} />
                    Сделать партнером
                  </button>
                </form>
              )}

              {/* Индикатор "Уже партнер" */}
              {t.user.role === 'partner' && (
                <span style={{ 
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '8px 15px', background: '#f0f0f0', color: '#333', 
                  borderRadius: 5, fontSize: 14 
                }}>
                  <Briefcase size={16} />
                  Уже партнер
                </span>
              )}

              {/* 3. Кнопка ЗАКРЫТЬ ТИКЕТ (Только если открыт) */}
              {t.status === 'open' && (
                <form action={async () => {
                  'use server';
                  await closeTicket(t.id);
                }}>
                  <button style={{ 
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '8px 15px', background: 'transparent', color: 'green', 
                    border: '1px solid green', borderRadius: 5, cursor: 'pointer', fontSize: 14 
                  }}>
                    <CheckCircle size={16} />
                    Отметить как решенное
                  </button>
                </form>
              )}
            </div>

          </div>
        ))}
        
        {tickets.length === 0 && <p style={{textAlign: 'center', color: '#999'}}>Тикетов нет 🎉</p>}
      </div>
    </div>
  );
}