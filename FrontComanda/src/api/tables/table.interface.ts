import type { Table, TableStatus } from '../../modules/shared/types/common.types';

/**
 * Resposta da API para mesas
 */
export interface TableApiResponse {
  id: number;
  name: string;
  status: TableStatus;
  companyId: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Dados para criar uma mesa
 */
export interface CreateTableRequest {
  name: string;
  status: string;
}

/**
 * Dados para atualizar status de uma mesa
 */
export interface UpdateTableStatusRequest {
  id: number;
  status: string;
}

/**
 * Dados para atualizar nome de uma mesa
 */
export interface UpdateTableNameRequest {
  id: number;
  name: string;
}

/**
 * Porta de serviço de mesas
 */
export interface TableService {
  /**
   * Busca todas as mesas com informações detalhadas dos pedidos
   */
  getTablesWithOrderDetails(): Promise<Table[]>;
  
  /**
   * Busca todas as mesas
   */
  getAllTables(): Promise<Table[]>;
  
  /**
   * Busca uma mesa específica
   */
  getTableById(id: number): Promise<Table | null>;
  
  /**
   * Cria uma nova mesa
   */
  createTable(data: CreateTableRequest): Promise<Table>;
  
  /**
   * Atualiza o status de uma mesa
   */
  updateTableStatus(id: number, status: string): Promise<Table>;
  
  /**
   * Atualiza o nome de uma mesa
   */
  updateTableName(id: number, name: string): Promise<Table>;
  
  /**
   * Deleta uma mesa
   */
  deleteTable(id: number): Promise<boolean>;
}
