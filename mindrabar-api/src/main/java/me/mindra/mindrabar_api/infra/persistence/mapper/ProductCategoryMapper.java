package me.mindra.mindrabar_api.infra.persistence.mapper;

import me.mindra.mindrabar_api.domain.model.product.ProductCategory;
import me.mindra.mindrabar_api.infra.persistence.entity.ProductCategoryEntity;

public class ProductCategoryMapper {

    public static ProductCategoryEntity toEntity(ProductCategory domain) {
        return new ProductCategoryEntity(
            domain.getId(),
            CompanyMapper.toEntity(domain.getCompany()),
            domain.getName(),
            domain.getCreatedAt(),
            domain.getUpdatedAt()
        );
    }

    public static ProductCategory toDomain(ProductCategoryEntity entity) {
        return new ProductCategory(
            entity.getId(),
            CompanyMapper.toDomain(entity.getCompany()),
            entity.getName(),
            entity.getCreatedAt(),
            entity.getUpdatedAt()
        );
    }
}
