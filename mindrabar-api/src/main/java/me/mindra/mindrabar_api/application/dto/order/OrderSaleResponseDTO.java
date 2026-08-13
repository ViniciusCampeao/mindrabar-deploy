package me.mindra.mindrabar_api.application.dto.order;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderSaleResponseDTO(
    Long orderId,
    List<OrderItemDTO> items,
    BigDecimal totalOrderValue,
    LocalDateTime createdAt
) {
    public record OrderItemDTO(
        Long productId,
        String productName,
        BigDecimal productPrice,
        Integer quantity,
        BigDecimal itemTotalValue
    ) {}
}
