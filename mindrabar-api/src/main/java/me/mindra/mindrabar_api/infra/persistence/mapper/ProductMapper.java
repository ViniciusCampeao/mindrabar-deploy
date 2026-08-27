package me.mindra.mindrabar_api.infra.persistence.mapper;

import me.mindra.mindrabar_api.domain.model.product.Product;
import me.mindra.mindrabar_api.domain.model.product.ProductCategory;
import me.mindra.mindrabar_api.infra.persistence.entity.ProductCategoryEntity;
import me.mindra.mindrabar_api.infra.persistence.entity.ProductEntity;

public class ProductMapper {

    public static ProductEntity toEntity(Product domain) {
        ProductCategoryEntity categoryEntity = domain.getCategory() != null
            ? ProductCategoryMapper.toEntity(domain.getCategory())
            : null;

        return new ProductEntity(
            domain.getId(),
            CompanyMapper.toEntity(domain.getCompany()),
            domain.getName(),
            domain.getCostPrice(),
            domain.getSalePrice(),
            domain.getStockQuantity(),
            categoryEntity,
            domain.getCreatedAt(),
            domain.getUpdatedAt()
        );
    }

    public static Product toDomain(ProductEntity entity) {
        ProductCategory category = entity.getCategory() != null
            ? ProductCategoryMapper.toDomain(entity.getCategory())
            : null;

        return new Product(
            entity.getId(),
            CompanyMapper.toDomain(entity.getCompany()),
            entity.getName(),
            entity.getCostPrice(),
            entity.getSalePrice(),
            entity.getStockQuantity(),
            category,
            entity.getCreatedAt(),
            entity.getUpdatedAt()
        );
    }
}
