package me.mindra.mindrabar_api.application.service.auth;

import org.springframework.security.crypto.password.PasswordEncoder;

import me.mindra.mindrabar_api.application.dto.auth.AuthRequestDTO;
import me.mindra.mindrabar_api.application.dto.auth.AuthResponseDTO;
import me.mindra.mindrabar_api.application.port.in.AuthenticateUserUseCase;
import me.mindra.mindrabar_api.application.port.out.TokenProviderPort;
import me.mindra.mindrabar_api.application.port.out.UserAuthPort;
import me.mindra.mindrabar_api.domain.model.user.User;
import me.mindra.mindrabar_api.exception.ErrorCode;
import me.mindra.mindrabar_api.exception.MindrabarException;

public class AuthenticateUserUseCaseImpl implements AuthenticateUserUseCase {

    private final UserAuthPort userAuthPort;
    private final TokenProviderPort tokenProviderPort;
    private final PasswordEncoder passwordEncoder;

    public AuthenticateUserUseCaseImpl(UserAuthPort userAuthPort, TokenProviderPort tokenProviderPort, PasswordEncoder passwordEncoder) {
        this.userAuthPort = userAuthPort;
        this.tokenProviderPort = tokenProviderPort;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public AuthResponseDTO autenticateUser(AuthRequestDTO request) {
        User user = userAuthPort.findUserByUsername(request.username());

        if(!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new MindrabarException(ErrorCode.INVALID_CREDENTIALS, "Usuário ou senha inválidos");
        }

        String token = tokenProviderPort.generateToken(user.getUsername(), user.getRole().name());

        return new AuthResponseDTO(token);
    }

}
