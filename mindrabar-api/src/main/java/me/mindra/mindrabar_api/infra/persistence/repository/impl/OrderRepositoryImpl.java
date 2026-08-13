package me.mindra.mindrabar_api.infra.persistence.repository.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import me.mindra.mindrabar_api.domain.model.order.Order;
import me.mindra.mindrabar_api.domain.model.order.OrderStatus;
import me.mindra.mindrabar_api.domain.model.table.Table;
import me.mindra.mindrabar_api.domain.repository.OrderRepository;
import me.mindra.mindrabar_api.infra.persistence.mapper.OrderMapper;
import me.mindra.mindrabar_api.infra.persistence.mapper.TableMapper;
import me.mindra.mindrabar_api.infra.persistence.repository.OrderJpaRepository;

@Component
public class OrderRepositoryImpl implements OrderRepository {

    private OrderJpaRepository repository;

    public OrderRepositoryImpl(OrderJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    public Optional<Order> findById(Long id) {
        return repository.findById(id)
            .map(OrderMapper::toDomain);
    }

    @Override
    public List<Order> findByTable(Table table) {
        return repository.findByTable(TableMapper.toEntity(table))
            .stream()
            .map(OrderMapper::toDomain)
            .collect(Collectors.toList());
    }

    @Override
    public List<Order> findByStatusAndCompanyId(OrderStatus status, Long companyId) {
        return repository.findByStatusAndTable_Company_Id(status, companyId)
            .stream()
            .map(OrderMapper::toDomain)
            .collect(Collectors.toList());
    }

    @Override
    public Order save(Order order) {
        return OrderMapper.toDomain(repository.save(OrderMapper.toEntity(order)));
    }

    @Override
    public void deleteById(Long id) {
        repository.deleteById(id);
    }

    @Override
    public Collection<Order> findByDayAndStatusAndCompany(LocalDate day, OrderStatus status, Long companyId) {
        LocalDateTime startOfDay = day.atStartOfDay();
        LocalDateTime endOfDay = day.atTime(23, 59, 59, 999_999_999);

        return repository.findByDayAndStatusAndCompany(status, companyId, startOfDay, endOfDay)
            .stream()
            .map(OrderMapper::toDomain)
            .collect(Collectors.toList());
    }
    
    @Override
    public Collection<Order> findByDayAndCompanyId(LocalDate day, Long companyId) {
        LocalDateTime startOfDay = day.atStartOfDay();
        LocalDateTime endOfDay = day.atTime(23, 59, 59, 999_999_999);

        return repository.findByDayAndCompany(companyId, startOfDay, endOfDay)
            .stream()
            .map(OrderMapper::toDomain)
            .collect(Collectors.toList());
    }

    @Override
    public List<Order> findByCompanyId(Long companyId) {
        return repository.findByTable_Company_Id(companyId)
            .stream()
            .map(OrderMapper::toDomain)
            .collect(Collectors.toList());
    }
}
