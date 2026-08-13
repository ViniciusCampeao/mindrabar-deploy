package me.mindra.mindrabar_api.infra.persistence.mapper;

import me.mindra.mindrabar_api.domain.model.item.Item;
import me.mindra.mindrabar_api.infra.persistence.entity.ItemEntity;

public class ItemMapper {
    public static ItemEntity toEntity(Item domain) {
        return new ItemEntity(
            domain.getId(),
            UserMapper.toEntity(domain.getUser()),
            OrderMapper.toEntity(domain.getOrder()),
            ProductMapper.toEntity(domain.getProduct()),
            domain.getQuantity(),
            domain.getQuantityPaid(),
            domain.getStatus(),
            domain.getCreatedAt(),
            domain.getUpdatedAt()
        );
    }

    public static Item toDomain(ItemEntity entity) {
        return new Item(
            entity.getId(),
            UserMapper.toDomain(entity.getUser()),
            OrderMapper.toDomain(entity.getOrder()),
            ProductMapper.toDomain(entity.getProduct()),
            entity.getQuantity(),
            entity.getQuantityPaid(),
            entity.getStatus(),
            entity.getCreatedAt(),
            entity.getUpdatedAt()
        );
    }
}
