package me.mindra.mindrabar_api.infra.persistence.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import me.mindra.mindrabar_api.infra.persistence.entity.CustomerEntity;

public interface CustomerJpaRepository extends JpaRepository<CustomerEntity, Long> {
}
