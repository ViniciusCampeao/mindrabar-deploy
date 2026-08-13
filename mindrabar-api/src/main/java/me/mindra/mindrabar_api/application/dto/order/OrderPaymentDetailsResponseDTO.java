package me.mindra.mindrabar_api.application.dto.order;

import java.math.BigDecimal;
import java.util.List;

public record OrderPaymentDetailsResponseDTO(
    Long orderId,
    Long tableId,
    String tableName,
    BigDecimal totalAmount,
    BigDecimal amountPaid,
    BigDecimal amountPending,
    List<ItemPaymentDTO> items
) {
    public record ItemPaymentDTO(
        Long itemId,
        Long productId,
        String productName,
        int quantity,
        int quantityPaid,
        int quantityPending,
        BigDecimal unitPrice,
        BigDecimal totalAmount,
        BigDecimal amountPaid,
        BigDecimal amountPending
    ) {}
}
