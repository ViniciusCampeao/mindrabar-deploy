package me.mindra.mindrabar_api.infra.persistence.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import me.mindra.mindrabar_api.domain.model.customer.TableSessionStatus;

@Entity
@Table(name = "table_sessions")
public class TableSessionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "table_id", referencedColumnName = "id")
    private TableEntity table;

    @ManyToOne
    @JoinColumn(name = "customer_id", referencedColumnName = "id")
    private CustomerEntity customer;

    @Column(name = "session_token")
    private String sessionToken;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private TableSessionStatus status;

    @ManyToOne
    @JoinColumn(name = "confirmed_by", referencedColumnName = "id")
    private UserEntity confirmedBy;

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public TableSessionEntity() {
    }

    public TableSessionEntity(Long id, TableEntity table, CustomerEntity customer, String sessionToken,
            TableSessionStatus status, UserEntity confirmedBy, LocalDateTime confirmedAt, LocalDateTime createdAt,
            LocalDateTime updatedAt) {
        this.id = id;
        this.table = table;
        this.customer = customer;
        this.sessionToken = sessionToken;
        this.status = status;
        this.confirmedBy = confirmedBy;
        this.confirmedAt = confirmedAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public TableEntity getTable() {
        return table;
    }

    public void setTable(TableEntity table) {
        this.table = table;
    }

    public CustomerEntity getCustomer() {
        return customer;
    }

    public void setCustomer(CustomerEntity customer) {
        this.customer = customer;
    }

    public String getSessionToken() {
        return sessionToken;
    }

    public void setSessionToken(String sessionToken) {
        this.sessionToken = sessionToken;
    }

    public TableSessionStatus getStatus() {
        return status;
    }

    public void setStatus(TableSessionStatus status) {
        this.status = status;
    }

    public UserEntity getConfirmedBy() {
        return confirmedBy;
    }

    public void setConfirmedBy(UserEntity confirmedBy) {
        this.confirmedBy = confirmedBy;
    }

    public LocalDateTime getConfirmedAt() {
        return confirmedAt;
    }

    public void setConfirmedAt(LocalDateTime confirmedAt) {
        this.confirmedAt = confirmedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
