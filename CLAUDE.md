@AGENTS.md

# buyer-site

## Стек
Next.js 16 (App Router, TypeScript), Tailwind CSS v4, framer-motion, lucide-react, zod, axios.

## Правила
- UI правится только в `src/app/page.tsx` и `src/app/components/OrderForm.tsx`.
- `src/app/api/order/route.ts` и `src/lib/order.ts` не трогать (отправка заявок в Telegram).
- Анимации только через framer-motion.
- Картинки только из `/images/collage/*` (`public/images/collage/collage-N.jpg`).
- Тема тёмная, glassmorphism, дорогой минимализм.
- Клиентские компоненты помечать `"use client"`.
- Без лишних зависимостей и без комментариев в коде.
- Секреты только в `.env.local` (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`), шаблон — `.env.example`.
