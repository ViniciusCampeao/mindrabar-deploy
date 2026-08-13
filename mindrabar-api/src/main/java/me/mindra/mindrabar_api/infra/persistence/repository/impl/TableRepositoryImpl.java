package me.mindra.mindrabar_api.infra.persistence.repository.impl;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import me.mindra.mindrabar_api.domain.model.company.Company;
import me.mindra.mindrabar_api.domain.model.table.Table;
import me.mindra.mindrabar_api.domain.model.table.TableStatus;
import me.mindra.mindrabar_api.domain.repository.TableRepository;
import me.mindra.mindrabar_api.infra.persistence.mapper.CompanyMapper;
import me.mindra.mindrabar_api.infra.persistence.mapper.TableMapper;
import me.mindra.mindrabar_api.infra.persistence.repository.TableJpaRepository;

@Component
public class TableRepositoryImpl implements TableRepository {

    private TableJpaRepository repository;

    public TableRepositoryImpl(TableJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<Table> findAll() {
        return repository.findAll().stream().map(TableMapper::toDomain).collect(Collectors.toList());
    }

    @Override
    public Optional<Table> findById(Long id) {
        return repository.findById(id).map(TableMapper::toDomain);
    }

    @Override
    public Optional<Table> findByName(String name) {
        return repository.findByName(name).map(TableMapper::toDomain);
    }

    @Override
    public List<Table> findByStatus(TableStatus status) {
        return repository.findByStatus(status).stream().map(TableMapper::toDomain).collect(Collectors.toList());
    }

    @Override
    public Table save(Table table) {
        return TableMapper.toDomain(repository.save(TableMapper.toEntity(table)));
    }

    @Override
    public void deleteById(Long id) {
        repository.deleteById(id);
    }

    @Override
    public List<Table> findByCompany(Company company) {
        return repository.findByCompany(CompanyMapper.toEntity(company))
            .stream()
            .map(TableMapper::toDomain)
            .collect(Collectors.toList());
    }

}
