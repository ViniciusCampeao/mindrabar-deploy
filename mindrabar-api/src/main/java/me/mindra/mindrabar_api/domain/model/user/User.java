package me.mindra.mindrabar_api.domain.model.user;

import java.time.LocalDateTime;

import me.mindra.mindrabar_api.domain.model.company.Company;
import me.mindra.mindrabar_api.exception.ErrorCode;
import me.mindra.mindrabar_api.exception.MindrabarException;

public class User {

    private Long id;
    private Company company;
    private String email;
    private String username;
    private String passwordHash;
    private RoleType role;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public User(Long id, Company company, String email, String username, String passwordHash, RoleType role,
            LocalDateTime createdAt, LocalDateTime updatedAt) {
        if(company == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Empresa não pode ser nula");
        }
        if(email != null && !email.contains("@")) {
            throw new MindrabarException(ErrorCode.INVALID_EMAIL, "Email deve ser válido");
        }
        if(username == null || username.length() < 3) {
            throw new MindrabarException(ErrorCode.INVALID_USERNAME, "Nome de usuário deve ter pelo menos 3 caracteres");
        }
        if(passwordHash == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Hash da senha não pode ser nulo");
        }
        if(role == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Papel não pode ser nulo");
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

        this.id = id;
        this.company = company;
        this.email = email;
        this.username = username;
        this.passwordHash = passwordHash;
        this.role = role;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    
    public User(Company company, String email, String username, String passwordHash, RoleType role) {
        if(company == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Empresa não pode ser nula");
        }
        if(email != null && !email.contains("@")) {
            throw new MindrabarException(ErrorCode.INVALID_EMAIL, "Email deve ser válido");
        }
        if(username == null || username.length() < 3) {
            throw new MindrabarException(ErrorCode.INVALID_USERNAME, "Nome de usuário deve ter pelo menos 3 caracteres");
        }
        if(passwordHash == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Hash da senha não pode ser nulo");
        }
        if(role == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Papel não pode ser nulo");
        }

        this.company = company;
        this.email = email;
        this.username = username;
        this.passwordHash = passwordHash;
        this.role = role;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public void addCompany(Company company) {
        if(company == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Empresa não pode ser nula");
        }
        this.company = company;
    }

    public void updateEmail(String email) {
        if(email != null && !email.contains("@")) {
            throw new MindrabarException(ErrorCode.INVALID_EMAIL, "Email deve ser válido");
        }
        this.email = email;
        this.updatedAt = LocalDateTime.now();
    }

    public void updateUsername(String username) {
        if(username == null || username.length() < 3) {
            throw new MindrabarException(ErrorCode.INVALID_USERNAME, "Nome de usuário deve ter pelo menos 3 caracteres");
        }
        this.username = username;
        this.updatedAt = LocalDateTime.now();
    }

    public void updatePasswordHash(String passwordHash) {
        if(passwordHash == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Hash da senha não pode ser nulo");
        }
        this.passwordHash = passwordHash;
        this.updatedAt = LocalDateTime.now();
    }

    public void updateRole(RoleType role) {
        if(role == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Papel não pode ser nulo");
        }
        this.role = role;
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Company getCompany() {
        return company;
    }

    public String getEmail() {
        return email;
    }

    public String getUsername() {
        return username;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public RoleType getRole() {
        return role;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void updateFields(String email, String username, String encryptedPassword, RoleType role) {
        this.updateEmail(email);
        this.updateUsername(username);
        this.updatePasswordHash(encryptedPassword);
        this.updateRole(role);
    }

}