package me.mindra.mindrabar_api.infra.persistence.repository.impl;

import java.util.Optional;

import org.springframework.stereotype.Component;

import me.mindra.mindrabar_api.domain.model.customer.Customer;
import me.mindra.mindrabar_api.domain.repository.CustomerRepository;
import me.mindra.mindrabar_api.infra.persistence.mapper.CustomerMapper;
import me.mindra.mindrabar_api.infra.persistence.repository.CustomerJpaRepository;

@Component
public class CustomerRepositoryImpl implements CustomerRepository {

    private final CustomerJpaRepository repository;

    public CustomerRepositoryImpl(CustomerJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    public Customer save(Customer customer) {
        return CustomerMapper.toDomain(repository.save(CustomerMapper.toEntity(customer)));
    }

    @Override
    public Optional<Customer> findById(Long id) {
        return repository.findById(id).map(CustomerMapper::toDomain);
    }
}
