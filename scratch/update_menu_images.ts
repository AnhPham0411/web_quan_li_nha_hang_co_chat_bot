import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const imageMap: Record<string, string> = {
  "Gỏi cuốn tôm thịt": "https://images.unsplash.com/photo-1534422298391-e4f8c170db76?q=80&w=2070&auto=format&fit=crop",
  "Chả giò chiên giòn": "/images/menu/cha-gio.png",
  "Cơm tấm sườn bì chả": "/images/menu/com-tam.png",
  "Bún bò Huế": "/images/menu/bun-bo-hue.png",
  "Phở bò tái nạm": "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?q=80&w=2070&auto=format&fit=crop",
  "Bò Wagyu nướng muối ớt": "https://images.unsplash.com/photo-1628172030200-a6a3b2b1b369?q=80&w=2124&auto=format&fit=crop",
  "Lẩu thái hải sản": "https://images.unsplash.com/photo-1559813614-38686d73ca85?q=80&w=1974&auto=format&fit=crop",
  "Lẩu bò dầm sa tế": "https://images.unsplash.com/photo-1547928521-18764f161781?q=80&w=1974&auto=format&fit=crop",
  "Gà nướng mật ong": "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?q=80&w=2070&auto=format&fit=crop",
  "Cơm chiên dương châu": "https://images.unsplash.com/photo-1512058560550-42749ec45236?q=80&w=2070&auto=format&fit=crop",
  "Bún thịt nướng": "https://images.unsplash.com/photo-1503764320738-cb3275849a91?q=80&w=2070&auto=format&fit=crop",
  "Chè ba màu": "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?q=80&w=1974&auto=format&fit=crop",
  "Bánh flan caramel": "https://images.unsplash.com/photo-1590089415225-401ed6f9db8e?q=80&w=1974&auto=format&fit=crop",
  "Nước ngọt lon": "https://images.unsplash.com/photo-1622483767028-3f66f34a507b?q=80&w=2070&auto=format&fit=crop",
  "Trà đá": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=2028&auto=format&fit=crop",
  "Bia Tiger lon": "https://images.unsplash.com/photo-1608270586620-248524c67de9?q=80&w=2070&auto=format&fit=crop",
  "Nước ép cam tươi": "https://images.unsplash.com/photo-1547514701-42782101795e?q=80&w=1974&auto=format&fit=crop",
};

async function main() {
  console.log("🛠️ Updating live menu images...");
  
  for (const [name, imageUrl] of Object.entries(imageMap)) {
    const result = await prisma.menuItem.updateMany({
      where: { name },
      data: { imageUrl }
    });
    console.log(`✅ Updated ${result.count} items: ${name}`);
  }
  
  console.log("✨ Live Update Completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
