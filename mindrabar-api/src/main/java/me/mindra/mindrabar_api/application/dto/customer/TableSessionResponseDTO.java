package me.mindra.mindrabar_api.application.dto.customer;

import java.time.LocalDateTime;

import me.mindra.mindrabar_api.domain.model.customer.TableSessionStatus;

public record TableSessionResponseDTO(
    Long id,
    Long tableId,
    String tableName,
    String customerName,
    TableSessionStatus status,
    LocalDateTime createdAt,
    LocalDateTime confirmedAt
) {
}
