"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchProductById } from "@/lib/api/products";

export function useProduct(productId: string | null) {
  return useQuery({
    queryKey: ["product", productId],
    queryFn: () => {
      if (!productId) {
        throw new Error("Sin id de prenda.");
      }
      return fetchProductById(productId);
    },
    enabled: productId !== null,
    refetchOnMount: "always",
  });
}
