package me.mindra.mindrabar_api.application.dto.order;

public record OrderTableUpdateRequestDTO(
    Long orderId,
    Long newTableId
) {
}
