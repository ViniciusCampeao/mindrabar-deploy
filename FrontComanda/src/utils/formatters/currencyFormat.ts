/**
 * Utilitários para formatação de moeda
 */

/**
 * Formata um valor numérico para o formato de moeda brasileiro (BRL)
 * @param value Valor a ser formatado
 * @returns String formatada no padrão de moeda brasileira
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

/**
 * Formata um valor numérico para o formato de moeda simplificado
 * utilizado na impressão térmica
 * @param value Valor a ser formatado
 * @returns String formatada para impressão (R$XX,XX)
 */
export const formatPrintCurrency = (value: number): string => {
  return `R$${value.toFixed(2).replace('.', ',')}`;
};