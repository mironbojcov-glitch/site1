import { z } from "zod";

export const orderSchema = z.object({
  name: z.string().trim().min(2, "Укажите имя").max(60),
  contact: z.string().trim().min(3, "Укажите Telegram или телефон").max(60),
  link: z.string().trim().url("Вставьте ссылку на товар").max(500),
  size: z.string().trim().max(20).optional().default(""),
  comment: z.string().trim().max(500).optional().default(""),
});

export type OrderInput = z.input<typeof orderSchema>;
export type Order = z.output<typeof orderSchema>;
