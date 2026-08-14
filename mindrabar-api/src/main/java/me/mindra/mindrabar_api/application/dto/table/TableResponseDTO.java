package me.mindra.mindrabar_api.application.dto.table;

import java.time.LocalDateTime;

import me.mindra.mindrabar_api.domain.model.table.TableStatus;

public record TableResponseDTO(
    Long id,
    String name,
    TableStatus status,
    Long companyId,
    String qrToken,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {

}
