package me.mindra.mindrabar_api.domain.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

import me.mindra.mindrabar_api.domain.model.order.Order;
import me.mindra.mindrabar_api.domain.model.order.OrderStatus;
import me.mindra.mindrabar_api.domain.model.order.PaymentMethod;
import me.mindra.mindrabar_api.domain.model.table.Table;
import me.mindra.mindrabar_api.domain.repository.OrderRepository;
import me.mindra.mindrabar_api.exception.ErrorCode;
import me.mindra.mindrabar_api.exception.MindrabarException;

public class OrderService {

    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public Order create(Order order) {
        if(order.getTable() == null || order.getTable().getId() == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Pedido deve pertencer a uma mesa existente");
        }
        return orderRepository.save(order);
    }

    public Order updateStatus(Long id, OrderStatus status) {
        if(status == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Status não pode ser nulo");
        }

        Order order = findById(id);
        order.updateStatus(status);
        return orderRepository.save(order);
    }

    public Order payment(Long id, PaymentMethod paymentMethod, BigDecimal amount) {
        if(amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new MindrabarException(ErrorCode.INVALID_PRICE, "Valor de pagamento inválido");
        }
        if(paymentMethod == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Método de pagamento não pode ser nulo");
        }

        Order order = findById(id);
        order.payment(paymentMethod, amount);
        return orderRepository.save(order);
    }

    public Order findById(Long id) {
        return orderRepository.findById(id).orElseThrow(() -> new MindrabarException(ErrorCode.ORDER_NOT_FOUND, "Pedido não encontrado"));
    }

    public List<Order> findAll(Long companyId) {
        return orderRepository.findByCompanyId(companyId);
    }

    public List<Order> findByTable(Table table) {
        return orderRepository.findByTable(table);
    }

    public List<Order> findByStatusAndCompanyId(OrderStatus status, Long companyId) {
        return orderRepository.findByStatusAndCompanyId(status, companyId);
    }

    public void delete(Long id) {
        orderRepository.deleteById(id);
    }

    public Collection<Order> findByDayAndStatusAndCompanyId(LocalDate day, OrderStatus status, Long companyId) {
        return orderRepository.findByDayAndStatusAndCompany(day, status, companyId);
    }
    
    public Collection<Order> findByDayAndCompanyId(LocalDate day, Long companyId) {
        return orderRepository.findByDayAndCompanyId(day, companyId);
    }

    public void addTotalAmount(Long orderId, BigDecimal totalAmount) {
        Order order = findById(orderId);
        order.addTotalAmount(totalAmount);
        orderRepository.save(order);
    }

    public void removeTotalAmount(Long orderId, BigDecimal amount) {
        Order order = findById(orderId);
        order.removeTotalAmount(amount);
        orderRepository.save(order);
    }

    public Order updateTable(Long orderId, Table newTable) {
        if(newTable == null || newTable.getId() == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Mesa não pode ser nula");
        }
        Order order = findById(orderId);
        order.updateTable(newTable);
        return orderRepository.save(order);
    }

    public void removeAmountPending(Long orderId, BigDecimal amount) {
        Order order = findById(orderId);
        order.removeAmountPending(amount);
        orderRepository.save(order);
    }
}
