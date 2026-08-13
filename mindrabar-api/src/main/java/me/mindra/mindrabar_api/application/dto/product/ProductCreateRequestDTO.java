package me.mindra.mindrabar_api.application.dto.product;

import java.math.BigDecimal;

import me.mindra.mindrabar_api.domain.model.company.Company;
import me.mindra.mindrabar_api.domain.model.product.Product;

public record ProductCreateRequestDTO(
    String name,
    BigDecimal costPrice,
    BigDecimal salePrice,
    Integer stockQuantity
) {
    public Product toDomain(Company company) {
        return new Product(company, name, costPrice, salePrice, stockQuantity);
    } 
}
