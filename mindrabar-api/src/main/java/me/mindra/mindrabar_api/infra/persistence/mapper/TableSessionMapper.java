package me.mindra.mindrabar_api.infra.persistence.mapper;

import me.mindra.mindrabar_api.domain.model.customer.TableSession;
import me.mindra.mindrabar_api.domain.model.user.User;
import me.mindra.mindrabar_api.infra.persistence.entity.TableSessionEntity;
import me.mindra.mindrabar_api.infra.persistence.entity.UserEntity;

public class TableSessionMapper {

    public static TableSessionEntity toEntity(TableSession domain) {
        UserEntity confirmedByEntity = domain.getConfirmedBy() != null ? UserMapper.toEntity(domain.getConfirmedBy()) : null;
        return new TableSessionEntity(
            domain.getId(),
            TableMapper.toEntity(domain.getTable()),
            CustomerMapper.toEntity(domain.getCustomer()),
            domain.getSessionToken(),
            domain.getStatus(),
            confirmedByEntity,
            domain.getConfirmedAt(),
            domain.getCreatedAt(),
            domain.getUpdatedAt()
        );
    }

    public static TableSession toDomain(TableSessionEntity entity) {
        User confirmedBy = entity.getConfirmedBy() != null ? UserMapper.toDomain(entity.getConfirmedBy()) : null;
        return new TableSession(
            entity.getId(),
            TableMapper.toDomain(entity.getTable()),
            CustomerMapper.toDomain(entity.getCustomer()),
            entity.getSessionToken(),
            entity.getStatus(),
            confirmedBy,
            entity.getConfirmedAt(),
            entity.getCreatedAt(),
            entity.getUpdatedAt()
        );
    }
}
