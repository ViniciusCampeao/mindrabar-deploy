import { httpClient } from '../httpClient';
import type {
  PublicTableInfo,
  PublicMenuProduct,
  StartSessionRequest,
  StartSessionResponse,
  CustomerOrderItemRequest,
  ItemCreateResponse,
  BillResponse,
} from './customerOrder.interface';

/**
 * Serviço público (sem autenticação) usado pela página do cliente
 * que abre a partir do QR Code impresso na mesa.
 */
export const customerOrderService = {
  async getTableInfo(qrToken: string): Promise<PublicTableInfo> {
    const response = await httpClient.get<PublicTableInfo>(`/public/tables/${qrToken}`);
    return response.data;
  },

  async getMenu(qrToken: string): Promise<PublicMenuProduct[]> {
    const response = await httpClient.get<PublicMenuProduct[]>(`/public/tables/${qrToken}/menu`);
    return response.data;
  },

  async startSession(qrToken: string, data: StartSessionRequest): Promise<StartSessionResponse> {
    const response = await httpClient.post<StartSessionResponse>(`/public/tables/${qrToken}/sessions`, data);
    return response.data;
  },

  async placeItem(sessionToken: string, data: CustomerOrderItemRequest): Promise<ItemCreateResponse> {
    const response = await httpClient.post<ItemCreateResponse>(`/public/sessions/${sessionToken}/items`, data);
    return response.data;
  },

  async getBill(sessionToken: string): Promise<BillResponse> {
    const response = await httpClient.get<BillResponse>(`/public/sessions/${sessionToken}/bill`);
    return response.data;
  },
};
