/**
 * Serviço para impressão térmica
 */
import { Order, OrderItem } from "../../modules/shared/types/common.types";
import { companyService } from '../../api/company/company.service';
import { formatPrintCurrency } from "../../utils/formatters/currencyFormat";
import { httpClient } from '../../api/httpClient';
import { PRINT } from '../../api/endpoints';

class PrinterService {
  /**
   * Verifica conectividade com o servidor de impressão via backend
   * @returns Promise<boolean> Indica se o servidor está disponível
   */
  async checkPrinterServer(): Promise<boolean> {
    try {
      await httpClient.post(PRINT.SEND, {
        content: 'ping',
        type: 'health',
        timestamp: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.error('Erro ao verificar servidor de impressão:', error);
      return false;
    }
  }

  /**
   * Prepara e envia os dados para impressão da comanda térmica
   * @param order Informações do pedido (id, mesa, nome da mesa, e se é fechamento de mesa completa)
   * @param orderItems Lista de itens do pedido
   * @param paymentInfo Informações de pagamento (total, pago, troco, método de pagamento)
   * @returns Promise<boolean> Indica se a impressão foi bem-sucedida
   */
  async printReceipt(
    order: { id: number; tableId: number; tableName?: string; isTableCheckout?: boolean },
    orderItems: OrderItem[],
    paymentInfo: { total: number; paid: number; change: number; paymentMethod?: string },
    manualCnpj?: string
  ): Promise<boolean> {
    console.log('[DEBUG] Iniciando processo de impressão');
    
    try {
      // Criar o conteúdo da impressão usando comandos ESC/POS
      // Preparar os comandos ESC/POS diretamente
      
      console.log('[DEBUG] Preparando dados ESC/POS...');
      
      // Inicializar impressora e limpar buffer
      let rawData = '\x1B\x40'; // Reset/inicializa a impressora
      
      // Espera pequena para processamento da inicialização
      rawData += '\x1D\x61\x01'; // Adiciona delay para processamento
      
      // Configurar página de código para ASCII padrão
      rawData += '\x1B\x74\x00'; // Código de página 0 (ASCII padrão)
      
      // Centralizar texto
      rawData += '\x1B\x61\x01';
      
      // Verificar se é uma prévia
      const isPreview = manualCnpj?.includes("PRÉVIA");
      
      // Título - garantir quebra de linha adequada
      if (isPreview) {
        rawData += '*** PRÉVIA DA CONTA ***\r\n';
        rawData += '(NÃO É UM CUPOM FISCAL)\r\n';
      } else {
        rawData += 'COMANDA\r\n';
      }
      rawData += '--------------------------------\r\n';
      
      // Formatar data e hora manualmente para evitar problemas de localização
      const hoje = new Date();
      const dataFormatada = `${hoje.getDate().toString().padStart(2, '0')}/${(hoje.getMonth() + 1).toString().padStart(2, '0')}/${hoje.getFullYear()}`;
      const horaFormatada = `${hoje.getHours().toString().padStart(2, '0')}:${hoje.getMinutes().toString().padStart(2, '0')}`;
      
      // Informações do pedido com quebras de linha CR+LF
      rawData += `Data: ${dataFormatada}\r\n`;
      rawData += `Hora: ${horaFormatada}\r\n`;
      
      // Se for fechamento de mesa completa, mostra apenas o nome da mesa
      // Caso contrário, mostra o pedido e a mesa (usando nome se disponível, senão tableId)
      if (order.isTableCheckout) {
        const mesaNome = order.tableName || `Mesa ${order.tableId}`;
        rawData += `${mesaNome}\r\n`;
      } else {
        const mesaNome = order.tableName || `Mesa ${order.tableId}`;
        rawData += `Pedido #${order.id} - ${mesaNome}\r\n`;
      }
      
      rawData += '--------------------------------\r\n';
      
      // Alinhar à esquerda
      rawData += '\x1B\x61\x00';
      
      // Título dos itens
      rawData += 'ITENS CONSUMIDOS:\r\n';
      
      // Lista de itens
      orderItems.forEach((item: OrderItem) => {
        const name = item.menuItem?.name || `Item #${item.menuItemId}`;
        const price = item.price || item.menuItem?.price || 0;
        const totalItemPrice = price * item.quantity;
        
        rawData += `${item.quantity}x ${name}\r\n`;
        rawData += `   ${formatPrintCurrency(price)} un = ${formatPrintCurrency(totalItemPrice)}\r\n`;
      });
      
      // Linha separadora
      rawData += '--------------------------------\r\n';
      
      // Alinhar à direita
      rawData += '\x1B\x61\x02';
      
      const { total, paid, change, paymentMethod } = paymentInfo;
      
      // Totais
      rawData += `TOTAL: ${formatPrintCurrency(total)}\r\n`;
      
      if (!isPreview) {
        // Só mostrar valores de pagamento se não for prévia
        rawData += `VALOR PAGO: ${formatPrintCurrency(paid)}\r\n`;
        rawData += `TROCO: ${formatPrintCurrency(change)}\r\n`;
        
        // Adicionar método de pagamento se fornecido
        if (paymentMethod) {
          const paymentMethodLabel = {
            'CASH': 'Dinheiro',
            'CREDIT_CARD': 'Cartão de Crédito',
            'DEBIT_CARD': 'Cartão de Débito',
            'PIX': 'PIX'
          }[paymentMethod] || paymentMethod;
          
          rawData += `FORMA DE PAGAMENTO: ${paymentMethodLabel}\r\n`;
        }
      }
      
      // Centralizar novamente
      rawData += '\x1B\x61\x01';
      
      // Rodapé
      rawData += '--------------------------------\r\n';
      // Certificando-se que a página de código está configurada antes do texto
      rawData += '\x1B\x74\x00';
      
      if (isPreview) {
        rawData += 'PRÉVIA - CONFERIR VALORES\r\n';
        rawData += 'CONTA NÃO FECHADA\r\n';
      } else {
        rawData += 'Obrigado pela preferencia!\r\n';
        rawData += 'Volte sempre!\r\n';
      }
      
      // Adiciona CNPJ ao recibo - só se não for prévia
      rawData += '--------------------------------\r\n';
      if (!isPreview) {
        if (manualCnpj) {
          rawData += `CNPJ: ${manualCnpj}\r\n`;
        } else {
          try {
            const empresa = await companyService.getCompanyDetails();
            if (empresa?.cnpj) {
              rawData += `CNPJ: ${empresa.cnpj}\r\n`;
            }
          } catch (cnpjError) {
            console.log('[WARN] Não foi possível obter o CNPJ da empresa', cnpjError);
          }
        }
      }

    // Cortar papel - comando para impressora TP 650
    rawData += '\x1D\x56\x42\x00';

      await httpClient.post(PRINT.SEND, {
        content: rawData,
        type: 'receipt',
        timestamp: new Date().toISOString(),
      });

      return true;
    } catch (error) {
      console.error('[ERROR] Erro ao enviar para o servidor de impressão:', error);
      throw error;
    }
  }

  /**
   * Envia pedidos da mesa para impressão via API (RabbitMQ)
   * Usado pelo garçom para solicitar impressão da comanda na máquina do caixa
   */
  async printOrderViaApi(
    tableName: string,
    orders: Order[]
  ): Promise<boolean> {
    const openOrders = orders.filter(o => o.status === "open");

    if (openOrders.length === 0) {
      throw new Error("Não há pedidos abertos para imprimir.");
    }

    const line = "--------------------------------";
    const hoje = new Date();
    const data = `${hoje.getDate().toString().padStart(2, "0")}/${(hoje.getMonth() + 1).toString().padStart(2, "0")}/${hoje.getFullYear()}`;
    const hora = `${hoje.getHours().toString().padStart(2, "0")}:${hoje.getMinutes().toString().padStart(2, "0")}`;

    const totalGeral = openOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    let content = "";
    content += `${line}\n`;
    content += `        COMANDA - ${tableName}\n`;
    content += `${line}\n`;
    content += `Data: ${data}  Hora: ${hora}\n`;
    content += `${line}\n`;

    openOrders.forEach(order => {
      content += `Pedido #${order.id}\n`;
      order.items.forEach(item => {
        const name = item.menuItem?.name || `Item #${item.menuItemId}`;
        const price = item.price || item.menuItem?.price || 0;
        const total = price * item.quantity;
        content += `  ${item.quantity}x ${name}\n`;
        content += `     ${formatPrintCurrency(price)} un = ${formatPrintCurrency(total)}\n`;
      });
      content += `${line}\n`;
    });

    content += `TOTAL DA MESA: ${formatPrintCurrency(totalGeral)}\n`;
    content += `${line}\n`;

    await httpClient.post(PRINT.SEND, {
      content,
      type: "receipt",
      timestamp: new Date().toISOString(),
    });

    return true;
  }
}

export default new PrinterService();