package me.mindra.mindrabar_api.application.dto.user;

import me.mindra.mindrabar_api.domain.model.company.Company;
import me.mindra.mindrabar_api.domain.model.user.RoleType;
import me.mindra.mindrabar_api.domain.model.user.User;

public record UserCreateRequestDTO(
    String email,
    String username,
    String password,
    RoleType role
) {
    public User toDomain(Company company, String encryptedPassword) {
        return new User(company, this.email, this.username, encryptedPassword, this.role);
    }
}
