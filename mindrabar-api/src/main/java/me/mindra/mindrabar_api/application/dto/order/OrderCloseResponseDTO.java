package me.mindra.mindrabar_api.application.dto.order;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import me.mindra.mindrabar_api.domain.model.order.OrderStatus;

public record OrderCloseResponseDTO(
    Long id,
    Long tableId,
    OrderStatus status,
    BigDecimal totalAmount,
    BigDecimal amountPending,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    
}
