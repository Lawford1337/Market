import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

// 1. Письмо 
export async function sendOrderEmail(to: string, orderId: number, total: number) {
  try {
    await transporter.sendMail({
      from: `"Marketplace Bot" <${process.env.SMTP_EMAIL}>`,
      to,
      subject: `Заказ #${orderId} успешно оформлен! 🎉`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h1 style="color: #cb11ab;">Спасибо за покупку!</h1>
          <p>Ваш заказ <strong>#${orderId}</strong> принят в обработку.</p>
          <p>Сумма заказа: <strong>${total} ₽</strong></p>
          <hr />
          <p>Мы уже начали собирать вашу посылку 📦</p>
          <a href="http://localhost:3000/profile" style="color: #cb11ab;">Перейти в личный кабинет</a>
        </div>
      `,
    });
  } catch (error) {
    console.error('❌ Ошибка отправки письма покупателю:', error);
  }
}

// 2. Письмо барыге
export async function sendSellerEmail(to: string, itemName: string, price: number, buyerName: string) {
  try {
    await transporter.sendMail({
      from: `"Marketplace Bot" <${process.env.SMTP_EMAIL}>`,
      to,
      subject: `💰 У вас новая продажа: ${itemName}!`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h1 style="color: #28a745;">Поздравляем с продажей!</h1>
          <p>Пользователь <strong>${buyerName}</strong> купил ваш товар:</p>
          <h2 style="margin: 10px 0;">${itemName}</h2>
          <p>Сумма продажи: <strong>${price} ₽</strong></p>
          <hr />
          <p>Зайдите в личный кабинет, чтобы проверить детали.</p>
          <a href="http://localhost:3000/profile" style="color: #28a745;">Перейти в кабинет продавца</a>
        </div>
      `,
    });
  } catch (error) {
    console.error('❌ Ошибка отправки письма продавцу:', error);
  }
}

// 3. Письмо 2FA 
export async function sendTwoFactorTokenEmail(email: string, token: string) {
  try {
    await transporter.sendMail({
      from: `"Marketplace Security" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: "🔐 Ваш код подтверждения (2FA)",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center; border: 1px solid #eee; border-radius: 10px;">
          <h2>Код подтверждения</h2>
          <p>Введите этот код, чтобы войти в аккаунт:</p>
          <h1 style="letter-spacing: 5px; color: #cb11ab; background: #f4f4f4; padding: 10px; display: inline-block; border-radius: 5px;">
            ${token}
          </h1>
          <p>Код действителен 5 минут.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('❌ Ошибка отправки 2FA:', error);
  }
}

// 4. Письмо О ПРИБЫТИИ 
export async function sendArrivalEmail(to: string, orderId: number, location: string) {
  try {
    await transporter.sendMail({
      from: `"Marketplace Delivery" <${process.env.SMTP_EMAIL}>`,
      to,
      subject: `📦 Заказ #${orderId} ожидает в пункте выдачи!`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #cb11ab; border-radius: 10px;">
          <h1 style="color: #cb11ab;">Ваш заказ прибыл! 🚚</h1>
          <p>Заказ <strong>#${orderId}</strong> доставлен в пункт выдачи.</p>
          <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <strong>Адрес:</strong> ${location}<br/>
            <strong>Срок хранения:</strong> 7 дней
          </div>
          <p>Покажите этот код сотруднику или нажмите кнопку "Я получил заказ" в профиле.</p>
          <a href="http://localhost:3000/profile" style="display: inline-block; padding: 10px 20px; background: #cb11ab; color: white; text-decoration: none; border-radius: 5px;">
            Открыть заказ
          </a>
        </div>
      `,
    });
    console.log('📧 Письмо о доставке отправлено:', to);
  } catch (error) {
    console.error('❌ Ошибка отправки arrival email:', error);
  }
}