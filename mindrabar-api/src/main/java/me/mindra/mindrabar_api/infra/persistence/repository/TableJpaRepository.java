package me.mindra.mindrabar_api.infra.persistence.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import me.mindra.mindrabar_api.domain.model.table.TableStatus;
import me.mindra.mindrabar_api.infra.persistence.entity.CompanyEntity;
import me.mindra.mindrabar_api.infra.persistence.entity.TableEntity;

public interface TableJpaRepository extends JpaRepository<TableEntity, Long> {
    Optional<TableEntity> findByName(String name);
    List<TableEntity> findByStatus(TableStatus status);
    List<TableEntity> findByCompany(CompanyEntity company);
}
