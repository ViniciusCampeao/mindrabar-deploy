package me.mindra.mindrabar_api.application.dto.customer;

import java.math.BigDecimal;

public record BillItemDTO(
    String productName,
    int quantity,
    BigDecimal unitPrice,
    BigDecimal subtotal,
    String orderedBy
) {
}
