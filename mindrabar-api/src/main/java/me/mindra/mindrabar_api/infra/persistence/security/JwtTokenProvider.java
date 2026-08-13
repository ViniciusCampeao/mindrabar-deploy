package me.mindra.mindrabar_api.infra.persistence.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import me.mindra.mindrabar_api.application.port.out.TokenProviderPort;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtTokenProvider implements TokenProviderPort {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpirationInMs;

    private final Algorithm algorithm;

    public JwtTokenProvider(@Value("${jwt.secret}") String jwtSecret) {
        this.algorithm = Algorithm.HMAC512(jwtSecret.getBytes());
    }

    @Override
    public String generateToken(String username, String role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationInMs);

        return JWT.create()
                .withSubject(username)
                .withClaim("role", role)
                .withIssuedAt(now)
                .withExpiresAt(expiryDate)
                .sign(this.algorithm);
    }

    public boolean validateToken(String token) throws JWTVerificationException {
        JWT.require(this.algorithm)
                .build()
                .verify(token);
        return true;
    }

    public String getUsernameFromJWT(String token) {
        DecodedJWT decodedJWT = JWT.decode(token);
        return decodedJWT.getSubject();
    }
}