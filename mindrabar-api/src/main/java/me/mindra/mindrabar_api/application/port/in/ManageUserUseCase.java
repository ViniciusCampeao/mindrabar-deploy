package me.mindra.mindrabar_api.application.port.in;

import java.util.List;

import me.mindra.mindrabar_api.application.dto.user.UserCreateRequestDTO;
import me.mindra.mindrabar_api.application.dto.user.UserCreateResponseDTO;
import me.mindra.mindrabar_api.application.dto.user.UserDetailResponseDTO;

public interface ManageUserUseCase {
    UserCreateResponseDTO createUser(Long companyId, UserCreateRequestDTO request);
    void deleteUser(Long companyId, Long userId);
    UserDetailResponseDTO getUserById(Long companyId, Long userId);
    List<UserDetailResponseDTO> getUsersByCompanyId(Long companyId);
    UserDetailResponseDTO updateUserById(Long companyId, Long userId, UserCreateRequestDTO request);
}
