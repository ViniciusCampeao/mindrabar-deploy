package me.mindra.mindrabar_api.application.port.in;

import me.mindra.mindrabar_api.application.dto.auth.AuthRequestDTO;
import me.mindra.mindrabar_api.application.dto.auth.AuthResponseDTO;

public interface AuthenticateUserUseCase {
    AuthResponseDTO autenticateUser(AuthRequestDTO request);
}
