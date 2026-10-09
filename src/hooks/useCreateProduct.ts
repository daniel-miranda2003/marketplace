"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProduct } from "@/app/actions/products";
import { productKeys } from "./useProducts";

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => createProduct(formData),
    onSuccess: (result) => {
      if (result.ok) {
        void queryClient.invalidateQueries({ queryKey: productKeys.all });
      }
    },
  });
}
