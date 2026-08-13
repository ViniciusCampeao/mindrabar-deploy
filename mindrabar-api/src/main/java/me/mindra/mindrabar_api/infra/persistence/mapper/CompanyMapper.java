package me.mindra.mindrabar_api.infra.persistence.mapper;

import me.mindra.mindrabar_api.domain.model.company.Company;
import me.mindra.mindrabar_api.infra.persistence.entity.CompanyEntity;

public class CompanyMapper {
    
    public static CompanyEntity toEntity(Company domain) {
        return new CompanyEntity(
            domain.getId(),
            domain.getName(),
            domain.getDescription(),
            domain.getProduct(),
            domain.getPlan(),
            domain.getCnpj(),
            domain.getCreatedAt(),
            domain.getUpdatedAt()
        );
    }

    public static Company toDomain(CompanyEntity entity) {
        return new Company(
            entity.getId(),
            entity.getName(),
            entity.getDescription(),
            entity.getProduct(),
            entity.getPlan(),
            entity.getCnpj(),
            entity.getCreatedAt(),
            entity.getUpdatedAt()
        );
    }
}
