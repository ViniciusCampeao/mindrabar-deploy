package me.mindra.mindrabar_api.application.dto.user;

public record UserInfoResponseDTO(
    Long userId,
    String username,
    Long companyId,
    String role
) {

}
