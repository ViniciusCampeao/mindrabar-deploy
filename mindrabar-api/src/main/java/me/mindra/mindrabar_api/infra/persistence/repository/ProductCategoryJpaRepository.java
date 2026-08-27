package me.mindra.mindrabar_api.infra.persistence.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import me.mindra.mindrabar_api.infra.persistence.entity.CompanyEntity;
import me.mindra.mindrabar_api.infra.persistence.entity.ProductCategoryEntity;

public interface ProductCategoryJpaRepository extends JpaRepository<ProductCategoryEntity, Long> {
    List<ProductCategoryEntity> findByCompany(CompanyEntity company);
}
