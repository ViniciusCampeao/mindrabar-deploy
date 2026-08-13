package me.mindra.mindrabar_api.application.dto.item;

import java.time.LocalDateTime;
import me.mindra.mindrabar_api.domain.model.item.Item;

public record ItemResponseDTO(
    Long itemId,
    Long userId,
    Long orderId,
    Long productId,
    int quantity,
    int quantityPaid,
    String status,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public ItemResponseDTO(Item item) {
        this(
            item.getId(),
            item.getUser().getId(),
            item.getOrder().getId(),
            item.getProduct().getId(),
            item.getQuantity(),
            item.getQuantityPaid(),
            item.getStatus().name(),
            item.getCreatedAt(),
            item.getUpdatedAt()
        );
    }
}
