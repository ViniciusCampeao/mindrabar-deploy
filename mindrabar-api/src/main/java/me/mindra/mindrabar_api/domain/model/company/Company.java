package me.mindra.mindrabar_api.domain.model.company;

import java.time.LocalDateTime;

import me.mindra.mindrabar_api.exception.ErrorCode;
import me.mindra.mindrabar_api.exception.MindrabarException;

public class Company {

    private Long id;
    private String name;
    private String description;
    private ProductType product;
    private SubscriptionPlan plan;
    private String cnpj;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Company(Long id, String name, String description, ProductType product, SubscriptionPlan plan, String cnpj, LocalDateTime createdAt,
            LocalDateTime updatedAt) {
        if(name == null || name.isEmpty()) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Nome não pode ser nulo ou vazio");
        }
        if(product == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Tipo de produto não pode ser nulo");
        }
        if(plan == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Plano de assinatura não pode ser nulo");
        }
        if(createdAt == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Data de criação não pode ser nula");
        }
        if(updatedAt == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Data de atualização não pode ser nula");
        }
        if(updatedAt.isBefore(createdAt)) {
            throw new MindrabarException(ErrorCode.INVALID_DATE, "Data de atualização não pode ser anterior à data de criação");
        }
        if (cnpj == null || !cnpj.matches("\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2}")) {
            throw new MindrabarException(ErrorCode.INVALID_CNPJ, "CNPJ inválido");
        }

        this.id = id;
        this.name = name;
        this.description = description;
        this.product = product;
        this.plan = plan;
        this.cnpj = cnpj;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    
    public Company(String name, String description, ProductType product, SubscriptionPlan plan, String cnpj) {
        if(name == null || name.isEmpty()) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Nome não pode ser nulo ou vazio");
        }
        if(product == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Tipo de produto não pode ser nulo");
        }
        if(plan == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Plano de assinatura não pode ser nulo");
        }
        this.name = name;
        this.description = description;
        this.product = product;
        this.plan = plan;
        this.cnpj = cnpj;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public void updateName(String name) {
        if(name == null || name.isEmpty()) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Nome não pode ser nulo ou vazio");
        }
        this.name = name;
        this.updatedAt = LocalDateTime.now();
    }

    public void updateDescription(String description) {
        this.description = description;
        this.updatedAt = LocalDateTime.now();
    }

    public void updateProduct(ProductType product) {
        if(product == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Tipo de produto não pode ser nulo");
        }
        this.product = product;
        this.updatedAt = LocalDateTime.now();
    }

    public void updatePlan(SubscriptionPlan plan) {
        if(plan == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Plano de assinatura não pode ser nulo");
        }
        this.plan = plan;
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public ProductType getProduct() {
        return product;
    }

    public SubscriptionPlan getPlan() {
        return plan;
    }

    public String getCnpj() {
        return cnpj;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    

}
