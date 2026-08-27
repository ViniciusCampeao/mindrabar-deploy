package me.mindra.mindrabar_api.domain.repository;

import java.util.List;
import java.util.Optional;

import me.mindra.mindrabar_api.domain.model.company.Company;
import me.mindra.mindrabar_api.domain.model.product.ProductCategory;

public interface ProductCategoryRepository {
    Optional<ProductCategory> findById(Long id);
    List<ProductCategory> findByCompany(Company company);
    ProductCategory save(ProductCategory category);
    void deleteById(Long id);
}
