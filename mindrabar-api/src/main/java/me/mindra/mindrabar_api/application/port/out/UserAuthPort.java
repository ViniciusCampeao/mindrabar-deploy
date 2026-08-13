package me.mindra.mindrabar_api.application.port.out;

import org.springframework.security.core.userdetails.UsernameNotFoundException;

import me.mindra.mindrabar_api.domain.model.user.User;

public interface UserAuthPort {
    User findUserByUsername(String username) throws UsernameNotFoundException;
}
