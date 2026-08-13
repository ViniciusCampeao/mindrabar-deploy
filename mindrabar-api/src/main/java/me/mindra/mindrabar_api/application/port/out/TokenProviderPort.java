package me.mindra.mindrabar_api.application.port.out;

public interface TokenProviderPort {
    String generateToken(String username, String role);
    boolean validateToken(String token);
    String getUsernameFromJWT(String token);
}
