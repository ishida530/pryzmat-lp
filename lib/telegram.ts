// Ported z code94's lib/telegram.ts — generyczny klient Telegram Bot API, bez zmian.
function apiBase(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("Brak zmiennej środowiskowej TELEGRAM_BOT_TOKEN");
  return `https://api.telegram.org/bot${token}`;
}

type InlineKeyboard = { inline_keyboard: { text: string; callback_data: string }[][] };

async function telegramCall(method: string, body: Record<string, unknown>): Promise<any> {
  const res = await fetch(`${apiBase()}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.ok) {
    throw new Error(`Telegram API error (${method}): ${data.description ?? "nieznany błąd"}`);
  }
  return data.result;
}

export async function sendMessage(chatId: string, text: string, replyMarkup?: InlineKeyboard): Promise<{ message_id: number }> {
  return telegramCall("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
  });
}

export async function editMessageText(chatId: string, messageId: number, text: string, replyMarkup?: InlineKeyboard): Promise<void> {
  await telegramCall("editMessageText", {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: replyMarkup ?? { inline_keyboard: [] },
  });
}

export async function answerCallbackQuery(callbackQueryId: string, text?: string): Promise<void> {
  await telegramCall("answerCallbackQuery", {
    callback_query_id: callbackQueryId,
    ...(text ? { text } : {}),
  });
}
