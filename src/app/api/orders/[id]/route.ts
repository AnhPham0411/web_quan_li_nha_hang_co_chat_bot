import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;

    if (!session || (role !== "ADMIN" && role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await req.json();
    const { id } = await params;

    const order = await prisma.order.update({
      where: { id },
      data: { status },
    });

    // 🔔 Notify the guest's table channel
    try {
      await pusherServer.trigger(`table-${order.tableId}`, "order-status-updated", {
        orderId: order.id,
        status: status
      });
    } catch (error) {
      console.error("Pusher trigger error:", error);
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Update order error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
