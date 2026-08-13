package me.mindra.mindrabar_api.domain.repository;

import java.util.List;
import java.util.Optional;

import me.mindra.mindrabar_api.domain.model.user.User;

public interface UserRepository {

    List<User> findAll();
    Optional<User> findById(Long id);
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    List<User> findByRole(String role);
    List<User> findByCompanyId(Long companyId);
    User save(User user);
    void deleteById(Long id);
}
