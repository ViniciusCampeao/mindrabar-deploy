package me.mindra.mindrabar_api.domain.service;

import java.util.List;

import me.mindra.mindrabar_api.domain.model.company.Company;
import me.mindra.mindrabar_api.domain.model.product.ProductCategory;
import me.mindra.mindrabar_api.domain.repository.ProductCategoryRepository;
import me.mindra.mindrabar_api.exception.ErrorCode;
import me.mindra.mindrabar_api.exception.MindrabarException;

public class ProductCategoryService {

    private final ProductCategoryRepository productCategoryRepository;

    public ProductCategoryService(ProductCategoryRepository productCategoryRepository) {
        this.productCategoryRepository = productCategoryRepository;
    }

    public ProductCategory create(ProductCategory category) {
        return productCategoryRepository.save(category);
    }

    public ProductCategory update(Long id, String name) {
        ProductCategory category = findById(id);
        category.updateName(name);
        return productCategoryRepository.save(category);
    }

    public void deleteById(Long id) {
        productCategoryRepository.deleteById(id);
    }

    public ProductCategory findById(Long id) {
        return productCategoryRepository.findById(id)
            .orElseThrow(() -> new MindrabarException(ErrorCode.PRODUCT_CATEGORY_NOT_FOUND, "Categoria de produto não encontrada"));
    }

    public List<ProductCategory> findByCompany(Company company) {
        return productCategoryRepository.findByCompany(company);
    }
}
