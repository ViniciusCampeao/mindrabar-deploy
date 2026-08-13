package me.mindra.mindrabar_api.web;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import me.mindra.mindrabar_api.application.dto.auth.AuthRequestDTO;
import me.mindra.mindrabar_api.application.dto.auth.AuthResponseDTO;
import me.mindra.mindrabar_api.application.dto.user.UserInfoResponseDTO;
import me.mindra.mindrabar_api.application.port.in.AuthenticateUserUseCase;
import me.mindra.mindrabar_api.infra.persistence.security.SecurityUtils;

@RestController
@RequestMapping("/auth")
@Tag(name = "Auth", description = "Endpoints de autenticação de usuários")
public class AuthController {

    private final AuthenticateUserUseCase authenticateUserUseCase;

    public AuthController(AuthenticateUserUseCase authenticateUserUseCase) {
        this.authenticateUserUseCase = authenticateUserUseCase;
    }

    
    @Operation(summary = "Autenticar usuário e gerar token")
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> authenticateUser(@RequestBody AuthRequestDTO authRequest) {
        AuthResponseDTO response = authenticateUserUseCase.autenticateUser(authRequest);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Obter informações do usuário autenticado")
    @GetMapping("/me")
    public ResponseEntity<UserInfoResponseDTO> getUserInfo(Authentication authentication) {
        String username = SecurityUtils.getCurrentUsername();
        String role = SecurityUtils.getCurrentRole();
        Long companyId = SecurityUtils.getCurrentCompanyId();
        Long userId = SecurityUtils.getCurrentUserId();

        return ResponseEntity.ok(new UserInfoResponseDTO(userId, username, companyId, role));
    }
}
