package me.mindra.mindrabar_api.domain.service;

import java.math.BigDecimal;
import java.util.List;

import me.mindra.mindrabar_api.domain.model.company.Company;
import me.mindra.mindrabar_api.domain.model.product.Product;
import me.mindra.mindrabar_api.domain.model.product.ProductCategory;
import me.mindra.mindrabar_api.domain.repository.ProductRepository;
import me.mindra.mindrabar_api.exception.ErrorCode;
import me.mindra.mindrabar_api.exception.MindrabarException;

public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public Product create(Product product) {
        if (product.getCompany() == null || product.getCompany().getId() == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Produto deve pertencer a uma Empresa existente");
        }
        if(productRepository.findByName(product.getName()).isPresent()) {
            throw new MindrabarException(ErrorCode.DUPLICATE_ENTITY, "Nome de produto já existe");
        }
        return productRepository.save(product);
    }

    public Product addStock(Long productId, int quantity) {

        Product product = findById(productId);

        product.addStock(quantity);
        return productRepository.save(product);
    }

    public Product removeStock(Long productId, int quantity) {

        Product product = findById(productId);

        product.removeStock(quantity);
        return productRepository.save(product);
    }

    public Product updateCostPrice(Long productId, BigDecimal costPrice) {

        Product product = findById(productId);

        product.updateCostPrice(costPrice);
        return productRepository.save(product);
    }

    public Product updateSalePrice(Long productId, BigDecimal salePrice) {
        
        Product product = findById(productId);
        
        product.updateSalePrice(salePrice);
        return productRepository.save(product);
    }

    public void deleteById(Long id) {
        productRepository.deleteById(id);
    }

    public Product updateCategory(Long productId, ProductCategory category) {

        Product product = findById(productId);

        product.updateCategory(category);
        return productRepository.save(product);
    }

    public Product findById(Long productId) {
        return productRepository.findById(productId).orElseThrow(() -> new MindrabarException(ErrorCode.PRODUCT_NOT_FOUND, "Produto não encontrado"));
    }
    
    public Product findByName(String name) {
        return productRepository.findByName(name).orElseThrow(() -> new MindrabarException(ErrorCode.PRODUCT_NOT_FOUND, "Produto não encontrado"));
    }

    public List<Product> findAll() {
        List<Product> products = productRepository.findAll();
        if (products.isEmpty()) {
            throw new MindrabarException(ErrorCode.PRODUCT_NOT_FOUND, "Nenhum produto encontrado");
        }
        return products;
    }

    public List<Product> findByCompany(Company company) {
        List<Product> products = productRepository.findByCompany(company);
        if (products.isEmpty()) {
            throw new MindrabarException(ErrorCode.PRODUCT_NOT_FOUND, "Nenhum produto encontrado para esta empresa");
        }
        return products;
    }

    public List<Product> findByCostPrice(BigDecimal costPrice) {
        List<Product> products = productRepository.findByCostPrice(costPrice);
        if (products.isEmpty()) {
            throw new MindrabarException(ErrorCode.PRODUCT_NOT_FOUND, "Nenhum produto encontrado com preço de custo: " + costPrice);
        }
        return products;
    }

    public List<Product> findBySalePrice(BigDecimal salePrice) {
        List<Product> products = productRepository.findBySalePrice(salePrice);
        if (products.isEmpty()) {
            throw new MindrabarException(ErrorCode.PRODUCT_NOT_FOUND, "Nenhum produto encontrado com preço de venda: " + salePrice);
        }
        return products;
    }

    public List<Product> findByStockQuantity(int stockQuantity) {
        List<Product> products = productRepository.findByStockQuantity(stockQuantity);
        if (products.isEmpty()) {
            throw new MindrabarException(ErrorCode.PRODUCT_NOT_FOUND, "Nenhum produto encontrado com quantidade em estoque: " + stockQuantity);
        }
        return products;
    }
}
