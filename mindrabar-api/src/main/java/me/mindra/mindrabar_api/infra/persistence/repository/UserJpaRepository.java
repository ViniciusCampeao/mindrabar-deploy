package me.mindra.mindrabar_api.infra.persistence.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import me.mindra.mindrabar_api.infra.persistence.entity.UserEntity;

public interface UserJpaRepository extends JpaRepository<UserEntity, Long> {
    Optional<UserEntity> findByUsername(String username);
    Optional<UserEntity> findByEmail(String email);
    List<UserEntity> findByRole(String role);
    List<UserEntity> findByCompanyId(Long companyId);
}
