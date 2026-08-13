package me.mindra.mindrabar_api.infra.persistence.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import me.mindra.mindrabar_api.infra.persistence.entity.CompanyEntity;

public interface CompanyJpaRepository extends JpaRepository<CompanyEntity, Long> {
    Optional<CompanyEntity> findByName(String name);
    List<CompanyEntity> findByProduct(String product);
    List<CompanyEntity> findByPlan(String plan);
}
