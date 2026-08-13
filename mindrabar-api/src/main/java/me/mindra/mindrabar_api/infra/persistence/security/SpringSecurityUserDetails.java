package me.mindra.mindrabar_api.infra.persistence.security;

import java.util.Collection;
import java.util.Collections;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import me.mindra.mindrabar_api.domain.model.user.User;
import me.mindra.mindrabar_api.exception.ErrorCode;
import me.mindra.mindrabar_api.exception.MindrabarException;

public class SpringSecurityUserDetails implements UserDetails {

    private final User user;
    private final Long companyId;
    private final Long userId;

    public SpringSecurityUserDetails(User user) {
        if (user == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Usuário não pode ser nulo");
        }
        this.user = user;
        this.companyId = user.getCompany().getId();
        this.userId = user.getId();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singleton(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
    }

    @Override
    public String getPassword() {
        return user.getPasswordHash();
    }

    @Override
    public String getUsername() {
        return user.getUsername();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    public Long getCompanyId() {
        return this.companyId;
    }

    public Long getUserId() {
        return this.userId;
    }
}