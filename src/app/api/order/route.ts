import axios from "axios";
import { orderSchema } from "@/lib/order";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function POST(request: Request) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return Response.json({ ok: false, error: "Server not configured" }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" },
      { status: 400 },
    );
  }

  const o = parsed.data;
  const commentLines = o.comment.split("\n").map((line) => line.trim()).filter(Boolean);
  const text = [
    "🛍 <b>Новая заявка — MyShop</b>",
    "",
    `📱 <b>Контакт:</b> ${esc(o.contact)}`,
    o.size ? `📏 <b>Размер:</b> ${esc(o.size)}` : null,
    ...commentLines.map(esc),
    "",
    `🕒 ${new Date().toLocaleString("ru-RU", { timeZone: "Asia/Qostanay" })} Костанай`,
  ]
    .filter((l) => l !== null)
    .join("\n");

  try {
    await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    });
    return Response.json({ ok: true });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Telegram API error:", error.response?.status ?? error.code, error.response?.data?.description ?? error.message);
    } else {
      console.error("Telegram API error:", error);
    }
    return Response.json({ ok: false, error: "Telegram error" }, { status: 502 });
  }
}
