package me.mindra.mindrabar_api.domain.repository;

import java.util.Optional;

import me.mindra.mindrabar_api.domain.model.customer.Customer;

public interface CustomerRepository {
    Customer save(Customer customer);
    Optional<Customer> findById(Long id);
}
