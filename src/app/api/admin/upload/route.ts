import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";

const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Нет доступа." }, { status: 401 });
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Не удалось прочитать файл." }, { status: 400 });
  }
  const file = formData.get("file");
  if (!(file instanceof File) || !acceptedTypes.has(file.type) || file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Выберите JPG, PNG или WebP размером до 5 МБ." }, { status: 400 });
  }
  try {
    const blob = await put(`products/${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
    });
    return NextResponse.json({ url: blob.url });
  } catch {
    return NextResponse.json({ error: "Не удалось загрузить изображение. Проверьте настройки Blob." }, { status: 503 });
  }
}
