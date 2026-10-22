import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth";
import { productListSchema, saveProducts } from "@/lib/products";

export async function PUT(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Нет доступа." }, { status: 401 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный JSON." }, { status: 400 });
  }
  const result = productListSchema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: "Проверьте названия, цены и изображения товаров." }, { status: 400 });
  try {
    await saveProducts(result.data);
    revalidatePath("/");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Не удалось сохранить товары. Проверьте настройки Redis." }, { status: 503 });
  }
}
