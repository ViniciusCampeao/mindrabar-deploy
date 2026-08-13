package me.mindra.mindrabar_api.domain.repository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

import me.mindra.mindrabar_api.domain.model.order.Order;
import me.mindra.mindrabar_api.domain.model.order.OrderStatus;
import me.mindra.mindrabar_api.domain.model.table.Table;

public interface OrderRepository {
    Optional<Order> findById(Long id);
    List<Order> findByCompanyId(Long companyId);
    List<Order> findByTable(Table table);
    List<Order> findByStatusAndCompanyId(OrderStatus status, Long companyId);
    Collection<Order> findByDayAndStatusAndCompany(LocalDate day, OrderStatus status, Long companyId);
    Collection<Order> findByDayAndCompanyId(LocalDate day, Long companyId);
    Order save(Order order);
    void deleteById(Long id);
}
