package me.mindra.mindrabar_api.infra.persistence.repository.impl;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Component;

import me.mindra.mindrabar_api.domain.model.company.Company;
import me.mindra.mindrabar_api.domain.model.product.ProductCategory;
import me.mindra.mindrabar_api.domain.repository.ProductCategoryRepository;
import me.mindra.mindrabar_api.exception.ErrorCode;
import me.mindra.mindrabar_api.exception.MindrabarException;
import me.mindra.mindrabar_api.infra.persistence.mapper.CompanyMapper;
import me.mindra.mindrabar_api.infra.persistence.mapper.ProductCategoryMapper;
import me.mindra.mindrabar_api.infra.persistence.repository.ProductCategoryJpaRepository;

@Component
public class ProductCategoryRepositoryImpl implements ProductCategoryRepository {

    private final ProductCategoryJpaRepository repository;

    public ProductCategoryRepositoryImpl(ProductCategoryJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    public Optional<ProductCategory> findById(Long id) {
        return repository.findById(id)
            .map(ProductCategoryMapper::toDomain);
    }

    @Override
    public List<ProductCategory> findByCompany(Company company) {
        return repository.findByCompany(CompanyMapper.toEntity(company))
            .stream()
            .map(ProductCategoryMapper::toDomain)
            .collect(Collectors.toList());
    }

    @Override
    public ProductCategory save(ProductCategory category) {
        try {
            return ProductCategoryMapper.toDomain(repository.save(ProductCategoryMapper.toEntity(category)));
        } catch (DataIntegrityViolationException e) {
            throw new MindrabarException(ErrorCode.DUPLICATE_ENTITY, "Já existe uma categoria com esse nome");
        }
    }

    @Override
    public void deleteById(Long id) {
        try {
            repository.deleteById(id);
        } catch (DataIntegrityViolationException e) {
            throw new MindrabarException(ErrorCode.BUSINESS_RULE_VIOLATION, "Não é possível excluir uma categoria com produtos associados. Remova a categoria dos produtos primeiro.");
        }
    }
}
