package me.mindra.mindrabar_api.application.dto.table;

import me.mindra.mindrabar_api.domain.model.table.TableStatus;

public record TableCreateRequestDTO(
    String name,
    TableStatus status
) {

}
