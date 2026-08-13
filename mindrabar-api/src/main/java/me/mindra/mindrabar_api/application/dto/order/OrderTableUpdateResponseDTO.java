package me.mindra.mindrabar_api.application.dto.order;

import java.time.LocalDateTime;

public record OrderTableUpdateResponseDTO(
    Long orderId,
    Long oldTableId,
    Long newTableId,
    LocalDateTime updatedAt
) {
}
