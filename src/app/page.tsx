import HomeClient from "./HomeClient";
import { isAdmin } from "@/lib/auth";
import { getProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [products, admin] = await Promise.all([getProducts(), isAdmin()]);
  return <HomeClient products={products} isAdmin={admin} />;
}
