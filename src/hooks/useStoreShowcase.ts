"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchStoreShowcase } from "@/lib/api/products";

export function useStoreShowcase(storeId: string | null) {
  return useQuery({
    queryKey: ["store", storeId],
    queryFn: () => fetchStoreShowcase(storeId as string),
    enabled: storeId !== null,
  });
}
