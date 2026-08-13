package me.mindra.mindrabar_api.application.service;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;

import me.mindra.mindrabar_api.application.dto.user.UserCreateRequestDTO;
import me.mindra.mindrabar_api.application.dto.user.UserCreateResponseDTO;
import me.mindra.mindrabar_api.application.dto.user.UserDetailResponseDTO;
import me.mindra.mindrabar_api.application.port.in.ManageUserUseCase;
import me.mindra.mindrabar_api.domain.model.company.Company;
import me.mindra.mindrabar_api.domain.model.user.RoleType;
import me.mindra.mindrabar_api.domain.model.user.User;
import me.mindra.mindrabar_api.domain.service.CompanyService;
import me.mindra.mindrabar_api.domain.service.UserService;
import me.mindra.mindrabar_api.exception.ErrorCode;
import me.mindra.mindrabar_api.exception.MindrabarException;

public class ManageUseruseCaseImpl implements ManageUserUseCase {

    private final UserService userService;
    private final CompanyService companyService;
    private final PasswordEncoder passwordEncoder;

    public ManageUseruseCaseImpl(UserService userService, CompanyService companyService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.companyService = companyService;
        this.passwordEncoder = passwordEncoder;
    }

    public UserCreateResponseDTO createUser(Long companyId, UserCreateRequestDTO request) {
        if(request.role() == null || request.role().equals(RoleType.ADMIN)) {
            throw new MindrabarException(ErrorCode.BUSINESS_RULE_VIOLATION, "Não é permitido criar usuário com perfil ADMIN");
        }
        String encryptedPassword = passwordEncoder.encode(request.password());
        Company company = companyService.findById(companyId);
        User user =  userService.create(request.toDomain(company, encryptedPassword));
        return new UserCreateResponseDTO(user.getId());
    }

    @Override
    public void deleteUser(Long companyId, Long userId) {
        User userToDelete = userService.findById(userId);
        if(userToDelete.getCompany() == null || !userToDelete.getCompany().getId().equals(companyId)) {
            throw new MindrabarException(ErrorCode.CROSS_COMPANY_ACCESS, "Acesso a usuário de outra empresa não permitido");
        }
        userService.deleteById(userId);
    }

    @Override
    public UserDetailResponseDTO getUserById(Long companyId, Long userId) {

        User user = userService.findById(userId);
        if (user.getCompany() == null || !user.getCompany().getId().equals(companyId)) {
            throw new MindrabarException(ErrorCode.CROSS_COMPANY_ACCESS, "Acesso a usuário de outra empresa não permitido");
        }
        return new UserDetailResponseDTO(user);
    }

    @Override
    public List<UserDetailResponseDTO> getUsersByCompanyId(Long companyId) {
        List<User> users = userService.findByCompanyId(companyId);
        return users.stream().map(UserDetailResponseDTO::new).toList();
    }

    @Override
    public UserDetailResponseDTO updateUserById(Long companyId, Long userId, UserCreateRequestDTO request) {
        User existingUser = userService.findById(userId);
        if(existingUser.getCompany() == null || !existingUser.getCompany().getId().equals(companyId)) {
            throw new MindrabarException(ErrorCode.CROSS_COMPANY_ACCESS, "Acesso a usuário de outra empresa não permitido");
        }
        if(request.role() == null || request.role().equals(RoleType.ADMIN)) {
            throw new MindrabarException(ErrorCode.BUSINESS_RULE_VIOLATION, "Não é permitido atualizar usuário com perfil ADMIN");
        }
        String encryptedPassword = passwordEncoder.encode(request.password());
        existingUser.updateFields(request.email(), request.username(), encryptedPassword, request.role());
        User savedUser = userService.update(existingUser);
        return new UserDetailResponseDTO(savedUser);
    }
}
