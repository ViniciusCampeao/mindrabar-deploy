package me.mindra.mindrabar_api.domain.service;

import me.mindra.mindrabar_api.domain.model.customer.Customer;
import me.mindra.mindrabar_api.domain.repository.CustomerRepository;
import me.mindra.mindrabar_api.exception.ErrorCode;
import me.mindra.mindrabar_api.exception.MindrabarException;

public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public Customer create(Customer customer) {
        if (customer == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Cliente não pode ser nulo");
        }
        return customerRepository.save(customer);
    }

    public Customer findById(Long id) {
        if (id == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "ID do cliente não pode ser nulo");
        }
        return customerRepository.findById(id)
            .orElseThrow(() -> new MindrabarException(ErrorCode.CUSTOMER_NOT_FOUND, "Cliente não encontrado"));
    }
}
