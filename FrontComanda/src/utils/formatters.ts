/**
 * Formata um valor como moeda (R$)
 * @param value Valor a ser formatado
 * @returns String formatada em BRL
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

/**
 * Formata uma data em formato brasileiro
 * @param dateString String de data em formato ISO
 * @returns Data formatada (DD/MM/YYYY HH:MM)
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return "";

  const date = new Date(dateString);

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};
