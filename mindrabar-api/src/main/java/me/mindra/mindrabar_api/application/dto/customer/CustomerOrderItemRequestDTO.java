package me.mindra.mindrabar_api.application.dto.customer;

public record CustomerOrderItemRequestDTO(
    Long productId,
    int quantity
) {
}
