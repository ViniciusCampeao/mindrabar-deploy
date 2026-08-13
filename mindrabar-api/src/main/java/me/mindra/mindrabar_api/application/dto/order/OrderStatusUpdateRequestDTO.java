package me.mindra.mindrabar_api.application.dto.order;

import me.mindra.mindrabar_api.domain.model.order.OrderStatus;

public record OrderStatusUpdateRequestDTO(
    Long id,
    OrderStatus status
) {

}
