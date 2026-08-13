package me.mindra.mindrabar_api.application.dto.user;

import me.mindra.mindrabar_api.domain.model.user.RoleType;
import me.mindra.mindrabar_api.domain.model.user.User;

public record UserDetailResponseDTO(
    Long id,
    String username,
    String email,
    RoleType role
) {

    public UserDetailResponseDTO(User user) {
        this(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getRole()
        );
    }
}
