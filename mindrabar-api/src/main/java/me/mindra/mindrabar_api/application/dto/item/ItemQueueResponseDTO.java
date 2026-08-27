package me.mindra.mindrabar_api.application.dto.item;

import java.time.LocalDateTime;

import me.mindra.mindrabar_api.domain.model.item.Item;
import me.mindra.mindrabar_api.domain.model.item.ItemStatus;

public record ItemQueueResponseDTO(
    Long itemId,
    Long orderId,
    String tableName,
    String username,
    String productName,
    Integer quantity,
    ItemStatus status,
    LocalDateTime createdAt
) {
    public ItemQueueResponseDTO(Item item) {
        this(
            item.getId(),
            item.getOrder() != null ? item.getOrder().getId() : null,
            item.getOrder() != null && item.getOrder().getTable() != null ? item.getOrder().getTable().getName() : "Mesa não definida",
            item.getUser() != null
                ? item.getUser().getUsername()
                : (item.getTableSession() != null ? item.getTableSession().getCustomer().getName() + " (QR)" : "Usuário não definido"),
            item.getProduct() != null ? item.getProduct().getName() : "Produto não definido",
            item.getQuantity(),
            item.getStatus(),
            item.getCreatedAt()
        );
    }
}
