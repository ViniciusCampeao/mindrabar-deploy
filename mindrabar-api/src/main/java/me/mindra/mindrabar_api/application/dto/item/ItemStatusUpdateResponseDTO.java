package me.mindra.mindrabar_api.application.dto.item;

import me.mindra.mindrabar_api.domain.model.item.Item;
import me.mindra.mindrabar_api.domain.model.item.ItemStatus;

public record ItemStatusUpdateResponseDTO(
    Long itemId,
    ItemStatus status
) {
    public ItemStatusUpdateResponseDTO(Item item) {
        this(
            item.getId(),
            item.getStatus()
        );
    }
}
