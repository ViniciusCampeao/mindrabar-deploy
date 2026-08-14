package me.mindra.mindrabar_api.application.dto.customer;

import me.mindra.mindrabar_api.domain.model.customer.TableSessionStatus;

public record TableSessionStartResponseDTO(
    Long sessionId,
    String sessionToken,
    Long tableId,
    String tableName,
    String customerName,
    TableSessionStatus status
) {
}
