import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding restaurant database...");

  // Tạo Admin account
  const adminPassword = await bcrypt.hash("123456", 10);
  await prisma.user.upsert({
    where: { email: "admin@gmail.com" },
    update: {},
    create: {
      name: "Quản lý",
      email: "admin@gmail.com",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });
  console.log("✅ Admin user created: admin@gmail.com / 123456");

  // Tạo bàn ăn mẫu
  const tables = [
    { tableNumber: 1, capacity: 2 },
    { tableNumber: 2, capacity: 2 },
    { tableNumber: 3, capacity: 4 },
    { tableNumber: 4, capacity: 4 },
    { tableNumber: 5, capacity: 4 },
    { tableNumber: 6, capacity: 6 },
    { tableNumber: 7, capacity: 6 },
    { tableNumber: 8, capacity: 8 },
  ];

  for (const t of tables) {
    await prisma.table.upsert({
      where: { tableNumber: t.tableNumber },
      update: {},
      create: { ...t, status: "EMPTY" },
    });
  }
  console.log("✅ 8 tables created");

  // Tạo thực đơn mẫu
  const menuItems = [
    // Khai vị
    { name: "Gỏi cuốn tôm thịt", price: 65000, category: "Khai vị", stockQuantity: 50, isFeatured: false },
    { name: "Chả giò chiên giòn", price: 55000, category: "Khai vị", stockQuantity: 50 },

    // Món chính
    { name: "Cơm tấm sườn bì chả", price: 85000, category: "Món chính", stockQuantity: 30, isFeatured: true },
    { name: "Bún bò Huế", price: 75000, category: "Món chính", stockQuantity: 30 },
    { name: "Phở bò tái nạm", price: 80000, category: "Món chính", stockQuantity: 25 },
    { name: "Bò Wagyu nướng muối ớt", price: 380000, category: "Món chính", stockQuantity: 5, isFeatured: true, description: "Bò Wagyu thượng hạng nhập khẩu, nướng trên bếp than hoa" },

    // Lẩu & Nướng
    { name: "Lẩu thái hải sản", price: 350000, category: "Lẩu & Nướng", stockQuantity: 20, isFeatured: true },
    { name: "Lẩu bò dầm sa tế", price: 320000, category: "Lẩu & Nướng", stockQuantity: 20 },
    { name: "Gà nướng mật ong", price: 220000, category: "Lẩu & Nướng", stockQuantity: 15, isFeatured: true },

    // Cơm & Bún
    { name: "Cơm chiên dương châu", price: 65000, category: "Cơm & Bún", stockQuantity: 40 },
    { name: "Bún thịt nướng", price: 70000, category: "Cơm & Bún", stockQuantity: 35 },

    // Tráng miệng
    { name: "Chè ba màu", price: 35000, category: "Tráng miệng", stockQuantity: 30 },
    { name: "Bánh flan caramel", price: 30000, category: "Tráng miệng", stockQuantity: 25 },

    // Đồ uống
    { name: "Nước ngọt lon", price: 20000, category: "Đồ uống", stockQuantity: 100 },
    { name: "Trà đá", price: 10000, category: "Đồ uống", stockQuantity: 999 },
    { name: "Bia Tiger lon", price: 35000, category: "Đồ uống", stockQuantity: 100 },
    { name: "Nước ép cam tươi", price: 45000, category: "Đồ uống", stockQuantity: 50 },
  ];

  for (const item of menuItems) {
    await prisma.menuItem.create({
      data: {
        ...item,
        isAvailable: true,
        isFeatured: item.isFeatured ?? false,
        description: item.description ?? null,
      },
    });
  }
  console.log(`✅ ${menuItems.length} menu items created`);

  console.log("\n🎉 Seed completed!");
  console.log("Login: admin@gmail.com / 123456");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
