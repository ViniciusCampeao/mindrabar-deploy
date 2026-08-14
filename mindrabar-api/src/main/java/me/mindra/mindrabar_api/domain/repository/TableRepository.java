package me.mindra.mindrabar_api.domain.repository;

import java.util.List;
import java.util.Optional;

import me.mindra.mindrabar_api.domain.model.company.Company;
import me.mindra.mindrabar_api.domain.model.table.Table;
import me.mindra.mindrabar_api.domain.model.table.TableStatus;

public interface TableRepository {
    
    List<Table> findAll();
    Optional<Table> findById(Long id);
    Optional<Table> findByName(String name);
    Optional<Table> findByQrToken(String qrToken);
    List<Table> findByStatus(TableStatus status);
    Table save(Table table);
    void deleteById(Long id);
    List<Table> findByCompany(Company company);
}
