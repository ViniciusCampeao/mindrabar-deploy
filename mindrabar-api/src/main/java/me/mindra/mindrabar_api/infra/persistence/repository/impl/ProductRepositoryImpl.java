package me.mindra.mindrabar_api.infra.persistence.repository.impl;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import me.mindra.mindrabar_api.domain.model.company.Company;
import me.mindra.mindrabar_api.domain.model.product.Product;
import me.mindra.mindrabar_api.domain.repository.ProductRepository;
import me.mindra.mindrabar_api.infra.persistence.mapper.CompanyMapper;
import me.mindra.mindrabar_api.infra.persistence.mapper.ProductMapper;
import me.mindra.mindrabar_api.infra.persistence.repository.ProductJpaRepository;

@Component
public class ProductRepositoryImpl implements ProductRepository {

    private final ProductJpaRepository repository;

    public ProductRepositoryImpl(ProductJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<Product> findAll() {
        return repository.findAll().stream().map(ProductMapper::toDomain).collect(Collectors.toList());
    }

    @Override
    public List<Product> findByCompany(Company company) {

        return repository.findByCompany(CompanyMapper.toEntity(company))
            .stream()
            .map(ProductMapper::toDomain)
            .collect(Collectors.toList());
    }

    @Override
    public List<Product> findByCostPrice(BigDecimal costPrice) {
        return repository.findByCostPrice(costPrice)
            .stream()
            .map(ProductMapper::toDomain)
            .collect(Collectors.toList());
    }

    @Override
    public List<Product> findBySalePrice(BigDecimal salePrice) {
        return repository.findBySalePrice(salePrice)
            .stream()
            .map(ProductMapper::toDomain)
            .collect(Collectors.toList());
    }

    @Override
    public List<Product> findByStockQuantity(int stockQuantity) {
        return repository.findByStockQuantity(stockQuantity)
            .stream()
            .map(ProductMapper::toDomain)
            .collect(Collectors.toList());
    }

    @Override
    public Optional<Product> findByName(String name) {
        return repository.findByName(name)
            .map(ProductMapper::toDomain);
    }

    @Override
    public Optional<Product> findById(Long id) {
        return repository.findById(id)
            .map(ProductMapper::toDomain);
    }

    @Override
    public Product save(Product product) {
        return ProductMapper.toDomain(repository.save(ProductMapper.toEntity(product)));
    }

    @Override
    public void deleteById(Long id) {
        repository.deleteById(id);
    }

}
