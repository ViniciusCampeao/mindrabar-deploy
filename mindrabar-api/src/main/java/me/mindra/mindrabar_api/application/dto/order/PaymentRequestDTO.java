package me.mindra.mindrabar_api.application.dto.order;

import java.math.BigDecimal;

import me.mindra.mindrabar_api.domain.model.order.PaymentMethod;

public record PaymentRequestDTO(
    Long id, 
    PaymentMethod paymentMethod, 
    BigDecimal amount
) {

}