import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import styles from './chat.module.css';
import { redirect } from 'next/navigation';
import { ChatInput } from '../ChatInput';   
import { DeleteMsgBtn } from '@/components/chat/DeleteMsgBtn';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ChatPage({ params }: Props) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  if (!token) redirect('/login');

  const me = verify(token.value, process.env.JWT_SECRET || 'secret') as { id: number };
  const { id } = await params;
  const partnerId = Number(id);

  const partner = await db.user.findUnique({ where: { id: partnerId } });
  if (!partner) return <div>Пользователь не найден</div>;

  const messages = await db.message.findMany({
    where: {
      OR: [
        { senderId: me.id, receiverId: partnerId },
        { senderId: partnerId, receiverId: me.id },
      ],
    },
    orderBy: { createdAt: 'asc' },
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Чат с {partner.username}</h2>
        <span style={{ fontSize: 12, color: 'gray' }}>{partner.email}</span>
      </div>

      <div className={styles.messagesArea}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#999', marginTop: 50 }}>Начните беседу!</div>
        )}
        
{messages.map((msg) => {
          const isMe = msg.senderId === me.id;
          return (
            <div
              key={msg.id}
              className={`${styles.message} ${isMe ? styles.myMessage : styles.otherMessage}`}
              style={{ position: 'relative' }} 
            >
              {/* Верхняя часть сообщения (Контент + Кнопка удаления) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                
                {/* Контент сообщения */}
                <div style={{ flex: 1 }}>
                  {msg.imageUrl && (
                    <img 
                      src={msg.imageUrl} 
                      style={{ maxWidth: '100%', borderRadius: 8, marginBottom: 5 }} 
                      alt="attachment" 
                    />
                  )}
                  {msg.text && <div>{msg.text}</div>}
                </div>

                {/* Кнопка удаления (Только для своих сообщений) */}
                {isMe && (
                  <DeleteMsgBtn id={msg.id} />
                )}
              </div>
              
              <div className={styles.date}>
                {msg.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          );
        })}
      </div>

      <ChatInput receiverId={partnerId} />
    </div>
  );
}