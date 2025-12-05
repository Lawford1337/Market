import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {

  const seller = await prisma.user.upsert({
    where: { email: 'seller@test.com' },
    update: {},
    create: {
      email: 'seller@test.com',
      password: 'hash_password',
      username: 'BestSeller',
      role: 'seller',
    },
  })

  // 2. Создаем товары
  await prisma.product.createMany({
    data: [
      {
        title: 'Apple iPhone 15 Pro',
        description: 'Супер телефон',
        price: 120000,
        category: 'electronics',
        sellerId: seller.id,
        images: ['img1']
      },
      {
        title: 'Кроссовки Nike Air',
        description: 'Удобные для бега',
        price: 15000,
        category: 'shoes',
        sellerId: seller.id,
        images: []
      },
      {
        title: 'Кофемашина DeLonghi',
        description: 'Вкусный кофе',
        price: 45000,
        category: 'home',
        sellerId: seller.id,
        images: []
      },
    ],
  })

  console.log('✅ База данных наполнена тестовыми товарами!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
  