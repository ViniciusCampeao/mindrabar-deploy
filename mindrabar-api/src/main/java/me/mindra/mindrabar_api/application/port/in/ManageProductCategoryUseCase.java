package me.mindra.mindrabar_api.application.port.in;

import java.util.List;

import me.mindra.mindrabar_api.application.dto.productcategory.ProductCategoryCreateRequestDTO;
import me.mindra.mindrabar_api.application.dto.productcategory.ProductCategoryResponseDTO;
import me.mindra.mindrabar_api.application.dto.productcategory.ProductCategoryUpdateRequestDTO;

public interface ManageProductCategoryUseCase {
    ProductCategoryResponseDTO create(Long companyId, ProductCategoryCreateRequestDTO request);
    ProductCategoryResponseDTO update(Long categoryId, ProductCategoryUpdateRequestDTO request);
    void delete(Long categoryId);
    List<ProductCategoryResponseDTO> findByCompany(Long companyId);
}
