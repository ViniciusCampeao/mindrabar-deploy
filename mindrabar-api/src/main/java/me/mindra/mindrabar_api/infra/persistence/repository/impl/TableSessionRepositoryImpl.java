package me.mindra.mindrabar_api.infra.persistence.repository.impl;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import me.mindra.mindrabar_api.domain.model.customer.TableSession;
import me.mindra.mindrabar_api.domain.model.customer.TableSessionStatus;
import me.mindra.mindrabar_api.domain.model.table.Table;
import me.mindra.mindrabar_api.domain.repository.TableSessionRepository;
import me.mindra.mindrabar_api.infra.persistence.mapper.TableMapper;
import me.mindra.mindrabar_api.infra.persistence.mapper.TableSessionMapper;
import me.mindra.mindrabar_api.infra.persistence.repository.TableSessionJpaRepository;

@Component
public class TableSessionRepositoryImpl implements TableSessionRepository {

    private final TableSessionJpaRepository repository;

    public TableSessionRepositoryImpl(TableSessionJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    public TableSession save(TableSession tableSession) {
        return TableSessionMapper.toDomain(repository.save(TableSessionMapper.toEntity(tableSession)));
    }

    @Override
    public Optional<TableSession> findById(Long id) {
        return repository.findById(id).map(TableSessionMapper::toDomain);
    }

    @Override
    public Optional<TableSession> findBySessionToken(String sessionToken) {
        return repository.findBySessionToken(sessionToken).map(TableSessionMapper::toDomain);
    }

    @Override
    public List<TableSession> findByStatusAndCompanyId(TableSessionStatus status, Long companyId) {
        return repository.findByStatusAndTable_Company_Id(status, companyId).stream()
            .map(TableSessionMapper::toDomain)
            .collect(Collectors.toList());
    }

    @Override
    public long countByStatusAndCompanyId(TableSessionStatus status, Long companyId) {
        return repository.countByStatusAndTable_Company_Id(status, companyId);
    }

    @Override
    public List<TableSession> findByTable(Table table) {
        return repository.findByTable(TableMapper.toEntity(table)).stream()
            .map(TableSessionMapper::toDomain)
            .collect(Collectors.toList());
    }
}
