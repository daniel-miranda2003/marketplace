"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchProducts,
  type ProductFilters,
  type ProductPage,
} from "@/lib/api/products";

export const productKeys = {
  all: ["products"] as const,
  filtered: (filters: ProductFilters, page: number) =>
    [...productKeys.all, filters, page] as const,
};

export function useProducts(filters: ProductFilters, page = 1) {
  return useQuery<ProductPage, Error>({
    queryKey: productKeys.filtered(filters, page),
    queryFn: () => fetchProducts(filters, page),
    refetchOnMount: "always",
  });
}
