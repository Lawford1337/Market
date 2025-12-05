import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import styles from './chat-list.module.css'; 

export default async function ChatListPage() {
  //  Проверка авторизации
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  if (!token) redirect('/login');

  const me = verify(token.value, process.env.JWT_SECRET || 'secret') as { id: number };

  //  Ищем ВСЕ сообщения, где я отправитель ИЛИ получатель
  const messages = await db.message.findMany({
    where: {
      OR: [
        { senderId: me.id },
        { receiverId: me.id }
      ]
    },
    include: {
      sender: true,
      receiver: true
    },
    orderBy: {
      createdAt: 'desc' 
    }
  });

  //  Группируем по собеседнику (чтобы не показывать 10 раз одного человека)
  const chats = new Map();

  messages.forEach((msg) => {
    // Определяем, кто собеседник (не я)
    const partner = msg.senderId === me.id ? msg.receiver : msg.sender;
    
    // Если этого партнера еще нет в списке - добавляем
    if (!chats.has(partner.id)) {
      chats.set(partner.id, {
        partnerUser: partner,
        lastMessage: msg.text,
        date: msg.createdAt
      });
    }
  });

  // Превращаем Map обратно в массив
  const chatList = Array.from(chats.values());

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Мои сообщения</h1>

      {chatList.length === 0 ? (
        <div className={styles.empty}>
          <p>У вас пока нет диалогов 📭</p>
        </div>
      ) : (
        <div className={styles.list}>
          {chatList.map((chat) => (
            <Link 
              key={chat.partnerUser.id} 
              href={`/chat/${chat.partnerUser.id}`} 
              className={styles.chatCard}
            >
              {/* Аватарка (кружок с первой буквой) */}
              <div className={styles.avatar}>
                {chat.partnerUser.username?.[0].toUpperCase() || 'U'}
              </div>

              <div className={styles.info}>
                <div className={styles.topRow}>
                  <span className={styles.username}>{chat.partnerUser.username}</span>
                  <span className={styles.date}>
                    {new Date(chat.date).toLocaleDateString()}
                  </span>
                </div>
                <p className={styles.lastMessage}>{chat.lastMessage}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}