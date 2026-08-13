package me.mindra.mindrabar_api.application.dto.item;

import me.mindra.mindrabar_api.domain.model.item.ItemStatus;

public record ItemStatusUpdateRequestDTO(
    Long itemId,
    ItemStatus status
) {
}
