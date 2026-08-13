package me.mindra.mindrabar_api.domain.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import me.mindra.mindrabar_api.domain.model.company.Company;
import me.mindra.mindrabar_api.domain.model.product.Product;

public interface ProductRepository {

    List<Product> findAll();
    List<Product> findByCompany(Company company);
    List<Product> findByCostPrice(BigDecimal costPrice);
    List<Product> findBySalePrice(BigDecimal salePrice);
    List<Product> findByStockQuantity(int stockQuantity);
    Optional<Product> findByName(String name);
    Optional<Product> findById(Long id);
    Product save(Product product);
    void deleteById(Long id);
}
