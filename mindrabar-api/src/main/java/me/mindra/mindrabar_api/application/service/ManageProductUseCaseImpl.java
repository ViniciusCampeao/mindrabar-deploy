package me.mindra.mindrabar_api.application.service;

import java.math.BigDecimal;
import java.util.List;

import me.mindra.mindrabar_api.application.dto.product.ProductCreateRequestDTO;
import me.mindra.mindrabar_api.application.dto.product.ProductCreateResponseDTO;
import me.mindra.mindrabar_api.application.dto.product.ProductPriceUpdateRequestDTO;
import me.mindra.mindrabar_api.application.dto.product.ProductPriceUpdateResponseDTO;
import me.mindra.mindrabar_api.application.dto.product.ProductResponseDTO;
import me.mindra.mindrabar_api.application.dto.product.ProductStockUpdateRequestDTO;
import me.mindra.mindrabar_api.application.dto.product.ProductStockUpdateResponseDTO;
import me.mindra.mindrabar_api.application.port.in.ManageProductUseCase;
import me.mindra.mindrabar_api.domain.model.company.Company;
import me.mindra.mindrabar_api.domain.model.product.Product;
import me.mindra.mindrabar_api.domain.service.CompanyService;
import me.mindra.mindrabar_api.domain.service.ProductService;

public class ManageProductUseCaseImpl implements ManageProductUseCase {

    private final ProductService productService;
    private final CompanyService companyService;

    public ManageProductUseCaseImpl(ProductService productService, CompanyService companyService) {
        this.productService = productService;
        this.companyService = companyService;
    }

    @Override
    public ProductCreateResponseDTO createProduct(Long companyId, ProductCreateRequestDTO request) {
        Company company = companyService.findById(companyId);

        return new ProductCreateResponseDTO(productService.create(request.toDomain(company)).getId());
    }

    @Override
    public ProductStockUpdateResponseDTO addStock(ProductStockUpdateRequestDTO request) {
        
        Product product = productService.addStock(request.productId(), request.stockQuantity());
        return new ProductStockUpdateResponseDTO(product.getId(), product.getStockQuantity());
    }

    @Override
    public ProductStockUpdateResponseDTO removeStock(ProductStockUpdateRequestDTO request) {
        
        Product product = productService.removeStock(request.productId(), request.stockQuantity());
        return new ProductStockUpdateResponseDTO(product.getId(), product.getStockQuantity());
    }

    @Override
    public ProductPriceUpdateResponseDTO updateCostPrice(ProductPriceUpdateRequestDTO request) {
        
        Product product = productService.updateCostPrice(request.productId(), request.price());
        return new ProductPriceUpdateResponseDTO(product.getId(), product.getCostPrice());
    }

    @Override
    public ProductPriceUpdateResponseDTO updateSalePrice(ProductPriceUpdateRequestDTO request) {
        
        Product product = productService.updateSalePrice(request.productId(), request.price());
        return new ProductPriceUpdateResponseDTO(product.getId(), product.getSalePrice());
    }

    @Override
    public void deleteProduct(Long productId) {
        productService.deleteById(productId);
    }

    @Override
    public ProductResponseDTO findProductById(Long productId) {
        Product product = productService.findById(productId);
        return toDto(product);
    }

    @Override
    public ProductResponseDTO findProductByName(String name) {
        Product product = productService.findByName(name);
        return toDto(product);
    }

    @Override
    public List<ProductResponseDTO> findProductsByCompany(Long companyId) {
        Company company = companyService.findById(companyId);
        List<Product> products = productService.findByCompany(company);
        return products.stream().map(this::toDto).toList();
    }

    @Override
    public List<ProductResponseDTO> findProductsByCostPrice(BigDecimal costPrice) {
        List<Product> products = productService.findByCostPrice(costPrice);
        return products.stream().map(this::toDto).toList();
    }

    @Override
    public List<ProductResponseDTO> findProductsBySalePrice(BigDecimal salePrice) {
        List<Product> products = productService.findBySalePrice(salePrice);
        return products.stream().map(this::toDto).toList();
    }

    @Override
    public List<ProductResponseDTO> findProductsByStockQuantity(int stockQuantity) {
        List<Product> products = productService.findByStockQuantity(stockQuantity);
        return products.stream().map(this::toDto).toList();
    }

    private ProductResponseDTO toDto(Product product) {
        return new ProductResponseDTO(
            product.getId(),
            product.getCompany().getId(),
            product.getName(),
            product.getCostPrice(),
            product.getSalePrice(),
            product.getStockQuantity()
        );
    }

    @Override
    public List<ProductResponseDTO> findAll() {
        List<Product> products = productService.findAll();
        return products.stream().map(this::toDto).toList();
    }
}
