package me.mindra.mindrabar_api.application.dto.product;

import java.math.BigDecimal;

public record ProductPriceUpdateRequestDTO(
    Long productId,
    BigDecimal price
) {

}
