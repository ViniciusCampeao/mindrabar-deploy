/**
 * Python Printer Service
 *
 * Este serviço implementa a mesma interface do QZ Tray, encaminhando
 * todas as chamadas para o backend via rota /print.
 */

import { httpClient } from '../../api/httpClient';
import { PRINT } from '../../api/endpoints';

// Interface para manter compatibilidade com o módulo qz-tray
export interface QZTrayConfig {
  [key: string]: any;
}

export interface QZTrayData {
  type: 'raw' | 'pixel' | 'html' | 'pdf';
  format?: 'command' | 'plain' | 'image' | 'base64';
  data: string;
  options?: any;
}

// Websocket (simulado - gerenciamento de conexão delegado ao backend)
export const websocket = {
  isActive: (): boolean => {
    return localStorage.getItem('pythonPrinterConnected') === 'true';
  },

  connect: async (): Promise<void> => {
    try {
      await httpClient.post(PRINT.SEND, {
        content: 'ping',
        type: 'health',
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem('pythonPrinterConnected', 'true');
    } catch (error) {
      console.error('Erro ao conectar ao servidor de impressão:', error);
      localStorage.removeItem('pythonPrinterConnected');
      throw new Error('Não foi possível conectar ao servidor de impressão. Verifique se o backend está em execução.');
    }
  },

  disconnect: async (): Promise<void> => {
    localStorage.removeItem('pythonPrinterConnected');
    return Promise.resolve();
  }
};

// Printers (gerenciado pelo backend)
export const printers = {
  find: async (): Promise<string[]> => {
    return [];
  },

  getDefault: async (): Promise<string> => {
    return 'default';
  }
};

// Configs
export const configs = {
  create: (printer: string): QZTrayConfig => {
    return { printer };
  }
};

// Print function
export const print = async (_config: QZTrayConfig, data: any[]): Promise<any> => {
  try {
    const content = data.map(d => (typeof d === 'string' ? d : d.data ?? '')).join('');

    const response = await httpClient.post(PRINT.SEND, {
      content,
      type: 'receipt',
      timestamp: new Date().toISOString(),
    });

    return response.data;
  } catch (error) {
    console.error('Erro ao imprimir:', error);
    throw error;
  }
};

// Connect function (mantida para compatibilidade)
export const connect = async (): Promise<void> => {
  return websocket.connect();
};

// Export default para compatibilidade com importações padrão
export default {
  websocket,
  printers,
  configs,
  print,
  connect
};