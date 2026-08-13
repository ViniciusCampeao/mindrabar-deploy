package me.mindra.mindrabar_api.application.dto.product;

import java.math.BigDecimal;

public record ProductPriceUpdateResponseDTO(
    Long productId,
    BigDecimal price
) {
}
