package me.mindra.mindrabar_api.domain.model.customer;

import java.time.LocalDateTime;

import me.mindra.mindrabar_api.exception.ErrorCode;
import me.mindra.mindrabar_api.exception.MindrabarException;

public class Customer {

    private Long id;
    private String name;
    private String phone;
    private LocalDateTime createdAt;

    public Customer(Long id, String name, String phone, LocalDateTime createdAt) {
        validate(name, phone);
        this.id = id;
        this.name = name.trim();
        this.phone = PhoneUtils.normalize(phone);
        this.createdAt = createdAt;
    }

    public Customer(String name, String phone) {
        validate(name, phone);
        this.name = name.trim();
        this.phone = PhoneUtils.normalize(phone);
        this.createdAt = LocalDateTime.now();
    }

    private static void validate(String name, String phone) {
        if (name == null || name.trim().length() < 2) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Nome deve ter pelo menos 2 caracteres");
        }
        String digits = PhoneUtils.normalize(phone);
        if (!PhoneUtils.isValidBrazilianPhone(digits)) {
            throw new MindrabarException(ErrorCode.INVALID_PHONE, "Telefone deve ser um número brasileiro válido (DDD + número)");
        }
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getPhone() {
        return phone;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
