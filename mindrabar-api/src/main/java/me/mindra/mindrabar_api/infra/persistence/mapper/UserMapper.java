package me.mindra.mindrabar_api.infra.persistence.mapper;

import me.mindra.mindrabar_api.domain.model.user.User;
import me.mindra.mindrabar_api.infra.persistence.entity.UserEntity;

public class UserMapper {
    public static UserEntity toEntity(User domain) {
        return new UserEntity(
            domain.getId(),
            CompanyMapper.toEntity(domain.getCompany()),
            domain.getEmail(),
            domain.getUsername(),
            domain.getPasswordHash(),
            domain.getRole(),
            domain.getCreatedAt(),
            domain.getUpdatedAt()
        );
    }
    public static User toDomain(UserEntity entity) {
        return new User(
            entity.getId(),
            CompanyMapper.toDomain(entity.getCompany()),
            entity.getEmail(),
            entity.getUsername(),
            entity.getPasswordHash(),
            entity.getRole(),
            entity.getCreatedAt(),
            entity.getUpdatedAt()
        );
    }
}
