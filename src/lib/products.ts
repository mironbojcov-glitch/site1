import "server-only";
import { Redis } from "@upstash/redis";
import { z } from "zod";

export type Product = { id: string; name: string; price: number; image: string };

export const defaultProducts: Product[] = [
  { id: "1", name: "Bape Tiger", price: 15000, image: "/images/popular/item-1.jpg" },
  { id: "2", name: "Зипка Chrome Hearts", price: 14500, image: "/images/popular/item-2.jpg" },
  { id: "3", name: "Кепка Chrome Hearts", price: 9000, image: "/images/popular/item-3.jpg" },
  { id: "4", name: "Кепки Gutta x Benzo", price: 10000, image: "/images/popular/item-4.jpg" },
  { id: "5", name: "Обувь Dior", price: 26000, image: "/images/popular/item-5.jpg" },
  { id: "6", name: "Обувь Dior", price: 23000, image: "/images/popular/item-6.jpg" },
  { id: "7", name: "Обувь NUMERIS", price: 26000, image: "/images/popular/item-7.jpg" },
  { id: "8", name: "Лонгслив Bape", price: 12000, image: "/images/popular/item-8.jpg" },
];

export const productListSchema = z.array(z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(80),
  price: z.number().int().min(0).max(10000000),
  image: z.string(),
}));

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  return url && token ? new Redis({ url, token }) : null;
}

export async function getProducts(): Promise<Product[]> {
  const redis = getRedis();
  if (!redis) return defaultProducts;
  try {
    const stored = await redis.get<unknown>("products");
    const parsed = productListSchema.safeParse(stored);
    return parsed.success && parsed.data.length > 0 ? parsed.data : defaultProducts;
  } catch {
    return defaultProducts;
  }
}

export async function saveProducts(list: Product[]): Promise<void> {
  const redis = getRedis();
  if (!redis) throw new Error("Хранилище товаров не настроено.");
  await redis.set("products", list);
}
