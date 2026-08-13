package me.mindra.mindrabar_api.domain.model.item;

import java.time.LocalDateTime;

import me.mindra.mindrabar_api.domain.model.order.Order;
import me.mindra.mindrabar_api.domain.model.product.Product;
import me.mindra.mindrabar_api.domain.model.user.User;
import me.mindra.mindrabar_api.exception.ErrorCode;
import me.mindra.mindrabar_api.exception.MindrabarException;

public class Item {
    
    private Long id;
    private User user;
    private Order order;
    private Product product;
    private int quantity;
    private int quantityPaid;
    private ItemStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public Item(Long id, User user, Order order, Product product, int quantity, int quantityPaid, ItemStatus status,
            LocalDateTime createdAt, LocalDateTime updatedAt) {
        if(user == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Usuário não pode ser nulo");
        }
        if(order == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Pedido não pode ser nulo");
        }
        if(product == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Produto não pode ser nulo");
        }
        if(quantity <= 0) {
            throw new MindrabarException(ErrorCode.INVALID_QUANTITY, "A quantidade deve ser maior que zero");
        }
        if(quantityPaid < 0) {
            throw new MindrabarException(ErrorCode.INVALID_QUANTITY, "A quantidade paga não pode ser negativa");
        }
        if(quantityPaid > quantity) {
            throw new MindrabarException(ErrorCode.INVALID_QUANTITY, "A quantidade paga não pode exceder a quantidade total");
        }
        if(status == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Status do item não pode ser nulo");
        }

        this.id = id;
        this.user = user;
        this.order = order;
        this.product = product;
        this.quantity = quantity;
        this.quantityPaid = quantityPaid;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Item(User user, Order order, Product product, int quantity, ItemStatus status) {
        if(user == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Usuário não pode ser nulo");
        }
        if(order == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Pedido não pode ser nulo");
        }
        if(product == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Produto não pode ser nulo");
        }
        if(quantity <= 0) {
            throw new MindrabarException(ErrorCode.INVALID_QUANTITY, "A quantidade deve ser maior que zero");
        }
        if(status == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Status do item não pode ser nulo");
        }
        
        this.user = user;
        this.order = order;
        this.product = product;
        this.status = status;
        this.quantityPaid = 0;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();

        if(quantity > this.getProduct().getStockQuantity()) {
            throw new MindrabarException(ErrorCode.INSUFFICIENT_STOCK, "Não é possível adicionar a quantidade: excederia o estoque disponível");
        }
        this.quantity = quantity;
    }

    public void updateStatus(ItemStatus status) {
        if(status == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Status do item não pode ser nulo");
        }
        this.status = status;
    }

    public void addPayment(int quantityToAdd) {
        if(quantityToAdd <= 0) {
            throw new MindrabarException(ErrorCode.INVALID_QUANTITY, "A quantidade a pagar deve ser maior que zero");
        }
        if(this.quantityPaid + quantityToAdd > this.quantity) {
            throw new MindrabarException(ErrorCode.INVALID_QUANTITY, "A quantidade paga excederia a quantidade total do item");
        }
        this.quantityPaid += quantityToAdd;
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public Order getOrder() {
        return order;
    }

    public Product getProduct() {
        return product;
    }

    public int getQuantity() {
        return quantity;
    }

    public int getQuantityPaid() {
        return quantityPaid;
    }

    public ItemStatus getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
