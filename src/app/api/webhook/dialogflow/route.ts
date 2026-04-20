import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

// 🚨 PM FIX - Bảo mật Webhook: Kiểm tra token ngay dòng đầu tiên
// Chỉ request từ Dialogflow với đúng secret token mới được xử lý
function verifyToken(req: NextRequest): boolean {
  const token = req.headers.get("x-dialogflow-token");
  return token === process.env.DIALOGFLOW_WEBHOOK_TOKEN;
}

export async function POST(req: NextRequest) {
  // 🛡️ SECURITY GATE — Chặn mọi request không có/sai token ngay lập tức
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

    // Tìm bàn EMPTY, đủ chỗ, không bị khóa
    const availableTables = await prisma.table.findMany({
      where: {
        status: "EMPTY",
        capacity: { gte: partySize },
        OR: [
          { lockedUntil: null },
          { lockedUntil: { lt: now } },
        ],
      },
      orderBy: { capacity: "asc" }, // Ưu tiên bàn vừa đủ chỗ
    });

    // Kiểm tra ghép bàn nếu không có bàn đủ lớn
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

    // Kiểm tra bàn đang dọn
    const cleaningTables = await prisma.table.count({ where: { status: "CLEANING" } });

    if (availableTables.length > 0) {
      // 🚨 PM FIX: Không hứa hẹn 100%, hướng dẫn khách chờ xác nhận
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
    } else if (cleaningTables > 0) {
      return NextResponse.json({
        fulfillmentText:
          `Dạ hiện bàn đang được dọn dẹp ạ. Khoảng 5-10 phút nữa là có chỗ. ` +
          `Anh/chị có muốn em báo nhân viên giữ chỗ không ạ?`,
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

    // 🚨 PM FIX: Kiểm tra stockQuantity chính xác, không chỉ boolean
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
  if (intentName === "book_table" || intentName === "Book_Table") {
    const guestName: string = parameters["guest_name"] ?? parameters["person_name"] ?? "Quý khách";
    const guestPhone: string = parameters["phone_number"] ?? parameters["phone"] ?? "";
    const partySize = Number(parameters["party_size"] ?? parameters["number"] ?? 2);
    const reservedAt: string = parameters["date_time"] ?? new Date().toISOString();
    const notes: string = parameters["notes"] ?? "";

    if (!guestPhone) {
      return NextResponse.json({
        fulfillmentText: `Dạ anh/chị cho em số điện thoại để nhân viên xác nhận và giữ chỗ cho mình nhé ạ!`,
      });
    }

    const now = new Date();

    // 🚨 PM FIX: Dùng Prisma Transaction để lock bàn nguyên tử, tránh race condition
    try {
      const result = await prisma.$transaction(async (tx) => {
        // Tìm bàn phù hợp, chưa bị lock
        const table = await tx.table.findFirst({
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

        // Tạo reservation (PENDING — nhân viên phải xác nhận)
        const reservation = await tx.reservation.create({
          data: {
            tableId: table?.id ?? null,
            guestName,
            guestPhone,
            partySize,
            notes,
            source: "chatbot",
            status: "PENDING",
            reservedAt: new Date(reservedAt),
            // Soft-lock bàn 5 phút nếu tìm được bàn
            lockedUntil: table ? new Date(now.getTime() + 5 * 60 * 1000) : null,
          },
        });

        // Khóa bàn trong DB
        if (table) {
          await tx.table.update({
            where: { id: table.id },
            data: { lockedUntil: new Date(now.getTime() + 5 * 60 * 1000) },
          });
        }

        return { reservation, table };
      });

      // 🚨 PM FIX: Bắn Pusher để nhân viên thấy đơn mới ngay — không cần F5
      try {
        await pusherServer.trigger("admin-channel", "new-reservation", {
          message: `🤖 Đặt bàn qua Chatbot: ${guestName} (${partySize} người)`,
          reservationId: result.reservation.id,
          guestName,
          guestPhone,
          partySize,
          source: "chatbot",
          tableNumber: result.table?.tableNumber,
        });
      } catch (pusherErr) {
        console.error("Pusher trigger failed:", pusherErr);
      }

      const tableInfo = result.table
        ? `Bàn số ${result.table.tableNumber} đang được giữ tạm cho anh/chị 5 phút. `
        : `Nhân viên sẽ sắp xếp bàn cho anh/chị. `;

      return NextResponse.json({
        // 🚨 PM FIX: Không xác nhận cứng, luôn nhắc "nhân viên check thực tế"
        fulfillmentText:
          `Đã ghi nhận! ${tableInfo}` +
          `Nhân viên sẽ gọi lại số ${guestPhone} để xác nhận trong vài phút ạ. ` +
          `Anh/chị nhớ nghe máy nhé! Cảm ơn ${guestName} ạ 🙏`,
      });
    } catch (err) {
      console.error("[Dialogflow] Book_Table error:", err);
      return NextResponse.json({
        fulfillmentText:
          `Dạ hệ thống đang bận, anh/chị vui lòng gọi trực tiếp cho quán để đặt bàn nhé! Số ĐT: 0909 xxx xxx`,
      });
    }
  }

  // =============================================
  // INTENT: Human Handoff — Chuyển giao nhân viên
  // =============================================
  if (intentName === "human_handoff" || intentName === "Default Fallback Intent") {
    const isHandoff = body?.queryResult?.parameters?.isHandoff === true;

    if (isHandoff) {
      // Bắn cảnh báo lên Dashboard để nhân viên nhảy vào hỗ trợ
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

  // Default response
  return NextResponse.json({
    fulfillmentText: "Dạ em không hiểu câu hỏi này. Anh/chị có thể hỏi về bàn ăn, thực đơn, hoặc đặt chỗ không ạ?",
  });
}
