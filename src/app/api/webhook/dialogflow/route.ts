import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

/**
 * FORCE REBUILD - 2026-04-21 17:53
 * Fixed syntax errors (bracket balancing).
 */

function verifyToken(req: NextRequest): boolean {
  const token = req.headers.get("x-dialogflow-token");
  return token === process.env.DIALOGFLOW_WEBHOOK_TOKEN;
}

export async function POST(req: NextRequest) {
  if (!verifyToken(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const intentName: string = body?.queryResult?.intent?.displayName ?? "";
  const parameters: Record<string, any> = body?.queryResult?.parameters ?? {};
  const queryText: string = body?.queryResult?.queryText ?? "";

  console.log(`[Dialogflow] Intent: ${intentName}, Params:`, parameters);

  // =============================================
  // INTENT: Check_Table — Hỏi còn bàn không
  // =============================================
  if (intentName === "check_table" || intentName === "Check_Table") {
    const partySize = Number(parameters["party_size"] ?? parameters["number"] ?? 2);
    const now = new Date();

    const availableTables = await prisma.table.findMany({
      where: {
        status: "EMPTY",
        capacity: { gte: partySize },
        OR: [
          { lockedUntil: null },
          { lockedUntil: { lt: now } },
        ],
      },
      orderBy: { capacity: "asc" },
    });

    let canMergeTables = false;
    let mergeableTables: typeof availableTables = [];
    if (availableTables.length === 0) {
      const allEmpty = await prisma.table.findMany({
        where: {
          status: "EMPTY",
          OR: [{ lockedUntil: null }, { lockedUntil: { lt: now } }],
        },
      });
      const totalCapacity = allEmpty.reduce((sum, t) => sum + t.capacity, 0);
      if (totalCapacity >= partySize) {
        canMergeTables = true;
        mergeableTables = allEmpty;
      }
    }

    if (availableTables.length > 0) {
      const fulfillmentText =
        `Dạ hệ thống em ghi nhận hiện đang có ${availableTables.length} bàn phù hợp cho ${partySize} người ạ! ` +
        `Anh/chị cho em số điện thoại để nhân viên báo lại check thực tế và giữ chỗ cho mình nhé? 😊`;
      return NextResponse.json({ fulfillmentText });
    } else if (canMergeTables) {
      return NextResponse.json({
        fulfillmentText:
          `Dạ quán không có bàn đơn đủ cho ${partySize} người, nhưng có thể ghép ${mergeableTables.length} bàn lại ạ! ` +
          `Anh/chị để lại số điện thoại, nhân viên sẽ xác nhận và sắp xếp ngay nhé!`,
      });
    } else {
      return NextResponse.json({
        fulfillmentText:
          `Dạ hiện tại quán đang khá đông, bàn chưa trống ạ 😢. ` +
          `Anh/chị có muốn để lại tên và số điện thoại, quán sẽ liên hệ ngay khi có chỗ nhé!`,
      });
    }
  }

  // =============================================
  // INTENT: Check_Food — Hỏi còn món không
  // =============================================
  if (intentName === "check_food" || intentName === "Check_Food") {
    const foodName: string = parameters["food_name"] ?? parameters["menu-item"] ?? queryText;
    const quantity = Number(parameters["quantity"] ?? parameters["number"] ?? 1);

    const item = await prisma.menuItem.findFirst({
      where: {
        name: { contains: foodName },
        isAvailable: true,
      },
    });

    if (!item) {
      return NextResponse.json({
        fulfillmentText: `Dạ em tìm không thấy món "${foodName}" trong thực đơn hôm nay ạ. Anh/chị có muốn xem menu đầy đủ không ạ?`,
      });
    }

    if (item.stockQuantity < quantity) {
      if (item.stockQuantity === 0) {
        return NextResponse.json({
          fulfillmentText: `Dạ rất tiếc, hôm nay quán đã hết "${item.name}" rồi ạ 😢. Anh/chị muốn thử món khác không ạ?`,
        });
      }
      return NextResponse.json({
        fulfillmentText:
          `Dạ món "${item.name}" hiện chỉ còn ${item.stockQuantity} suất thôi ạ ` +
          `(anh/chị hỏi ${quantity} suất). ` +
          `Anh/chị có muốn đặt ${item.stockQuantity} suất không ạ?`,
      });
    }

    return NextResponse.json({
      fulfillmentText:
        `Dạ món "${item.name}" hiện còn ${item.stockQuantity} suất, giá ${Number(item.price).toLocaleString("vi-VN")}đ/suất ạ! ` +
        `Anh/chị muốn đặt bàn kèm món luôn không ạ? 😊`,
    });
  }

  // =============================================
  // INTENT: Book_Table — Đặt bàn qua chatbot
  // =============================================
  // [NOT IMPLEMENTED - Reserved for future use]

  // =============================================
  // INTENT: Check_Reservation — Tra cứu đặt bàn
  // =============================================
  if (intentName === "check_reservation" || intentName === "Check_Reservation") {
    const phone = parameters["phone_number"] ?? parameters["phone"] ?? "";

    if (!phone) {
      return NextResponse.json({
        fulfillmentText: "Dạ anh/chị cho em xin số điện thoại đã dùng để đặt bàn để em tra cứu ạ!",
      });
    }

    const reservation = await prisma.reservation.findFirst({
      where: {
        guestPhone: phone,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      orderBy: { createdAt: "desc" },
      include: { table: { select: { tableNumber: true } } },
    });

    if (!reservation) {
      return NextResponse.json({
        fulfillmentText: `Dạ em không tìm thấy đơn đặt bàn nào cho số điện thoại ${phone} đang chờ hoặc đã xác nhận ạ. Anh/chị kiểm tra lại số giúp em nhé!`,
      });
    }

    const statusText = reservation.status === "CONFIRMED" ? "Đã xác nhận ✅" : "Đang chờ duyệt ⏳";
    const tableText = reservation.table ? ` | 🪑 Bàn: ${reservation.table.tableNumber}` : "";
    const dateText = new Date(reservation.reservedAt).toLocaleString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    return NextResponse.json({
      fulfillmentText: 
        `Dạ em tìm thấy thông tin đặt chỗ của anh/chị:\n` +
        `📅 ${dateText}\n` +
        `👥 ${reservation.partySize} người${tableText}\n` +
        `Trạng thái: ${statusText}\n\n` +
        `Anh/chị cần hỗ trợ gì thêm không ạ?`,
    });
  }

  // =============================================
  // INTENT: Cancel_Reservation — Hủy đặt bàn
  // =============================================
  if (intentName === "cancel_reservation" || intentName === "Cancel_Reservation") {
    const phone = parameters["phone_number"] ?? parameters["phone"] ?? "";

    if (!phone) {
      return NextResponse.json({
        fulfillmentText: "Dạ anh/chị cho em xin số điện thoại đặt bàn để em tiến hành hủy giúp mình ạ.",
      });
    }

    const reservation = await prisma.reservation.findFirst({
      where: {
        guestPhone: phone,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!reservation) {
      return NextResponse.json({
        fulfillmentText: `Dạ em không thấy đơn đặt bàn nào của số ${phone} để hủy ạ.`,
      });
    }

    await prisma.reservation.update({
      where: { id: reservation.id },
      data: { status: "CANCELLED" },
    });

    if (reservation.tableId) {
      await prisma.table.update({
        where: { id: reservation.tableId },
        data: { status: "EMPTY", lockedUntil: null },
      });
    }

    try {
      await pusherServer.trigger("admin-channel", "reservation-cancelled", {
        message: `🚫 Khách hủy bàn qua Bot: ${reservation.guestName} (${phone})`,
        reservationId: reservation.id,
      });
    } catch (err) {
      console.error("Pusher cancel notify failed:", err);
    }

    return NextResponse.json({
      fulfillmentText: `Dạ em đã hủy đơn đặt bàn của anh/chị ${reservation.guestName} thành công rồi ạ. Hy vọng sớm được phục vụ anh/chị lần sau! 👋`,
    });
  }

  // =============================================
  // INTENT: Recommendations — Gợi ý món ăn
  // =============================================
  const lowercaseQuery = queryText.toLowerCase();
  
  if (lowercaseQuery.includes("chạy nhất") || lowercaseQuery.includes("bán chạy")) {
    const topItems = await prisma.orderItem.groupBy({
      by: ['menuItemId'],
      _count: { menuItemId: true },
      orderBy: { _count: { menuItemId: 'desc' } },
      take: 3,
    });

    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: topItems.map(t => t.menuItemId) } }
    });

    if (menuItems.length > 0) {
      const itemsList = menuItems.map(item => `• ${item.name}: ${Number(item.price).toLocaleString("vi-VN")}đ`).join("\n");
      return NextResponse.json({
        fulfillmentText: `Dạ đây là 3 món đang được yêu thích nhất tại quán hôm nay ạ:\n${itemsList}\n\nAnh/chị có muốn đặt món nào không ạ? 😊`
      });
    } else {
      return NextResponse.json({
        fulfillmentText: "Dạ hiện tại em chưa thống kê được món chạy nhất, nhưng các món trong menu đều rất tươi ngon ạ. Anh/chị xem menu nhé?"
      });
    }
  }

  if (lowercaseQuery.includes("combo") || lowercaseQuery.includes("khuyến mãi")) {
    const combos = await prisma.menuItem.findMany({
      where: { 
        OR: [
          { category: { contains: "Combo" } },
          { name: { contains: "Combo" } },
          { description: { contains: "khuyến mãi" } }
        ],
        isAvailable: true
      },
      take: 3
    });

    if (combos.length > 0) {
      const itemsList = combos.map(item => `• ${item.name}: ${Number(item.price).toLocaleString("vi-VN")}đ`).join("\n");
      return NextResponse.json({
        fulfillmentText: `Dạ quán đang có các gói combo tiết kiệm sau ạ:\n${itemsList}\n\nĐặt combo sẽ hời hơn gọi lẻ đó ạ! 😉`
      });
    } else {
      return NextResponse.json({
        fulfillmentText: "Dạ hiện tại quán chưa có chương trình combo mới, nhưng các món lẻ vẫn đang rất ngon ạ. Anh/chị xem menu nhé?"
      });
    }
  }

  if (lowercaseQuery.includes("lẩu")) {
    const items = await prisma.menuItem.findMany({
      where: { 
        name: { contains: "Lẩu" },
        isAvailable: true
      },
      take: 3
    });

    if (items.length > 0) {
      const itemsList = items.map(item => `• ${item.name}: ${Number(item.price).toLocaleString("vi-VN")}đ`).join("\n");
      return NextResponse.json({
        fulfillmentText: `Dạ quán có các loại lẩu sau rất hợp cho nhóm mình ạ:\n${itemsList}\n\nAnh/chị cần em tư vấn kỹ hơn về vị lẩu nào không ạ? 🍲`
      });
    } else {
      return NextResponse.json({
        fulfillmentText: "Dạ hiện tại quán đang cập nhật các món lẩu mới. Anh/chị xem các món nướng hoặc xào khác cũng rất ngon ạ!"
      });
    }
  }

  // =============================================
  // INTENT: Human Handoff — Chuyển giao nhân viên
  // =============================================
  if (intentName === "human_handoff" || intentName === "Default Fallback Intent" || intentName === "default") {
    const isHandoff = body?.queryResult?.parameters?.isHandoff === true;

    if (isHandoff) {
      try {
        await pusherServer.trigger("admin-channel", "human-handoff", {
          message: "⚠️ Khách cần hỗ trợ trực tiếp! Bot không hiểu yêu cầu.",
          queryText,
        });
      } catch (err) {
        console.error("Pusher handoff error:", err);
      }
    }

    return NextResponse.json({
      fulfillmentText:
        `Dạ yêu cầu này hơi chi tiết, để em báo nhân viên trực page nhảy vào hỗ trợ mình ngay nhé! ` +
        `Hoặc anh/chị có thể gọi thẳng cho quán: 0909 xxx xxx 🙏`,
    });
  }

  return NextResponse.json({
    fulfillmentText: "Dạ em không hiểu câu hỏi này. Anh/chị có thể hỏi về bàn ăn, thực đơn, hoặc đặt chỗ không ạ?",
  });
}
