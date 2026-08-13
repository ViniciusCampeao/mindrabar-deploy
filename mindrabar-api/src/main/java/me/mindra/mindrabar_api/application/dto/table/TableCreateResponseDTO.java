package me.mindra.mindrabar_api.application.dto.table;

import java.time.LocalDateTime;

import me.mindra.mindrabar_api.domain.model.table.TableStatus;

public record TableCreateResponseDTO(
    Long id,
    Long companyId,
    String name,
    TableStatus status,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {

}
