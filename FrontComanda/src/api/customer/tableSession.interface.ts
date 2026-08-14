import type { TableSessionStatus, BillResponse } from './customerOrder.interface';

export interface TableSessionSummary {
  id: number;
  tableId: number;
  tableName: string;
  customerName: string;
  status: TableSessionStatus;
  createdAt: string;
  confirmedAt: string | null;
}

export type { BillResponse };
