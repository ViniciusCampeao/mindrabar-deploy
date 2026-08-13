package me.mindra.mindrabar_api.infra.persistence.mapper;

import me.mindra.mindrabar_api.domain.model.order.Order;
import me.mindra.mindrabar_api.infra.persistence.entity.OrderEntity;

public class OrderMapper {

    public static OrderEntity toEntity(Order domain) {
        return new OrderEntity(
            domain.getId(),
            TableMapper.toEntity(domain.getTable()),
            domain.getStatus(),
            domain.getPaymentMethod(),
            domain.getTotalAmount(),
            domain.getAmountPending(),
            domain.getCreatedAt(),
            domain.getUpdatedAt()
        );
    }

    public static Order toDomain(OrderEntity entity) {
        return new Order(
            entity.getId(),
            TableMapper.toDomain(entity.getTable()),
            entity.getStatus(),
            entity.getPaymentMethod(),
            entity.getTotalAmount(),
            entity.getAmountPending(),
            entity.getCreatedAt(),
            entity.getUpdatedAt()
        );
    }
}
