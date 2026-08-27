package me.mindra.mindrabar_api.infra.persistence.mapper;

import me.mindra.mindrabar_api.domain.model.customer.Customer;
import me.mindra.mindrabar_api.infra.persistence.entity.CustomerEntity;

public class CustomerMapper {

    public static CustomerEntity toEntity(Customer domain) {
        return new CustomerEntity(
            domain.getId(),
            domain.getName(),
            domain.getPhone(),
            domain.getCreatedAt()
        );
    }

    public static Customer toDomain(CustomerEntity entity) {
        return new Customer(
            entity.getId(),
            entity.getName(),
            entity.getPhone(),
            entity.getCreatedAt()
        );
    }
}
