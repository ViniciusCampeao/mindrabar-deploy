package me.mindra.mindrabar_api.infra.persistence.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

public class SecurityUtils {

    private SecurityUtils() {
        // utility class
    }

    private static Optional<SpringSecurityUserDetails> getUserDetails() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof SpringSecurityUserDetails userDetails)) {
            return Optional.empty();
        }
        return Optional.of(userDetails);
    }

    public static Long getCurrentUserId() {
        return getUserDetails()
                .map(SpringSecurityUserDetails::getUserId)
                .orElseThrow(() -> new IllegalStateException("User not authenticated"));
    }

    public static Long getCurrentCompanyId() {
        return getUserDetails()
                .map(SpringSecurityUserDetails::getCompanyId)
                .orElseThrow(() -> new IllegalStateException("User not authenticated"));
    }

    public static String getCurrentUsername() {
        return getUserDetails()
                .map(SpringSecurityUserDetails::getUsername)
                .orElseThrow(() -> new IllegalStateException("User not authenticated"));
    }

    public static String getCurrentRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getAuthorities().isEmpty()) {
            return null;
        }
        return auth.getAuthorities()
                .stream()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .findFirst()
                .orElse(null);
    }
}
