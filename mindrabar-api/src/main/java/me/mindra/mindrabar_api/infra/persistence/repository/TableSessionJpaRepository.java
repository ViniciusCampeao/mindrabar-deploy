package me.mindra.mindrabar_api.infra.persistence.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import me.mindra.mindrabar_api.domain.model.customer.TableSessionStatus;
import me.mindra.mindrabar_api.infra.persistence.entity.TableEntity;
import me.mindra.mindrabar_api.infra.persistence.entity.TableSessionEntity;

public interface TableSessionJpaRepository extends JpaRepository<TableSessionEntity, Long> {
    Optional<TableSessionEntity> findBySessionToken(String sessionToken);
    List<TableSessionEntity> findByStatusAndTable_Company_Id(TableSessionStatus status, Long companyId);
    long countByStatusAndTable_Company_Id(TableSessionStatus status, Long companyId);
    List<TableSessionEntity> findByTable(TableEntity table);
}
