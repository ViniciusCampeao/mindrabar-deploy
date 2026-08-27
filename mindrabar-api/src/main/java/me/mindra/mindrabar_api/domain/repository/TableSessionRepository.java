package me.mindra.mindrabar_api.domain.repository;

import java.util.List;
import java.util.Optional;

import me.mindra.mindrabar_api.domain.model.customer.TableSession;
import me.mindra.mindrabar_api.domain.model.customer.TableSessionStatus;
import me.mindra.mindrabar_api.domain.model.table.Table;

public interface TableSessionRepository {
    TableSession save(TableSession tableSession);
    Optional<TableSession> findById(Long id);
    Optional<TableSession> findBySessionToken(String sessionToken);
    List<TableSession> findByStatusAndCompanyId(TableSessionStatus status, Long companyId);
    long countByStatusAndCompanyId(TableSessionStatus status, Long companyId);
    List<TableSession> findByTable(Table table);
}
