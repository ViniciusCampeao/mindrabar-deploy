package me.mindra.mindrabar_api.infra.persistence.security;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import me.mindra.mindrabar_api.application.port.out.UserAuthPort;
import me.mindra.mindrabar_api.domain.model.user.User;
import me.mindra.mindrabar_api.domain.repository.UserRepository;

@Service
public class UserDetailsServiceImpl implements UserDetailsService, UserAuthPort {

    private final UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found " + username));
        
        return new SpringSecurityUserDetails(user);
    }
    @Override
    public User findUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found " + username));

        return user;
    }

}
