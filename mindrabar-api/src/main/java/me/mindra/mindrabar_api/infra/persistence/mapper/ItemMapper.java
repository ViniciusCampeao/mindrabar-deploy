package me.mindra.mindrabar_api.infra.persistence.mapper;

import me.mindra.mindrabar_api.domain.model.customer.TableSession;
import me.mindra.mindrabar_api.domain.model.item.Item;
import me.mindra.mindrabar_api.domain.model.user.User;
import me.mindra.mindrabar_api.infra.persistence.entity.ItemEntity;
import me.mindra.mindrabar_api.infra.persistence.entity.TableSessionEntity;
import me.mindra.mindrabar_api.infra.persistence.entity.UserEntity;

public class ItemMapper {
    public static ItemEntity toEntity(Item domain) {
        UserEntity userEntity = domain.getUser() != null ? UserMapper.toEntity(domain.getUser()) : null;
        TableSessionEntity tableSessionEntity = domain.getTableSession() != null ? TableSessionMapper.toEntity(domain.getTableSession()) : null;

        return new ItemEntity(
            domain.getId(),
            userEntity,
            tableSessionEntity,
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
        User user = entity.getUser() != null ? UserMapper.toDomain(entity.getUser()) : null;
        TableSession tableSession = entity.getTableSession() != null ? TableSessionMapper.toDomain(entity.getTableSession()) : null;

        if (user != null) {
            return new Item(
                entity.getId(),
                user,
                OrderMapper.toDomain(entity.getOrder()),
                ProductMapper.toDomain(entity.getProduct()),
                entity.getQuantity(),
                entity.getQuantityPaid(),
                entity.getStatus(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
            );
        }

        return new Item(
            entity.getId(),
            tableSession,
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
