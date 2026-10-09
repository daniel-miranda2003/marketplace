export const formatPrice = (value: number) =>
  new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "BOB",
  }).format(value);

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es-BO", { dateStyle: "medium" }).format(
    new Date(value),
  );
