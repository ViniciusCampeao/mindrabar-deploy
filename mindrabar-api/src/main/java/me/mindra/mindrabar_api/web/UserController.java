package me.mindra.mindrabar_api.web;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import me.mindra.mindrabar_api.application.dto.user.UserCreateRequestDTO;
import me.mindra.mindrabar_api.application.dto.user.UserCreateResponseDTO;
import me.mindra.mindrabar_api.application.dto.user.UserDetailResponseDTO;
import me.mindra.mindrabar_api.application.port.in.ManageUserUseCase;
import me.mindra.mindrabar_api.infra.persistence.security.SecurityUtils;

@RestController
@RequestMapping("/user")
@Tag(name = "Users", description = "Endpoints para gerenciar usuários")
public class UserController {

    private final ManageUserUseCase manageUserUseCase;

    public UserController(ManageUserUseCase manageUserUseCase) {
        this.manageUserUseCase = manageUserUseCase;
    }

    @Operation(summary = "Criar um novo usuário")
    @PostMapping("/create")
    @ResponseStatus(HttpStatus.CREATED)
    public UserCreateResponseDTO createUser(@RequestBody UserCreateRequestDTO request) {
        return manageUserUseCase.createUser(
            SecurityUtils.getCurrentCompanyId(),
            request);
    }

    @Operation(summary = "Deletar um usuário pelo ID")
    @DeleteMapping("/delete/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable Long userId) {
        manageUserUseCase.deleteUser(
            SecurityUtils.getCurrentCompanyId(),
            userId);
    }

    @Operation(summary = "Obter detalhes de um usuário pelo ID")
    @GetMapping("/{userId}")
    public UserDetailResponseDTO getUserById(@PathVariable Long userId) {
        return manageUserUseCase.getUserById(
            SecurityUtils.getCurrentCompanyId(),
            userId);
    }

    @Operation(summary = "Obter todos os usuários da empresa")
    @GetMapping("/company")
    public List<UserDetailResponseDTO> getUsersByCompanyId() {
        return manageUserUseCase.getUsersByCompanyId(
            SecurityUtils.getCurrentCompanyId());
    }
    @Operation(summary = "Atualizar um usuário pelo ID")
    @PutMapping("/update/{userId}")
    public UserDetailResponseDTO updateUserById(@PathVariable Long userId, @RequestBody UserCreateRequestDTO request) {
        return manageUserUseCase.updateUserById(
            SecurityUtils.getCurrentCompanyId(),
            userId,
            request);
    }
}
