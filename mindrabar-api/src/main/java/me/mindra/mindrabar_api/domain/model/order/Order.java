package me.mindra.mindrabar_api.domain.model.order;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import me.mindra.mindrabar_api.domain.model.table.Table;
import me.mindra.mindrabar_api.exception.ErrorCode;
import me.mindra.mindrabar_api.exception.MindrabarException;

public class Order {
    
    private Long id;
    private Table table;
    private OrderStatus status;
    private PaymentMethod paymentMethod;
    private BigDecimal totalAmount;
    private BigDecimal amountPending;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Order(Long id, Table table, OrderStatus status, PaymentMethod paymentMethod, BigDecimal totalAmount,
            BigDecimal amountPending, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.table = table;
        this.status = status;
        this.paymentMethod = paymentMethod;
        this.totalAmount = totalAmount;
        this.amountPending = amountPending;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Order(Long id, Table table, OrderStatus status, LocalDateTime createdAt, LocalDateTime updatedAt) {
        if(table == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Mesa não pode ser nula");
        }
        
        this.id = id;
        this.table = table;
        this.status = status;
        this.paymentMethod = null;
        this.totalAmount = BigDecimal.ZERO;
        this.amountPending = BigDecimal.ZERO;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Order(Table table, OrderStatus status) {
        if(table == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Mesa não pode ser nula");
        }
        if(status == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Status do pedido não pode ser nulo");
        }

        this.table = table;
        this.status = status;
        this.paymentMethod = null;
        this.totalAmount = BigDecimal.ZERO;
        this.amountPending = BigDecimal.ZERO;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public void updateStatus(OrderStatus status) {
        if(status == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Status do pedido não pode ser nulo");
        }
        if(this.status == OrderStatus.CLOSED || this.status == OrderStatus.CANCELLED) {
            throw new MindrabarException(ErrorCode.INVALID_STATUS_TRANSITION, "Não é possível alterar o status de um pedido fechado ou cancelado");
        }
        // if(status == OrderStatus.CLOSED && (this.paymentMethod == null || this.totalAmount.compareTo(BigDecimal.ZERO) > 0)) {
        //     throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Não é possível fechar um pedido sem que o pagamento total tenha sido realizado");
        //     //TODO: Não ser possível fechar o pedido se o método de pagamento não tiver sido definido e o valor total for maior que zero
        // }
        this.status = status;
    }

    public void addTotalAmount(BigDecimal amount) {
        if(amount == null || amount.compareTo(BigDecimal.ZERO) < 0) {
            throw new MindrabarException(ErrorCode.INVALID_PRICE, "Valor inválido para o total do pedido");
        }
        if(this.status != OrderStatus.OPEN) {
            throw new MindrabarException(ErrorCode.INVALID_STATUS_TRANSITION, "Só é possível atualizar o valor total de pedidos abertos");
        }
        this.totalAmount = this.totalAmount.add(amount);
        this.amountPending = this.amountPending.add(amount);
        this.updatedAt = LocalDateTime.now();
    }

    public void removeTotalAmount(BigDecimal amount) {
        if(amount == null || amount.compareTo(BigDecimal.ZERO) < 0) {
            throw new MindrabarException(ErrorCode.INVALID_PRICE, "Valor inválido para o total do pedido");
        }
        if(this.status != OrderStatus.OPEN) {
            throw new MindrabarException(ErrorCode.INVALID_STATUS_TRANSITION, "Só é possível atualizar o valor total de pedidos abertos");
        }
        BigDecimal aux = this.totalAmount.subtract(amount);
        if(aux.compareTo(BigDecimal.ZERO) < 0) {
            throw new MindrabarException(ErrorCode.INVALID_PRICE, "Valor inválido para o total do pedido");
        }
        BigDecimal auxPending = this.amountPending.subtract(amount);
        if(auxPending.compareTo(BigDecimal.ZERO) < 0) {
            throw new MindrabarException(ErrorCode.INVALID_PRICE, "Valor inválido para o valor pendente do pedido");
        }
        this.totalAmount = aux;
        this.amountPending = auxPending;
        this.updatedAt = LocalDateTime.now();
    }

    public void payment(PaymentMethod paymentMethod, BigDecimal amount) {
        if(amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new MindrabarException(ErrorCode.INVALID_PRICE, "Valor de pagamento inválido");
        }
        if(this.status != OrderStatus.OPEN) {
            throw new MindrabarException(ErrorCode.INVALID_STATUS_TRANSITION, "Só é possível realizar pagamentos em pedidos abertos");
        }
        BigDecimal aux = this.totalAmount.subtract(amount);
        if(aux.compareTo(BigDecimal.ZERO) < 0) {
            throw new MindrabarException(ErrorCode.INVALID_PRICE, "Valor de pagamento excede o valor total do pedido");
        }
        this.totalAmount = aux;
        if(this.totalAmount.compareTo(BigDecimal.ZERO) == 0) {
            this.status = OrderStatus.CLOSED;
        }
        this.updatedAt = LocalDateTime.now();
    }

    public void updateTable(Table newTable) {
        if(newTable == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Mesa não pode ser nula");
        }
        if(this.status == OrderStatus.CLOSED || this.status == OrderStatus.CANCELLED) {
            throw new MindrabarException(ErrorCode.INVALID_STATUS_TRANSITION, "Não é possível alterar a mesa de um pedido fechado ou cancelado");
        }
        this.table = newTable;
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Table getTable() {
        return table;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public BigDecimal getAmountPending() {
        return amountPending;
    }

    public void removeAmountPending(BigDecimal amount) {
        if(amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new MindrabarException(ErrorCode.INVALID_PRICE, "Valor inválido para pagamento");
        }
        if(this.status != OrderStatus.OPEN) {
            throw new MindrabarException(ErrorCode.INVALID_STATUS_TRANSITION, "Só é possível realizar pagamentos em pedidos abertos");
        }
        BigDecimal aux = this.amountPending.subtract(amount);
        if(aux.compareTo(BigDecimal.ZERO) < 0) {
            throw new MindrabarException(ErrorCode.INVALID_PRICE, "Valor de pagamento excede o valor pendente do pedido");
        }
        this.amountPending = aux;
        if(this.amountPending.compareTo(BigDecimal.ZERO) == 0) {
            this.status = OrderStatus.CLOSED;
        }
        this.updatedAt = LocalDateTime.now();
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
}
