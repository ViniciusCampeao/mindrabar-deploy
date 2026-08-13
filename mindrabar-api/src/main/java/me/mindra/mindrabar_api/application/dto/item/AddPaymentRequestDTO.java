package me.mindra.mindrabar_api.application.dto.item;

import me.mindra.mindrabar_api.domain.model.order.PaymentMethod;

public record AddPaymentRequestDTO(
    Long itemId,
    int quantityToPay,
    PaymentMethod paymentMethod
) {
}
