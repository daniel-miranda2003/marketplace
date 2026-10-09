import type { Tables } from "@/lib/supabase/database.types";
import ProductCardView from "./ProductCardView";

type Product = Tables<"products">;

export default function ProductCard({ product }: { product: Product }) {
  return <ProductCardView product={product} />;
}
