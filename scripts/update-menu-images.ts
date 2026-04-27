import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const imageMapping: Record<string, string> = {
  "Gỏi cuốn tôm thịt": "/images/menu/goi-cuon.png",
  "Chả giò chiên giòn": "/images/menu/cha-gio.png",
  "Cơm tấm sườn bì chả": "/images/menu/com-tam.png",
  "Bún bò Huế": "/images/menu/bun-bo-hue.png",
  "Phở bò tái nạm": "/images/menu/pho-bo.png",
  "Bò Wagyu nướng muối ớt": "/images/menu/bo-wagyu.png",
  "Lẩu thái hải sản": "/images/menu/lau-thai.png",
  "Lẩu bò dầm sa tế": "/images/menu/lau-bo.png",
  "Gà nướng mật ong": "/images/menu/ga-nuong.png",
  "Cơm chiên dương châu": "/images/menu/com-chien.png",
  "Bún thịt nướng": "/images/menu/bun-thit-nuong.png",
  "Chè ba màu": "/images/menu/che-ba-mau.png",
  "Bánh flan caramel": "/images/menu/banh-flan.png",
  "Nước ngọt lon": "/images/menu/nuoc-ngot.png",
  "Trà đá": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=2028&auto=format&fit=crop",
  "Bia Tiger lon": "https://images.unsplash.com/photo-1608270586620-248524c67de9?q=80&w=2070&auto=format&fit=crop",
  "Nước ép cam tươi": "https://images.unsplash.com/photo-1547514701-42782101795e?q=80&w=1974&auto=format&fit=crop",

};

async function main() {
  console.log("🔄 Updating menu images in database...");

  for (const [name, imageUrl] of Object.entries(imageMapping)) {
    const item = await prisma.menuItem.updateMany({
      where: { name },
      data: { imageUrl },
    });
    
    if (item.count > 0) {
      console.log(`✅ Updated image for: ${name} -> ${imageUrl}`);
    } else {
      console.log(`⚠️ Item not found: ${name}`);
    }
  }

  console.log("✨ database update complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
