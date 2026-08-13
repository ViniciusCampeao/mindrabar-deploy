package me.mindra.mindrabar_api.application.dto.order;

import java.time.LocalDateTime;

import me.mindra.mindrabar_api.domain.model.order.OrderStatus;

public record OrderCreateResponseDTO(
    Long id,
    Long tableId,
    OrderStatus status,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {

}
