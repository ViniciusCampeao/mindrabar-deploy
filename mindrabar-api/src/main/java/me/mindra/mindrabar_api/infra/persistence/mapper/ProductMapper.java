package me.mindra.mindrabar_api.infra.persistence.mapper;

import me.mindra.mindrabar_api.domain.model.product.Product;
import me.mindra.mindrabar_api.infra.persistence.entity.ProductEntity;

public class ProductMapper {

    public static ProductEntity toEntity(Product domain) {
        return new ProductEntity(
            domain.getId(),
            CompanyMapper.toEntity(domain.getCompany()),
            domain.getName(),
            domain.getCostPrice(),
            domain.getSalePrice(),
            domain.getStockQuantity(),
            domain.getCreatedAt(),
            domain.getUpdatedAt()
        );
    }
    
    public static Product toDomain(ProductEntity entity) {
        return new Product(
            entity.getId(),
            CompanyMapper.toDomain(entity.getCompany()),
            entity.getName(),
            entity.getCostPrice(),
            entity.getSalePrice(),
            entity.getStockQuantity(),
            entity.getCreatedAt(),
            entity.getUpdatedAt()
        );
    }
}
