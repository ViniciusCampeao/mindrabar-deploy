package me.mindra.mindrabar_api.domain.service;

import java.util.List;

import me.mindra.mindrabar_api.domain.model.company.Company;
import me.mindra.mindrabar_api.domain.model.table.Table;
import me.mindra.mindrabar_api.domain.model.table.TableStatus;
import me.mindra.mindrabar_api.domain.repository.TableRepository;
import me.mindra.mindrabar_api.exception.ErrorCode;
import me.mindra.mindrabar_api.exception.MindrabarException;

public class TableService {

    private final TableRepository tableRepository;

    public TableService(TableRepository tableRepository) {
        this.tableRepository = tableRepository;
    }

    public Table create(Table table) {
        if (table.getCompany() == null || table.getCompany().getId() == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Mesa deve pertencer a uma Empresa existente");
        }
        if(tableRepository.findByName(table.getName()).isPresent()) {
            throw new MindrabarException(ErrorCode.DUPLICATE_ENTITY, "Nome de mesa já existe");
        }

        return tableRepository.save(table);
    }

    public Table updateName(Long id, String name) {
        if(name == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Nome não pode ser nulo");
        }
        if(tableRepository.findByName(name).isPresent()) {
            throw new MindrabarException(ErrorCode.DUPLICATE_ENTITY, "Nome de mesa já existe");
        }

        Table table = findById(id);
        table.updateName(name);
        return tableRepository.save(table);
    }

    public Table updateStatus(Long id, TableStatus status) {
        if(status == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Status não pode ser nulo");
        }

        Table table = findById(id);
        table.updateStatus(status);
        return tableRepository.save(table);
    }
    
    public List<Table> findAll() {
        return tableRepository.findAll();
    }

    public Table findById(Long id) {
        return tableRepository.findById(id).orElseThrow(() -> new MindrabarException(ErrorCode.TABLE_NOT_FOUND, "Mesa não encontrada"));
    }

    public Table findByName(String name) {
        return tableRepository.findByName(name).orElseThrow(() -> new MindrabarException(ErrorCode.TABLE_NOT_FOUND, "Mesa não encontrada"));
    }

    public Table findByQrToken(String qrToken) {
        return tableRepository.findByQrToken(qrToken).orElseThrow(() -> new MindrabarException(ErrorCode.TABLE_NOT_FOUND, "Mesa não encontrada"));
    }

    public List<Table> findByStatus(TableStatus status) {
        List<Table> tables = tableRepository.findByStatus(status);
        if(tables.isEmpty()) {
            throw new MindrabarException(ErrorCode.TABLE_NOT_FOUND, "Nenhuma mesa encontrada com este status");
        }
        return tables;
    }

    public void deleteById(Long id) {
        tableRepository.deleteById(id);
    }

    public List<Table> findByCompany(Company company) {
        List<Table> tables = tableRepository.findByCompany(company);
        if(tables.isEmpty()) {
            throw new MindrabarException(ErrorCode.TABLE_NOT_FOUND, "Nenhuma mesa encontrada para esta empresa");
        }
        return tables;
    }

}
