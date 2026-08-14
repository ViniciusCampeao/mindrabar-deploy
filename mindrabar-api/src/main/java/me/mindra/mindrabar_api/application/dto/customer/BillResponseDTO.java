package me.mindra.mindrabar_api.application.dto.customer;

import java.math.BigDecimal;
import java.util.List;

public record BillResponseDTO(
    Long tableId,
    String tableName,
    List<BillItemDTO> items,
    BigDecimal totalAmount,
    BigDecimal amountPending
) {
}
