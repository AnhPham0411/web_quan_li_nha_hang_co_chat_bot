import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey && resendApiKey !== "your-resend-api-key" ? new Resend(resendApiKey) : null;

const FROM_EMAIL = process.env.FROM_EMAIL || "Quán Ngon <onboarding@resend.dev>";

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${process.env.NEXTAUTH_URL}/reset-password/${token}`;

  // 🚨 DEVELOPER FALLBACK: Nếu chưa có RESEND_API_KEY, log ra console để test local
  if (!resend) {
    console.log("==========================================");
    console.log("📧 EMAIL MOCK (NO API KEY FOUND OR INVALID)");
    console.log(`To: ${email}`);
    console.log(`Subject: Khôi phục mật khẩu - Quán Ngon`);
    console.log(`Reset Link: ${resetLink}`);
    console.log("==========================================");
    return { success: true, mocked: true };
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Khôi phục mật khẩu - Quán Ngon",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #f59e0b;">Khôi phục mật khẩu</h1>
          <p>Chào bạn,</p>
          <p>Bạn đã yêu cầu khôi phục mật khẩu cho tài khoản tại Quán Ngon. Vui lòng nhấn vào nút bên dưới để đặt lại mật khẩu:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Đổi mật khẩu</a>
          </div>
          <p>Nếu bạn không yêu cầu việc này, vui lòng bỏ qua email này.</p>
          <p>Link có hiệu lực trong 1 giờ.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #666;">© 2026 Quán Ngon. All rights reserved.</p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}

export async function sendReservationConfirmation({
  email,
  guestName,
  reservedAt,
  partySize,
  tableNumber,
}: {
  email: string;
  guestName: string;
  reservedAt: Date;
  partySize: number;
  tableNumber?: number;
}) {
  const formattedDate = new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(reservedAt);

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Xác nhận đặt bàn thành công - Quán Ngon",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #f59e0b;">Xác nhận đặt bàn</h1>
          <p>Chào <strong>${guestName}</strong>,</p>
          <p>Đặt bàn của bạn tại <strong>Quán Ngon</strong> đã được xác nhận!</p>
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <p>📅 <strong>Thời gian:</strong> ${formattedDate}</p>
            <p>👥 <strong>Số lượng:</strong> ${partySize} người</p>
            ${tableNumber ? `<p>🪑 <strong>Bàn số:</strong> ${tableNumber}</p>` : ""}
          </div>
          <p>Nếu cần thay đổi hoặc hủy đặt bàn, vui lòng liên hệ hotline: <strong>0909-xxx-xxx</strong></p>
          <p>Hẹn gặp bạn tại quán!</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #666;">© 2026 Quán Ngon. All rights reserved.</p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}
