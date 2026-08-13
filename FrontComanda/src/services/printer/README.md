# Serviço de Impressão Python

Este diretório contém uma implementação de serviço de impressão que se conecta a um servidor Python local, mantendo a mesma interface do QZ Tray para minimizar mudanças no código da aplicação.

## Como funciona

O sistema agora utiliza um servidor Python local em vez do QZ Tray tradicional para impressão térmica. O servidor Python fornece uma API REST que emula a funcionalidade do QZ Tray, permitindo:

1. Detecção de impressoras disponíveis
2. Obtenção da impressora padrão do sistema
3. Envio de comandos ESC/POS diretamente para a impressora

## Configuração

1. Certifique-se de que o arquivo `impressora_compativel.py` está disponível e configurado no computador do cliente
2. Execute o script Python antes de usar o sistema:
   ```
   python impressora_compativel.py
   ```
3. O servidor Python deve estar rodando em http://127.0.0.1:8080

## Autenticação

O serviço Python usa autenticação via Bearer Token:
- Token: `Lambari@2025!`

## Comportamento

- O sistema tenta se conectar automaticamente ao serviço de impressão Python quando necessário
- Um alerta será exibido se o serviço Python não estiver rodando
- O sistema salva a preferência de impressora para cada usuário

## Solução de Problemas

Se encontrar problemas com a impressão:

1. Verifique se o servidor Python está em execução (`impressora_compativel.py`)
2. Verifique se a impressora TP-650 está conectada e configurada como padrão
3. Reinicie o servidor Python se necessário
4. Verifique os logs do servidor Python para detalhes sobre erros