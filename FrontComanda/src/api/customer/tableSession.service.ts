import { httpClient } from '../httpClient';
import type { TableSessionSummary } from './tableSession.interface';
import type { BillResponse } from './customerOrder.interface';

/**
 * Serviço usado pela equipe (garçom/gerente) para gerenciar as
 * sessões de clientes criadas pelo fluxo de QR Code.
 */
export const tableSessionService = {
  async getPending(): Promise<TableSessionSummary[]> {
    const response = await httpClient.get<TableSessionSummary[]>('/table-session/pending');
    return response.data;
  },

  async getPendingCount(): Promise<number> {
    const response = await httpClient.get<number>('/table-session/pending/count');
    return response.data;
  },

  async confirm(sessionId: number): Promise<TableSessionSummary> {
    const response = await httpClient.patch<TableSessionSummary>(`/table-session/${sessionId}/confirm`);
    return response.data;
  },

  async closeByTable(tableId: number): Promise<void> {
    await httpClient.post(`/table-session/table/${tableId}/close`);
  },

  async getBillByTable(tableId: number): Promise<BillResponse> {
    const response = await httpClient.get<BillResponse>(`/table-session/table/${tableId}/bill`);
    return response.data;
  },
};
