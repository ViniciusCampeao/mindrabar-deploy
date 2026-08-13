package me.mindra.mindrabar_api.application.dto.product;

import java.math.BigDecimal;

public record ProductResponseDTO(
    Long id,
    Long companyId,
    String name,
    BigDecimal costPrice,
    BigDecimal salePrice,
    int stockQuantity
) {
    
}
