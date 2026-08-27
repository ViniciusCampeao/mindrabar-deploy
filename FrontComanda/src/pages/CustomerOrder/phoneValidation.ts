/**
 * Validação leve de telefone brasileiro no cliente (UX apenas).
 * A regra oficial é aplicada pelo backend; isto só evita um round-trip
 * óbvio quando o número claramente não tem o formato certo.
 */
export function isValidBrazilianPhone(raw: string): boolean {
  const digits = raw.replace(/\D/g, '');
  if (digits.length !== 10 && digits.length !== 11) return false;

  const ddd = parseInt(digits.substring(0, 2), 10);
  if (ddd < 11 || ddd > 99) return false;

  if (digits.length === 11 && digits.charAt(2) !== '9') return false;

  return true;
}

export function formatPhoneInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}
