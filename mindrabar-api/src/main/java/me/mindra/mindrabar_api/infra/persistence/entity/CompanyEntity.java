package me.mindra.mindrabar_api.infra.persistence.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import me.mindra.mindrabar_api.domain.model.company.ProductType;
import me.mindra.mindrabar_api.domain.model.company.SubscriptionPlan;

@Entity
@Table(name = "companies")
public class CompanyEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name")
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "product_type")
    @Enumerated(EnumType.STRING)
    private ProductType product;

    @Column(name = "subscription_plan")
    @Enumerated(EnumType.STRING)
    private SubscriptionPlan plan;

    @Column(name = "cnpj", unique = true, nullable = false)
    private String cnpj;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public CompanyEntity() {
    }

    public CompanyEntity(Long id, String name, String description, ProductType product, SubscriptionPlan plan,
            String cnpj, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.product = product;
        this.plan = plan;
        this.cnpj = cnpj;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
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

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setProduct(ProductType product) {
        this.product = product;
    }

    public void setPlan(SubscriptionPlan plan) {
        this.plan = plan;
    }

    public void setCnpj(String cnpj) {
        this.cnpj = cnpj;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
