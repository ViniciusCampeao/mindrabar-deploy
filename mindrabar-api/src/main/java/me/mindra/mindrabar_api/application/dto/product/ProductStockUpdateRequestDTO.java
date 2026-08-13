package me.mindra.mindrabar_api.application.dto.product;

public record ProductStockUpdateRequestDTO(
    Long productId,
    int stockQuantity
) {

}
