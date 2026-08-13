package me.mindra.mindrabar_api.application.dto.table;

import me.mindra.mindrabar_api.domain.model.table.TableStatus;

public record TableStatusUpdateRequestDTO(
    Long id,
    TableStatus status
) {

}
