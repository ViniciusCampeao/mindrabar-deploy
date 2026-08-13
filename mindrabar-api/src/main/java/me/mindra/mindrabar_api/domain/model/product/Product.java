package me.mindra.mindrabar_api.domain.model.product;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import me.mindra.mindrabar_api.domain.model.company.Company;
import me.mindra.mindrabar_api.exception.ErrorCode;
import me.mindra.mindrabar_api.exception.MindrabarException;

public class Product {

    private Long id;
    private Company company;
    private String name;
    private BigDecimal costPrice;
    private BigDecimal salePrice;
    private int stockQuantity;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Product(Long id, Company company, String name, BigDecimal costPrice, BigDecimal salePrice, int stockQuantity,
            LocalDateTime createdAt, LocalDateTime updatedAt) {
        if(company == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Empresa não pode ser nula");
        }
        if(name == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Nome não pode ser nulo");
        }
        if(costPrice == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Preço de custo não pode ser nulo");
        }
        if(salePrice == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Preço de venda não pode ser nulo");
        }

        this.id = id;
        this.company = company;
        this.name = name;
        this.costPrice = costPrice;
        this.salePrice = salePrice;
        this.stockQuantity = stockQuantity;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Product(Company company, String name, BigDecimal costPrice, BigDecimal salePrice, int stockQuantity) {
        if(company == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Empresa não pode ser nula");
        }
        if(name == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Nome não pode ser nulo");
        }
        if(costPrice == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Preço de custo não pode ser nulo");
        }
        if(salePrice == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Preço de venda não pode ser nulo");
        }

        this.company = company;
        this.name = name;
        this.costPrice = costPrice;
        this.salePrice = salePrice;
        this.stockQuantity = stockQuantity;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public void addCompany(Company company) {
        if(company == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Empresa não pode ser nula");
        }
        this.company = company;
    }

    public void addStock(int stockQuantity) {
        if(stockQuantity < 0) {
            throw new MindrabarException(ErrorCode.INVALID_QUANTITY, "Quantidade de estoque não pode ser menor que 0");
        }
        this.stockQuantity += stockQuantity;
    }

    public void removeStock(int stockQuantity) {
        if(stockQuantity < 0) {
            throw new MindrabarException(ErrorCode.INVALID_QUANTITY, "Quantidade de estoque não pode ser menor que 0");
        }
        // if(this.stockQuantity < stockQuantity) {
        //     throw new MindrabarException(ErrorCode.INSUFFICIENT_STOCK, "Quantidade a remover não pode ser maior que o estoque disponível");
        // }
        this.stockQuantity -= stockQuantity;
    }

    public void updateName(String name) {
        if(name == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Nome não pode ser nulo");
        }
        this.name = name;
    }

    public void updateCostPrice(BigDecimal costPrice) {
        if(costPrice == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Preço de custo não pode ser nulo");
        }
        if(costPrice.compareTo(BigDecimal.ZERO) < 0) {
            throw new MindrabarException(ErrorCode.INVALID_PRICE, "Preço de custo não pode ser menor que 0");
        }
        this.costPrice = costPrice;
    }
    
    public void updateSalePrice(BigDecimal salePrice) {
        if(salePrice == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Preço de venda não pode ser nulo");
        }
        if(salePrice.compareTo(BigDecimal.ZERO) < 0) {
            throw new MindrabarException(ErrorCode.INVALID_PRICE, "Preço de venda não pode ser menor que 0");
        }
        this.salePrice = salePrice;
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

    public BigDecimal getCostPrice() {
        return costPrice;
    }

    public BigDecimal getSalePrice() {
        return salePrice;
    }

    public int getStockQuantity() {
        return stockQuantity;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
