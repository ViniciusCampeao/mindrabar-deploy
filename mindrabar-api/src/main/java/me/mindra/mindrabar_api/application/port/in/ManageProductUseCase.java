package me.mindra.mindrabar_api.application.port.in;

import java.math.BigDecimal;
import java.util.List;

import me.mindra.mindrabar_api.application.dto.product.ProductCategoryAssignRequestDTO;
import me.mindra.mindrabar_api.application.dto.product.ProductCreateRequestDTO;
import me.mindra.mindrabar_api.application.dto.product.ProductCreateResponseDTO;
import me.mindra.mindrabar_api.application.dto.product.ProductPriceUpdateRequestDTO;
import me.mindra.mindrabar_api.application.dto.product.ProductPriceUpdateResponseDTO;
import me.mindra.mindrabar_api.application.dto.product.ProductResponseDTO;
import me.mindra.mindrabar_api.application.dto.product.ProductStockUpdateRequestDTO;
import me.mindra.mindrabar_api.application.dto.product.ProductStockUpdateResponseDTO;

public interface ManageProductUseCase {
    ProductCreateResponseDTO createProduct(Long companyId, ProductCreateRequestDTO request);
    ProductStockUpdateResponseDTO addStock(ProductStockUpdateRequestDTO request);
    ProductStockUpdateResponseDTO removeStock(ProductStockUpdateRequestDTO request);
    ProductPriceUpdateResponseDTO  updateCostPrice(ProductPriceUpdateRequestDTO request);
    ProductPriceUpdateResponseDTO  updateSalePrice(ProductPriceUpdateRequestDTO request);
    ProductResponseDTO updateCategory(Long productId, ProductCategoryAssignRequestDTO request);
    void deleteProduct(Long productId);

    ProductResponseDTO findProductById(Long productId);
    ProductResponseDTO findProductByName(String name);
    List<ProductResponseDTO> findAll();
    List<ProductResponseDTO> findProductsByCompany(Long companyId);
    List<ProductResponseDTO> findProductsByCostPrice(BigDecimal costPrice);
    List<ProductResponseDTO> findProductsBySalePrice(BigDecimal salePrice);
    List<ProductResponseDTO> findProductsByStockQuantity(int stockQuantity);
}
    