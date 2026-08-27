package me.mindra.mindrabar_api.application.service;

import java.util.List;

import me.mindra.mindrabar_api.application.dto.productcategory.ProductCategoryCreateRequestDTO;
import me.mindra.mindrabar_api.application.dto.productcategory.ProductCategoryResponseDTO;
import me.mindra.mindrabar_api.application.dto.productcategory.ProductCategoryUpdateRequestDTO;
import me.mindra.mindrabar_api.application.port.in.ManageProductCategoryUseCase;
import me.mindra.mindrabar_api.domain.model.company.Company;
import me.mindra.mindrabar_api.domain.model.product.ProductCategory;
import me.mindra.mindrabar_api.domain.service.CompanyService;
import me.mindra.mindrabar_api.domain.service.ProductCategoryService;

public class ManageProductCategoryUseCaseImpl implements ManageProductCategoryUseCase {

    private final ProductCategoryService productCategoryService;
    private final CompanyService companyService;

    public ManageProductCategoryUseCaseImpl(ProductCategoryService productCategoryService, CompanyService companyService) {
        this.productCategoryService = productCategoryService;
        this.companyService = companyService;
    }

    @Override
    public ProductCategoryResponseDTO create(Long companyId, ProductCategoryCreateRequestDTO request) {
        Company company = companyService.findById(companyId);
        ProductCategory created = productCategoryService.create(request.toDomain(company));
        return toDto(created);
    }

    @Override
    public ProductCategoryResponseDTO update(Long categoryId, ProductCategoryUpdateRequestDTO request) {
        ProductCategory updated = productCategoryService.update(categoryId, request.name());
        return toDto(updated);
    }

    @Override
    public void delete(Long categoryId) {
        productCategoryService.deleteById(categoryId);
    }

    @Override
    public List<ProductCategoryResponseDTO> findByCompany(Long companyId) {
        Company company = companyService.findById(companyId);
        return productCategoryService.findByCompany(company).stream().map(this::toDto).toList();
    }

    private ProductCategoryResponseDTO toDto(ProductCategory category) {
        return new ProductCategoryResponseDTO(
            category.getId(),
            category.getCompany().getId(),
            category.getName()
        );
    }
}
