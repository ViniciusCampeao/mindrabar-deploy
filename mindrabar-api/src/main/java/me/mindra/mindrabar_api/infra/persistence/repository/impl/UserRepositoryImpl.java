package me.mindra.mindrabar_api.infra.persistence.repository.impl;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import me.mindra.mindrabar_api.domain.model.user.User;
import me.mindra.mindrabar_api.domain.repository.UserRepository;
import me.mindra.mindrabar_api.infra.persistence.mapper.UserMapper;
import me.mindra.mindrabar_api.infra.persistence.repository.UserJpaRepository;

@Component
public class UserRepositoryImpl implements UserRepository {
    private final UserJpaRepository repository;

    public UserRepositoryImpl(UserJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<User> findAll() {
        return repository.findAll()
            .stream()
            .map(UserMapper::toDomain)
            .collect(Collectors.toList());
    }

    @Override
    public Optional<User> findById(Long id) {
        return repository.findById(id).map(UserMapper::toDomain);
    }

    @Override
    public Optional<User> findByUsername(String username) {
        return repository.findByUsername(username).map(UserMapper::toDomain);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return repository.findByEmail(email).map(UserMapper::toDomain);
    }

    @Override
    public List<User> findByRole(String role) {
        return repository.findByRole(role)
            .stream()
            .map(UserMapper::toDomain)
            .collect(Collectors.toList());
    }

    @Override
    public User save(User user) {
        return UserMapper.toDomain(repository.save(UserMapper.toEntity(user)));
    }

    @Override
    public void deleteById(Long id) {
        repository.deleteById(id);
    }

    @Override
    public List<User> findByCompanyId(Long companyId) {
       return  repository.findByCompanyId(companyId)
        .stream()
        .map(UserMapper::toDomain)
        .collect(Collectors.toList());
        
    }

}
