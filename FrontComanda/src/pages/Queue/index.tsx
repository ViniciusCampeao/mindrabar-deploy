import { useState, useEffect, useCallback } from 'react';
import { itemService } from '../../api/items';
import type { ItemQueueApiResponse } from '../../api/items/item.interface';
import { ItemStatus, ItemStatusType } from '../../types/item';
import { Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, List, ListItem, ListItemText, Box, useTheme } from '@mui/material';
import { httpClient } from '../../api/httpClient';
import { PRINT } from '../../api/endpoints';

// Mapeamento de status para texto em português
const statusTranslation: Record<string, string> = {
  [ItemStatus.PENDING]: 'Pendente',
  [ItemStatus.PREPARING]: 'Em preparo',
  [ItemStatus.DELIVERED]: 'Entregue',
  [ItemStatus.CANCELLED]: 'Cancelado'
};

const getQueueItemKey = (item: ItemQueueApiResponse): string => {
  return `${item.itemId ?? 'no-item'}-${item.orderId ?? 'no-order'}-${item.productName}-${item.quantity}-${item.username}-${item.note ?? 'no-note'}-${item.createdAt}`;
};

const QueuePage = () => {
  const theme = useTheme();
  const [items, setItems] = useState([] as ItemQueueApiResponse[]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null as string | null);
  const [selectedStatus, setSelectedStatus] = useState(ItemStatus.PENDING as ItemStatusType);
  const [isUpdating, setIsUpdating] = useState(null as number | null);
  const [showNotes, setShowNotes] = useState(null as number | null);
  const [timeToNextUpdate, setTimeToNextUpdate] = useState(30);
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState([] as string[]);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const data = await itemService.getItemsByStatus(selectedStatus);
      setItems(data);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar itens:', err);
      setError('Falha ao carregar os itens. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [selectedStatus]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Atualização automática a cada 30 segundos
  useEffect(() => {
    // Resetar o contador sempre que os dados são atualizados
    setTimeToNextUpdate(30);
    
    const interval = setInterval(() => {
      fetchItems();
    }, 30000); // 30 segundos
    
    // Contador regressivo
    const timer = setInterval(() => {
      setTimeToNextUpdate(prev => {
        if (prev <= 1) return 30; // Reset quando chegar a zero
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, [fetchItems]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value as ItemStatusType);
    setSelectedItems([]);
  };

  useEffect(() => {
    const currentItemKeys = new Set(items.map(getQueueItemKey));
    setSelectedItems((prevSelectedItems) =>
      prevSelectedItems.filter((itemKey) => currentItemKeys.has(itemKey))
    );
  }, [items]);

  const toggleItemSelection = (item: ItemQueueApiResponse) => {
    const itemKey = getQueueItemKey(item);
    setSelectedItems((prevSelectedItems) =>
      prevSelectedItems.includes(itemKey)
        ? prevSelectedItems.filter((selectedKey) => selectedKey !== itemKey)
        : [...prevSelectedItems, itemKey]
    );
  };

  const toggleSelectAllVisibleItems = (checked: boolean) => {
    if (checked) {
      setSelectedItems(items.map(getQueueItemKey));
      return;
    }

    setSelectedItems([]);
  };

  // Função para mostrar/esconder as observações
  const toggleNotes = (itemId: number) => {
    setShowNotes(prevId => prevId === itemId ? null : itemId);
  };

  // Função para atualizar o status de um item
  const handleUpdateStatus = async (itemId: number, newStatus: ItemStatusType) => {
    try {
      setIsUpdating(itemId);
      const result = await itemService.updateItemStatus(itemId, newStatus);
      if (result) {
        // Se estiver iniciando o preparo, imprimir o pedido
        if (newStatus === ItemStatus.PREPARING) {
          const itemToPrint = items.find(item => (item.itemId || item.orderId) === itemId);
          if (itemToPrint) {
            try {
              await printPreparationOrder(itemToPrint);
            } catch (printError) {
              console.error('Erro ao imprimir pedido de preparo:', printError);
              setErrorMessage(`Erro ao imprimir: ${printError instanceof Error ? printError.message : 'Erro desconhecido'}`);
              setShowError(true);
              // Continuar mesmo se a impressão falhar
            }
          }
        }
        
        // Atualizar a lista de itens após a atualização bem-sucedida
        fetchItems();
        setSuccessMessage(`Status atualizado com sucesso para: ${statusTranslation[newStatus]}`);
        setShowSuccess(true);
      } else {
        throw new Error('Falha ao atualizar o status do item');
      }
    } catch (error) {
      console.error(`Erro ao atualizar status do item ${itemId}:`, error);
      setErrorMessage(`Erro ao atualizar status: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      setShowError(true);
    } finally {
      setIsUpdating(null);
    }
  };

  const sendPrintToLocalServer = async (rawData: string, successText: string): Promise<boolean> => {
    try {
      await httpClient.post(PRINT.SEND, {
        content: rawData,
        type: 'preparation',
        timestamp: new Date().toISOString(),
      });

      setSuccessMessage(successText);
      setShowSuccess(true);
      return true;
    } catch (printError) {
      console.error('[ERROR] Erro ao enviar para o servidor de impressão:', printError);
      setErrorMessage(`Erro ao imprimir: ${printError instanceof Error ? printError.message : 'Erro desconhecido'}`);
      setShowError(true);
      return false;
    }
  };

  const printGroupedPreparationOrders = async (itemsToPrint: ItemQueueApiResponse[]): Promise<boolean> => {
    try {
      if (itemsToPrint.length === 0) {
        setErrorMessage('Selecione ao menos um item para impressão.');
        setShowError(true);
        return false;
      }

      console.log('[DEBUG] Iniciando impressão agrupada para preparo. Itens:', itemsToPrint.length);

      const hoje = new Date();
      const dataFormatada = `${hoje.getDate().toString().padStart(2, '0')}/${(hoje.getMonth() + 1).toString().padStart(2, '0')}/${hoje.getFullYear()}`;
      const horaFormatada = `${hoje.getHours().toString().padStart(2, '0')}:${hoje.getMinutes().toString().padStart(2, '0')}`;

      const groupedItems = itemsToPrint.reduce((accumulator, currentItem) => {
        const groupKey = `${currentItem.orderId ?? 'N/A'}-${currentItem.tableName}`;

        if (!accumulator[groupKey]) {
          accumulator[groupKey] = {
            orderId: currentItem.orderId,
            tableName: currentItem.tableName,
            items: [] as ItemQueueApiResponse[],
          };
        }

        accumulator[groupKey].items.push(currentItem);
        return accumulator;
      }, {} as Record<string, { orderId: number | null; tableName: string; items: ItemQueueApiResponse[] }>);

      const attendants = Array.from(
        new Set(itemsToPrint.map((item) => item.username).filter((username): username is string => Boolean(username)))
      );

      let rawData = '\x1B\x40';
      rawData += '\x1D\x61\x01';
      rawData += '\x1B\x74\x00';

      rawData += '\x1B\x61\x01';
      rawData += '\x1B\x45\x01';
      rawData += 'COMANDA DE PREPARO\r\n';
      rawData += '\x1B\x45\x00';

      rawData += '================================\r\n';
      rawData += `Data: ${dataFormatada}\r\n`;
      rawData += `Hora: ${horaFormatada}\r\n`;
      rawData += `Itens selecionados: ${itemsToPrint.length}\r\n`;
      rawData += '================================\r\n';

      rawData += '\x1D\x21\x01';
      rawData += '\x1B\x61\x00';

      Object.values(groupedItems).forEach((group) => {
        rawData += '\x1B\x45\x01';
        rawData += `MESA: ${group.tableName}\r\n`;
        rawData += `PEDIDO #${group.orderId ?? 'N/A'}\r\n`;
        rawData += '\x1B\x45\x00';
        rawData += '--------------------------------\r\n';

        group.items.forEach((groupItem) => {
          rawData += `${groupItem.quantity}x ${groupItem.productName}\r\n`;

          if (groupItem.note) {
            rawData += `  OBS: ${groupItem.note}\r\n`;
          }
        });

        rawData += '--------------------------------\r\n';
      });

      rawData += '\x1D\x21\x00';
      rawData += '\r\n';
      rawData += '\x1B\x61\x01';
      rawData += '\x1B\x45\x01';
      rawData += `Atendente(s): ${attendants.join(', ') || 'N/A'}\r\n`;
      rawData += '\x1B\x45\x00';
      rawData += `${dataFormatada} - ${horaFormatada}\r\n`;
      rawData += '================================\r\n\r\n\r\n\r\n';

      rawData += '\x1B\x64\x04';
      rawData += '\x1D\x56\x42\x00';

      

      console.log('[DEBUG] Dados ESC/POS agrupados preparados. Tamanho:', rawData.length, 'bytes');

      return await sendPrintToLocalServer(rawData, 'Comanda agrupada enviada para impressão com sucesso!');
    } catch (error) {
      console.error('Erro ao preparar impressão agrupada:', error);
      setErrorMessage(`Erro ao preparar impressão agrupada: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      setShowError(true);
      return false;
    }
  };

  const handlePrintSelectedItems = async () => {
    const itemsToPrint = items.filter((item) => selectedItems.includes(getQueueItemKey(item)));

    if (itemsToPrint.length === 0) {
      setErrorMessage('Selecione pelo menos um item para imprimir.');
      setShowError(true);
      return;
    }

    const printResult = await printGroupedPreparationOrders(itemsToPrint);
    if (printResult) {
      const statusUpdateResults = await Promise.all(
        itemsToPrint.map(async (item) => {
          const itemId = item.itemId ?? item.orderId;

          if (itemId == null || item.status === ItemStatus.PREPARING) {
            return false;
          }

          const updatedItem = await itemService.updateItemStatus(itemId, ItemStatus.PREPARING);
          return Boolean(updatedItem);
        })
      );

      const updatedCount = statusUpdateResults.filter(Boolean).length;
      const itemsToUpdateCount = itemsToPrint.filter(
        (item) => (item.itemId ?? item.orderId) != null && item.status !== ItemStatus.PREPARING
      ).length;

      if (itemsToUpdateCount > 0 && updatedCount !== itemsToUpdateCount) {
        setErrorMessage('Comanda impressa, mas alguns itens não tiveram o status atualizado para Em preparo.');
        setShowError(true);
      }

      if (updatedCount > 0) {
        setSuccessMessage('Comanda impressa e status dos itens atualizado para Em preparo.');
        setShowSuccess(true);
      }

      setSelectedItems([]);
      fetchItems();
    }
  };

  const areAllVisibleItemsSelected =
    items.length > 0 && items.every((item) => selectedItems.includes(getQueueItemKey(item)));
  
  // Função para imprimir o pedido de preparo usando o servidor Python local
  const printPreparationOrder = async (item: ItemQueueApiResponse): Promise<boolean> => {
    try {
      console.log('[DEBUG] Iniciando processo de impressão do pedido para preparo');
      console.log('[DEBUG] Item ID:', item.itemId);
      console.log('[DEBUG] Order ID:', item.orderId);
      console.log('[DEBUG] Mesa:', item.tableName);
      
      // Formatar data e hora manualmente para evitar problemas de localização
      const hoje = new Date();
      const dataFormatada = `${hoje.getDate().toString().padStart(2, '0')}/${(hoje.getMonth() + 1).toString().padStart(2, '0')}/${hoje.getFullYear()}`;
      const horaFormatada = `${hoje.getHours().toString().padStart(2, '0')}:${hoje.getMinutes().toString().padStart(2, '0')}`;
      
      // Preparar os dados para impressão em formato ESC/POS
      // Inicializar impressora e limpar buffer
      let rawData = '\x1B\x40'; // Reset/inicializa a impressora
      
      // Espera pequena para processamento da inicialização
      rawData += '\x1D\x61\x01'; // Adiciona delay para processamento
      
      // Configurar página de código para ASCII padrão (mais compatível com impressoras básicas)
      rawData += '\x1B\x74\x00'; // Código de página 0 (ASCII padrão)
      
      // Centralizar texto
      rawData += '\x1B\x61\x01';
      
      // Título com texto grande e negrito
      rawData += '\x1D\x21\x11'; // Texto grande
      rawData += '\x1B\x45\x01'; // Negrito ligado
      rawData += 'PEDIDO PARA PREPARO\r\n';
      rawData += '\x1B\x45\x00'; // Negrito desligado
      rawData += '\x1D\x21\x00'; // Restaurar tamanho normal
      
      rawData += '================================\r\n';
      
      // Mesa e número do pedido em destaque
      rawData += '\x1D\x21\x01'; // Texto um pouco maior
      rawData += '\x1B\x45\x01'; // Negrito ligado
      rawData += `MESA: ${item.tableName}\r\n`;
      rawData += `PEDIDO #${item.orderId}\r\n`;
      rawData += '\x1B\x45\x00'; // Negrito desligado
      rawData += '\x1D\x21\x01'; // Manter tamanho um pouco maior
      
      // Informações de data e hora
      rawData += `Data: ${dataFormatada}\r\n`;
      rawData += `Hora: ${horaFormatada}\r\n`;
      rawData += '================================\r\n';
      
      // Título do item alinhado à esquerda
      rawData += '\x1B\x61\x00'; // Alinhar à esquerda
      rawData += '\x1B\x45\x01'; // Negrito ligado
      rawData += 'ITEM PARA PREPARO:\r\n';
      rawData += '\x1B\x45\x00'; // Negrito desligado
      
      // Item a ser preparado com tamanho grande (destaque)
      rawData += '\x1D\x21\x11'; // Texto grande
      rawData += '\x1B\x45\x01'; // Negrito ligado
      rawData += `${item.quantity}x ${item.productName}\r\n`;
      rawData += '\x1B\x45\x00'; // Negrito desligado
      rawData += '\x1D\x21\x01'; // Volta para tamanho médio
      
      // Adicionar observações se houver
      if (item.note) {
        rawData += '\r\n';
        rawData += '\x1B\x45\x01'; // Negrito ligado
        rawData += 'OBSERVACOES:\r\n'; // Removido acento para compatibilidade
        rawData += '\x1B\x45\x00'; // Negrito desligado
        // Destacar as observações com uma caixa
        rawData += '--------------------------------\r\n';
        rawData += `${item.note}\r\n`;
        rawData += '--------------------------------\r\n';
      }
      
      // Rodapé
      rawData += '\r\n';
      rawData += '\x1B\x61\x01'; // Centralizar
      rawData += '================================\r\n';
      rawData += '\x1B\x45\x01'; // Negrito ligado
      rawData += `Atendente: ${item.username}\r\n`;
      rawData += '\x1B\x45\x00'; // Negrito desligado
      rawData += `${dataFormatada} - ${horaFormatada}\r\n`;
      rawData += '================================\r\n\r\n\r\n\r\n';
      
      // Comando de avanço de papel para garantir espaço antes do corte
      rawData += '\x1B\x64\x04';
      
      // Cortar papel - comando para impressora TP 650
      rawData += '\x1D\x56\x42\x00';
      
      console.log('[DEBUG] Dados ESC/POS preparados. Tamanho:', rawData.length, 'bytes');

      return await sendPrintToLocalServer(rawData, 'Pedido enviado para impressão com sucesso!');
    } catch (error) {
      console.error('Erro ao preparar impressão:', error);
      setErrorMessage(`Erro ao preparar impressão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      setShowError(true);
      return false;
    }
  };

  // Função para calcular o tempo decorrido desde a criação
  const getElapsedTime = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    
    // Converter para minutos
    const diffMinutes = Math.floor(diffMs / 60000);
    
    if (diffMinutes < 60) {
      return `${diffMinutes} min`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const mins = diffMinutes % 60;
      return `${hours}h ${mins}m`;
    }
  };

  // Função para obter a classe CSS baseada no tempo de espera
  const getTimeClass = (createdAt: string, status: string) => {
    if (status === ItemStatus.DELIVERED || status === ItemStatus.CANCELLED) {
      return 'text-gray-500';
    }
    
    const created = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    
    if (diffMinutes < 10) {
      return 'text-green-500';
    } else if (diffMinutes < 20) {
      return 'text-yellow-500';
    } else {
      return 'text-red-500 font-bold';
    }
  };

  // Função para testar a impressora
  const testPrinter = async () => {
    try {
      // Importar QZ Tray
      const qz = await import('qz-tray');
      
      // Verificar se QZ Tray está conectado, se não, conectar
      if (!qz.websocket.isActive()) {
        try {
          await qz.websocket.connect();
        } catch (connectionError) {
          console.error('Erro ao conectar ao QZ Tray:', connectionError);
          setErrorMessage(
            "Não foi possível conectar ao serviço de impressão. Verifique as configurações do sistema."
          );
          setShowError(true);
          setHelpDialogOpen(true);
          return false;
        }
      }
      
      try {
        // Obter lista de impressoras disponíveis
        const availablePrinters = await qz.printers.find();
        
        if (!availablePrinters || availablePrinters.length === 0) {
          setErrorMessage("Nenhuma impressora detectada. Verifique as configurações do sistema.");
          setShowError(true);
          return false;
        }
        
        // Tentar recuperar a impressora salva para este usuário
        let selectedPrinter = '';
        try {
          const userData = localStorage.getItem("userData");
          if (userData) {
            const user = JSON.parse(userData);
            const userId = user.userId;
            
            // Tentar recuperar a preferência de impressora do localStorage
            const savedPrinter = localStorage.getItem(`printer_${userId}`);
            
            if (savedPrinter && availablePrinters.includes(savedPrinter)) {
              selectedPrinter = savedPrinter;
            } else {
              setErrorMessage(`Nenhuma impressora configurada ou a impressora salva não está disponível. Vá até a tela de fechamento de conta para configurar uma impressora padrão.`);
              setShowError(true);
              return false;
            }
          } else {
            setErrorMessage("Dados do usuário não encontrados. Faça login novamente.");
            setShowError(true);
            return false;
          }
        } catch (storageError) {
          console.error('Erro ao recuperar impressora salva:', storageError);
          setErrorMessage("Erro ao recuperar configuração da impressora. Vá até a tela de fechamento de conta para configurar uma impressora.");
          setShowError(true);
          return false;
        }
        
        if (!selectedPrinter) {
          setErrorMessage("Nenhuma impressora selecionada. Vá até a tela de fechamento de conta e selecione uma impressora padrão.");
          setShowError(true);
          return false;
        }
        
        // Preparar o conteúdo de teste
        const config = qz.configs.create(selectedPrinter);
        
        // Criar conteúdo para o teste de impressão
        const data = [
          // Inicializar impressora
          { type: 'raw' as const, format: 'command' as const, data: '\x1B\x40' },
          
          // Configurar página de código para suporte a caracteres latinos (incluindo acentos)
          { type: 'raw' as const, format: 'command' as const, data: '\x1B\x74\x02' }, // Código de página CP850 (Multilingual Latin)
          
          // Centralizar texto
          { type: 'raw' as const, format: 'command' as const, data: '\x1B\x61\x01' },
          
          // Título com texto grande
          { type: 'raw' as const, format: 'command' as const, data: '\x1D\x21\x11' }, // Texto grande
          { type: 'raw' as const, format: 'plain' as const, data: 'TESTE DE IMPRESSAO\n' }, // Sem acento para melhor compatibilidade
          { type: 'raw' as const, format: 'command' as const, data: '\x1D\x21\x00' }, // Restaurar tamanho normal
          
          { type: 'raw' as const, format: 'plain' as const, data: '================================\n' },
          { type: 'raw' as const, format: 'plain' as const, data: `Impressora: ${selectedPrinter}\n` },
          { type: 'raw' as const, format: 'plain' as const, data: `Data: ${new Date().toLocaleDateString('pt-BR')}\n` },
          { type: 'raw' as const, format: 'plain' as const, data: `Hora: ${new Date().toLocaleTimeString('pt-BR')}\n` },
          { type: 'raw' as const, format: 'plain' as const, data: '================================\n' },
          { type: 'raw' as const, format: 'command' as const, data: '\x1B\x74\x02' }, // Reforçar página de código para acentos
          { type: 'raw' as const, format: 'plain' as const, data: 'Se voce esta vendo este cupom,\na impressora esta configurada\ncorretamente!\n' }, // Removidos acentos
          { type: 'raw' as const, format: 'plain' as const, data: '================================\n\n\n\n' },
          
          // Comando de avanço de papel para garantir espaço antes do corte
          { type: 'raw' as const, format: 'command' as const, data: '\x1B\x64\x04' },
          
          // Cortar papel
          { type: 'raw' as const, format: 'command' as const, data: '\x1D\x56\x42\x00' }
        ];
        
        // Enviar para impressão
        await qz.print(config, data);
        
        setSuccessMessage(`Teste de impressão enviado com sucesso para: ${selectedPrinter}`);
        setShowSuccess(true);
        return true;
      } catch (printError: any) {
        console.error('Erro ao imprimir teste:', printError);
        setErrorMessage(`Erro ao imprimir teste: ${printError.message || 'Erro desconhecido'}`);
        setShowError(true);
        return false;
      }
    } catch (error: any) {
      console.error('Erro ao importar bibliotecas de impressão:', error);
      setErrorMessage(`Erro ao carregar sistema de impressão: ${error.message || 'Erro desconhecido'}`);
      setShowError(true);
      return false;
    }
  };

  // Função para formatar a data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="spinner"></div>
      <span className="ml-3">Carregando...</span>
    </div>
  );

  if (error) return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <strong className="font-bold">Erro!</strong>
      <span className="block sm:inline"> {error}</span>
    </div>
  );

  return (
    <div className="container-fluid w-full px-4 py-8" style={{ 
      backgroundColor: theme.palette.background.default,
      minHeight: '100vh'
    }}>
        <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold" style={{ color: theme.palette.text.primary }}>Fila de Pedidos</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <label htmlFor="status-select" className="mr-2 font-medium" style={{ color: theme.palette.text.primary }}>Status:</label>
            <select 
              id="status-select" 
              value={selectedStatus} 
              onChange={handleStatusChange}
              className="border rounded p-2"
              style={{ 
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary,
                borderColor: theme.palette.divider
              }}
            >
              <option value={ItemStatus.PENDING}>{statusTranslation[ItemStatus.PENDING]}</option>
              <option value={ItemStatus.PREPARING}>{statusTranslation[ItemStatus.PREPARING]}</option>
              <option value={ItemStatus.DELIVERED}>{statusTranslation[ItemStatus.DELIVERED]}</option>
              <option value={ItemStatus.CANCELLED}>{statusTranslation[ItemStatus.CANCELLED]}</option>
            </select>
          </div>
          
          <button 
            onClick={() => fetchItems()}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded transition duration-150 ease-in-out flex items-center"
            disabled={loading}
          >
            {loading ? (
              <span>Atualizando...</span>
            ) : (
              <>
                <span>Atualizar</span>
                <span className="ml-2 text-xs text-gray-500">({timeToNextUpdate}s)</span>
              </>
            )}
          </button>
          
          <button 
            onClick={testPrinter}
            className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
            title="Verifique se a impressora está configurada corretamente"
          >
            Testar Impressora
          </button>

          <button
            onClick={handlePrintSelectedItems}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={selectedItems.length === 0}
            title="Imprime em uma unica comanda os itens selecionados"
          >
            Imprimir Selecionados ({selectedItems.length})
          </button>
        </div>
      </div>      
      <div className="shadow-md rounded-lg overflow-hidden" style={{ backgroundColor: theme.palette.background.paper }}>
        <div className="p-4 border-b" style={{ 
          borderColor: theme.palette.divider,
          backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : theme.palette.grey[50]
        }}>
          <h2 className="text-lg font-semibold" style={{ color: theme.palette.text.primary }}>
            Itens com status: <span style={{ color: theme.palette.primary.main }}>{statusTranslation[selectedStatus]}</span>
          </h2>
          <p className="text-sm" style={{ color: theme.palette.text.secondary }}>
            {items.length} {items.length === 1 ? 'item encontrado' : 'itens encontrados'}
          </p>
          <p className="text-sm" style={{ color: theme.palette.text.secondary }}>
            {selectedItems.length} {selectedItems.length === 1 ? 'item selecionado para impressao' : 'itens selecionados para impressao'}
          </p>
        </div>
        
        {items.length === 0 ? (
          <div className="p-8 text-center" style={{ color: theme.palette.text.secondary }}>
            <p>Nenhum item encontrado com este status.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full" style={{ minWidth: '100%' }}>
            <table className="w-full divide-y border-collapse" style={{ borderColor: theme.palette.divider }}>
              <thead style={{ backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : theme.palette.grey[50] }}>
                <tr>
                  <th scope="col" className="px-3 py-3 text-center text-xs font-medium uppercase tracking-wider" style={{ color: theme.palette.text.secondary }}>
                    <input
                      type="checkbox"
                      checked={areAllVisibleItemsSelected}
                      onChange={(event) => toggleSelectAllVisibleItems(event.target.checked)}
                      aria-label="Selecionar todos os itens visiveis"
                    />
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.palette.text.secondary }}>Mesa</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.palette.text.secondary }}>Usuário</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.palette.text.secondary }}>Produto</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.palette.text.secondary }}>Qtd</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.palette.text.secondary }}>Pedido</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.palette.text.secondary }}>Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.palette.text.secondary }}>Tempo</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.palette.text.secondary }}>Data</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.palette.text.secondary }}>Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ 
                backgroundColor: theme.palette.background.paper,
                borderColor: theme.palette.divider
              }}>
                {items.map((item) => (
                  <tr key={getQueueItemKey(item)} className={`hover:bg-gray-50 ${showNotes === (item.itemId || item.orderId) ? 'bg-blue-50' : ''}`} style={{
                    backgroundColor: showNotes === (item.itemId || item.orderId)
                      ? (theme.palette.mode === 'dark' ? theme.palette.primary.dark + '20' : theme.palette.primary.light + '20')
                      : 'transparent'
                  }}>
                    <td className="px-3 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(getQueueItemKey(item))}
                        onChange={() => toggleItemSelection(item)}
                        aria-label={`Selecionar item ${item.productName}`}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium" style={{ color: theme.palette.text.primary }}>{item.tableName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm" style={{ color: theme.palette.text.primary }}>{item.username}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm" style={{ color: theme.palette.text.primary }}>{item.productName}</div>
                      {item.note && (
                        <div>
                          <button 
                            onClick={() => toggleNotes(item.itemId || item.orderId as number)} 
                            className="mt-1 text-xs hover:text-blue-800"
                            style={{ color: theme.palette.primary.main }}
                          >
                            {showNotes === (item.itemId || item.orderId) ? 'Esconder observação' : 'Ver observação'}
                          </button>
                          {showNotes === (item.itemId || item.orderId) && (
                            <div className="mt-2 p-2 rounded text-xs break-words" style={{
                              backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100],
                              color: theme.palette.text.primary
                            }}>
                              {item.note}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm" style={{ color: theme.palette.text.primary }}>{item.quantity}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm" style={{ color: theme.palette.text.primary }}>{item.orderId || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${item.status === ItemStatus.PENDING ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${item.status === ItemStatus.PREPARING ? 'bg-blue-100 text-blue-800' : ''}
                        ${item.status === ItemStatus.DELIVERED ? 'bg-green-100 text-green-800' : ''}
                        ${item.status === ItemStatus.CANCELLED ? 'bg-red-100 text-red-800' : ''}
                      `}>
                        {statusTranslation[item.status as keyof typeof statusTranslation] || item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-sm ${getTimeClass(item.createdAt, item.status)}`}>
                        {getElapsedTime(item.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: theme.palette.text.secondary }}>
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col space-y-2 items-end">
                        {item.status === ItemStatus.PENDING && (
                          <div className="flex w-full space-x-2">
                            <button 
                              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out flex-1"
                              onClick={() => handleUpdateStatus(
                                item.itemId || item.orderId as number, 
                                ItemStatus.PREPARING
                              )}
                              disabled={isUpdating === (item.itemId || item.orderId)}
                            >
                              {isUpdating === (item.itemId || item.orderId) ? 'Atualizando...' : 'Iniciar Preparo'}
                            </button>
                            <button 
                              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out flex-1"
                              onClick={() => handleUpdateStatus(
                                item.itemId || item.orderId as number, 
                                ItemStatus.CANCELLED
                              )}
                              disabled={isUpdating === (item.itemId || item.orderId)}
                            >
                              {isUpdating === (item.itemId || item.orderId) ? 'Atualizando...' : 'Cancelar'}
                            </button>
                          </div>
                        )}
                        {item.status === ItemStatus.PREPARING && (
                          <div className="flex w-full space-x-2">
                            <button 
                              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out flex-1"
                              onClick={() => handleUpdateStatus(
                                item.itemId || item.orderId as number, 
                                ItemStatus.DELIVERED
                              )}
                              disabled={isUpdating === (item.itemId || item.orderId)}
                            >
                              {isUpdating === (item.itemId || item.orderId) ? 'Atualizando...' : 'Entregue'}
                            </button>
                            <button 
                              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out flex-1"
                              onClick={() => handleUpdateStatus(
                                item.itemId || item.orderId as number, 
                                ItemStatus.CANCELLED
                              )}
                              disabled={isUpdating === (item.itemId || item.orderId)}
                            >
                              {isUpdating === (item.itemId || item.orderId) ? 'Atualizando...' : 'Cancelar'}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Notificação de Sucesso */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert 
          onClose={() => setShowSuccess(false)} 
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Notificação de Erro */}
      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={() => setShowError(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert 
          onClose={() => setShowError(false)} 
          severity="error"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>

      {/* Diálogo de Ajuda sobre o Servidor de Impressão */}
      <Dialog 
        open={helpDialogOpen} 
        onClose={() => setHelpDialogOpen(false)}
        maxWidth="md"
      >
        <DialogTitle>
          Como Configurar o Servidor de Impressão
        </DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Para imprimir pedidos diretamente na impressora térmica, é necessário executar o servidor Python de impressão local
          </Typography>
          
          <Box sx={{ my: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold">Passos para configuração:</Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="1. Inicie o servidor de impressão Python"
                  secondary={
                    <span>
                      A impressão é enviada ao servidor de backend, que encaminha o pedido para a impressora.
                    </span>
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="2. Verifique se o servidor está rodando"
                  secondary="O servidor de backend exibirá uma mensagem confirmando que está aguardando conexões."
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="3. Conecte sua impressora térmica"
                  secondary="Certifique-se de que sua impressora térmica Tanca TP-650 está conectada ao computador e ligada."
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="4. Aguarde o servidor detectar a impressora"
                  secondary="O servidor deve detectar automaticamente a impressora Tanca TP-650 conectada ao sistema."
                />
              </ListItem>
            </List>
          </Box>
          
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Observações Importantes:</Typography>
          <Typography paragraph>
            • O servidor Python precisa estar em execução sempre que você quiser imprimir comandas.
          </Typography>
          <Typography paragraph>
            • Sua impressora térmica precisa estar conectada ao computador onde o servidor Python está rodando.
          </Typography>
          <Typography paragraph>
            • Certifique-se de que o servidor de backend está acessível e em execução.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => {
              httpClient.post(PRINT.SEND, { content: 'ping', type: 'health', timestamp: new Date().toISOString() })
                .then(() => {
                  setSuccessMessage('Servidor de impressão está funcionando!');
                  setShowSuccess(true);
                })
                .catch(() => {
                  setErrorMessage('Servidor de impressão não está acessível');
                  setShowError(true);
                });
            }}
          >
            Verificar Servidor
          </Button>
          <Button 
            onClick={() => setHelpDialogOpen(false)}
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default QueuePage;
