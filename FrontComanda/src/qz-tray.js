/**
 * QZ Tray Compatibility Layer
 *
 * Este arquivo substitui a biblioteca QZ Tray original, mantendo a mesma API
 * mas redirecionando todas as chamadas para o backend via rota /print.
 */

import { httpClient } from './api/httpClient';
import { PRINT } from './api/endpoints';

// Simulação do WebSocket
const websocket = {
  _active: false,

  isActive: function() {
    return this._active;
  },

  connect: async function() {
    try {
      await httpClient.post(PRINT.SEND, {
        content: 'ping',
        type: 'health',
        timestamp: new Date().toISOString(),
      });
      this._active = true;
      return Promise.resolve();
    } catch (error) {
      console.error('Erro ao conectar ao servidor de impressão:', error);
      throw new Error('Não foi possível conectar ao servidor de impressão. Verifique se o backend está em execução.');
    }
  },

  disconnect: function() {
    this._active = false;
    return Promise.resolve();
  }
};

// Gerenciamento de impressoras (delegado ao backend)
const printers = {
  find: async function() {
    return [];
  },

  getDefault: async function() {
    return 'default';
  }
};

// Configurações de impressora
const configs = {
  create: function(printer) {
    return { printer };
  }
};

// Função principal de impressão
async function print(_config, data) {
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
}

// Função connect (mantida para compatibilidade)
function connect() {
  return websocket.connect();
}

// Exportar todos os objetos e funções para manter compatibilidade com QZ Tray
export {
  websocket,
  printers,
  configs,
  print,
  connect
};

// Export default para compatibilidade com importações padrão
export default {
  websocket,
  printers,
  configs,
  print,
  connect
};
