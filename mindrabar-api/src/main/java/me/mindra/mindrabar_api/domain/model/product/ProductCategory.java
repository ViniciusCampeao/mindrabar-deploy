package me.mindra.mindrabar_api.domain.model.product;

import java.time.LocalDateTime;

import me.mindra.mindrabar_api.domain.model.company.Company;
import me.mindra.mindrabar_api.exception.ErrorCode;
import me.mindra.mindrabar_api.exception.MindrabarException;

public class ProductCategory {

    private Long id;
    private Company company;
    private String name;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ProductCategory(Long id, Company company, String name, LocalDateTime createdAt, LocalDateTime updatedAt) {
        if(company == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Empresa não pode ser nula");
        }
        if(name == null || name.isBlank()) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Nome não pode ser nulo");
        }

        this.id = id;
        this.company = company;
        this.name = name;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public ProductCategory(Company company, String name) {
        if(company == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Empresa não pode ser nula");
        }
        if(name == null || name.isBlank()) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Nome não pode ser nulo");
        }

        this.company = company;
        this.name = name;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public void updateName(String name) {
        if(name == null || name.isBlank()) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Nome não pode ser nulo");
        }
        this.name = name;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
