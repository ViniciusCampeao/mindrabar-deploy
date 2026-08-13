package me.mindra.mindrabar_api.infra.persistence.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import me.mindra.mindrabar_api.infra.persistence.entity.CompanyEntity;
import me.mindra.mindrabar_api.infra.persistence.entity.ProductEntity;

public interface ProductJpaRepository extends JpaRepository<ProductEntity, Long> {
    List<ProductEntity> findByCompany(CompanyEntity company);
    List<ProductEntity> findByCostPrice(BigDecimal costPrice);
    List<ProductEntity> findBySalePrice(BigDecimal salePrice);
    List<ProductEntity> findByStockQuantity(int stockQuantity);
    Optional<ProductEntity> findByName(String name);
}
