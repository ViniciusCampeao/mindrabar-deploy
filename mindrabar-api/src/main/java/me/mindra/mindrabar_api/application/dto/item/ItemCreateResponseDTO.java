package me.mindra.mindrabar_api.application.dto.item;

import java.time.LocalDateTime;
import me.mindra.mindrabar_api.domain.model.item.Item;

public record ItemCreateResponseDTO(
    Long itemId,
    Long userId,
    Long orderId,
    Long productId,
    int quantity,
    String status,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public ItemCreateResponseDTO(Item item) {
        this(
            item.getId(),
            item.getUser() != null ? item.getUser().getId() : null,
            item.getOrder().getId(),
            item.getProduct().getId(),
            item.getQuantity(),
            item.getStatus().name(),
            item.getCreatedAt(),
            item.getUpdatedAt()
        );
    }
}
