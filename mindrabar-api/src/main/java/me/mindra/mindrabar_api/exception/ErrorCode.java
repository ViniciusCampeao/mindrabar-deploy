package me.mindra.mindrabar_api.exception;

public enum ErrorCode {
    // Erros de autenticação e autorização (1xx)
    UNAUTHORIZED_ACCESS(100, "Acesso não autorizado"),
    INVALID_CREDENTIALS(101, "Credenciais inválidas"),
    INVALID_TOKEN(102, "Token inválido ou expirado"),
    INSUFFICIENT_PERMISSIONS(103, "Permissões insuficientes"),
    CROSS_COMPANY_ACCESS(104, "Acesso a recursos de outra empresa"),
    
    // Erros de recursos não encontrados (2xx)
    USER_NOT_FOUND(200, "Usuário não encontrado"),
    COMPANY_NOT_FOUND(201, "Empresa não encontrada"),
    PRODUCT_NOT_FOUND(202, "Produto não encontrado"),
    TABLE_NOT_FOUND(203, "Mesa não encontrada"),
    ORDER_NOT_FOUND(204, "Pedido não encontrado"),
    ITEM_NOT_FOUND(205, "Item não encontrado"),
    
    // Erros de validação (3xx)
    INVALID_EMAIL(300, "Email inválido"),
    INVALID_USERNAME(301, "Username inválido"),
    INVALID_PASSWORD(302, "Senha inválida"),
    REQUIRED_FIELD(303, "Campo obrigatório ausente"),
    INVALID_DATA_FORMAT(304, "Formato de dados inválido"),
    INVALID_DATE(305, "Data inválida"),
    INVALID_PRICE(306, "Preço inválido"),
    INVALID_QUANTITY(307, "Quantidade inválida"),
    INVALID_CNPJ(308, "CNPJ inválido"),
    
    // Erros de negócio (4xx)
    INSUFFICIENT_STOCK(400, "Estoque insuficiente"),
    INVALID_STATUS_TRANSITION(401, "Transição de status inválida"),
    DUPLICATE_ENTITY(402, "Entidade duplicada"),
    PLAN_LIMIT_EXCEEDED(403, "Limite do plano excedido"),
    BUSINESS_RULE_VIOLATION(404, "Violação de regra de negócio"),
    
    // Erros de sistema (5xx)
    INTERNAL_ERROR(500, "Erro interno do servidor"),
    DATABASE_ERROR(501, "Erro de banco de dados"),
    EXTERNAL_SERVICE_ERROR(502, "Erro em serviço externo"),
    CONFIGURATION_ERROR(503, "Erro de configuração");
    
    private final int code;
    private final String defaultMessage;
    
    ErrorCode(int code, String defaultMessage) {
        this.code = code;
        this.defaultMessage = defaultMessage;
    }
    
    public int getCode() {
        return code;
    }
    
    public String getDefaultMessage() {
        return defaultMessage;
    }
    
    public ErrorCategory getCategory() {
        if (code >= 100 && code < 200) {
            return ErrorCategory.SECURITY;
        } else if (code >= 200 && code < 300) {
            return ErrorCategory.NOT_FOUND;
        } else if (code >= 300 && code < 400) {
            return ErrorCategory.VALIDATION;
        } else if (code >= 400 && code < 500) {
            return ErrorCategory.BUSINESS;
        } else {
            return ErrorCategory.SYSTEM;
        }
    }
    
    public enum ErrorCategory {
        SECURITY,    // Erros de autenticação, autorização
        NOT_FOUND,   // Recursos não encontrados
        VALIDATION,  // Dados inválidos fornecidos pelo usuário
        BUSINESS,    // Violações de regras de negócio
        SYSTEM       // Erros internos do sistema
    }
}