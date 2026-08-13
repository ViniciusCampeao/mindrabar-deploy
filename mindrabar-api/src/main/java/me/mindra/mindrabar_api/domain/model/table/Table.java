package me.mindra.mindrabar_api.domain.model.table;

import java.time.LocalDateTime;

import me.mindra.mindrabar_api.domain.model.company.Company;
import me.mindra.mindrabar_api.exception.ErrorCode;
import me.mindra.mindrabar_api.exception.MindrabarException;

public class Table {
    
    private Long id;
    private Company company;
    private String name;
    private TableStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public Table(Long id, Company company, String name, TableStatus status, LocalDateTime createdAt,
            LocalDateTime updatedAt) {

        if(company == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Empresa não pode ser nula");
        }
        if(name == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Nome não pode ser nulo");
        }

        this.id = id;
        this.company = company;
        this.name = name;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Table(Company company, String name, TableStatus status) {
        if(company == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Empresa não pode ser nula");
        }
        if(name == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Nome não pode ser nulo");
        }
        if(status == null) {
            status = TableStatus.AVAILABLE;
        }

        this.company = company;
        this.name = name;
        this.status = status;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public void updateName(String name) {
        if(name == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Nome não pode ser nulo");
        }
        this.name = name;
    }

    public void updateStatus(TableStatus newStatus) {
    if (newStatus == null) {
        throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Status não pode ser nulo");
    }

    if (this.status == TableStatus.OCCUPIED && newStatus == TableStatus.RESERVED) {
        throw new MindrabarException(ErrorCode.INVALID_STATUS_TRANSITION, "Não é possível reservar uma mesa que já está ocupada");
    }

    if (this.status == newStatus) {
        return; 
    }

    this.status = newStatus;
    this.updatedAt = LocalDateTime.now();
}

    public Long getId() {
        return id;
    }

    public Company getCompany() {
        return company;
    }

    public String getName() {
        return name;
    }

    public TableStatus getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    
}
