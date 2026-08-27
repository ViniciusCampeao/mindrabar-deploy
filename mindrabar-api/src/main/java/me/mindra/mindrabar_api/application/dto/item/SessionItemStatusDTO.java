package me.mindra.mindrabar_api.application.dto.item;

import java.time.LocalDateTime;

public record SessionItemStatusDTO(
    Long itemId,
    String productName,
    int quantity,
    String status,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
}
