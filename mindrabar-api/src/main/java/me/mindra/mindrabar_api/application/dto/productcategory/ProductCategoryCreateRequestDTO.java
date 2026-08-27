package me.mindra.mindrabar_api.application.dto.productcategory;

import me.mindra.mindrabar_api.domain.model.company.Company;
import me.mindra.mindrabar_api.domain.model.product.ProductCategory;

public record ProductCategoryCreateRequestDTO(
    String name
) {
    public ProductCategory toDomain(Company company) {
        return new ProductCategory(company, name);
    }
}
