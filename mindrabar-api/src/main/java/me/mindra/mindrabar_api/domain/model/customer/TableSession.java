package me.mindra.mindrabar_api.domain.model.customer;

import java.time.LocalDateTime;
import java.util.UUID;

import me.mindra.mindrabar_api.domain.model.table.Table;
import me.mindra.mindrabar_api.domain.model.user.User;
import me.mindra.mindrabar_api.exception.ErrorCode;
import me.mindra.mindrabar_api.exception.MindrabarException;

public class TableSession {

    private Long id;
    private Table table;
    private Customer customer;
    private String sessionToken;
    private TableSessionStatus status;
    private User confirmedBy;
    private LocalDateTime confirmedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public TableSession(Long id, Table table, Customer customer, String sessionToken, TableSessionStatus status,
            User confirmedBy, LocalDateTime confirmedAt, LocalDateTime createdAt, LocalDateTime updatedAt) {
        if (table == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Mesa não pode ser nula");
        }
        if (customer == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Cliente não pode ser nulo");
        }
        if (status == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Status não pode ser nulo");
        }

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

    public TableSession(Table table, Customer customer) {
        if (table == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Mesa não pode ser nula");
        }
        if (customer == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Cliente não pode ser nulo");
        }

        this.table = table;
        this.customer = customer;
        this.sessionToken = UUID.randomUUID().toString();
        this.status = TableSessionStatus.PENDING_CONFIRMATION;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public void confirm(User staff) {
        if (staff == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Usuário responsável pela confirmação não pode ser nulo");
        }
        if (this.status != TableSessionStatus.PENDING_CONFIRMATION) {
            throw new MindrabarException(ErrorCode.INVALID_STATUS_TRANSITION, "Sessão já foi confirmada ou está encerrada");
        }
        this.status = TableSessionStatus.CONFIRMED;
        this.confirmedBy = staff;
        this.confirmedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public void close() {
        if (this.status == TableSessionStatus.CLOSED) {
            return;
        }
        this.status = TableSessionStatus.CLOSED;
        this.updatedAt = LocalDateTime.now();
    }

    public boolean canOrder() {
        return this.status != TableSessionStatus.CLOSED;
    }

    public Long getId() {
        return id;
    }

    public Table getTable() {
        return table;
    }

    public Customer getCustomer() {
        return customer;
    }

    public String getSessionToken() {
        return sessionToken;
    }

    public TableSessionStatus getStatus() {
        return status;
    }

    public User getConfirmedBy() {
        return confirmedBy;
    }

    public LocalDateTime getConfirmedAt() {
        return confirmedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
