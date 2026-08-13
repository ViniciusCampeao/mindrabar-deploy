package me.mindra.mindrabar_api.application.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;

import me.mindra.mindrabar_api.application.dto.order.OrderCloseResponseDTO;
import me.mindra.mindrabar_api.application.dto.order.OrderCreateRequestDTO;
import me.mindra.mindrabar_api.application.dto.order.OrderCreateResponseDTO;
import me.mindra.mindrabar_api.application.dto.order.OrderPaymentDetailsResponseDTO;
import me.mindra.mindrabar_api.application.dto.order.OrderResponseDTO;
import me.mindra.mindrabar_api.application.dto.order.OrderSaleResponseDTO;
import me.mindra.mindrabar_api.application.dto.order.OrderSaleResponseDTO.OrderItemDTO;
import me.mindra.mindrabar_api.application.dto.order.OrderStatusUpdateRequestDTO;
import me.mindra.mindrabar_api.application.dto.order.OrderStatusUpdateResponseDTO;
import me.mindra.mindrabar_api.application.dto.order.OrderTableUpdateRequestDTO;
import me.mindra.mindrabar_api.application.dto.order.OrderTableUpdateResponseDTO;
import me.mindra.mindrabar_api.application.dto.order.PaymentRequestDTO;
import me.mindra.mindrabar_api.application.dto.item.AddPaymentRequestDTO;
import me.mindra.mindrabar_api.application.dto.item.ItemResponseDTO;
import me.mindra.mindrabar_api.application.port.in.ManageOrderUseCase;
import me.mindra.mindrabar_api.domain.model.item.Item;
import me.mindra.mindrabar_api.domain.model.order.Order;
import me.mindra.mindrabar_api.domain.model.order.OrderStatus;
import me.mindra.mindrabar_api.domain.model.table.Table;
import me.mindra.mindrabar_api.domain.model.table.TableStatus;
import me.mindra.mindrabar_api.domain.service.ItemService;
import me.mindra.mindrabar_api.domain.service.OrderService;
import me.mindra.mindrabar_api.domain.service.TableService;
import me.mindra.mindrabar_api.exception.ErrorCode;
import me.mindra.mindrabar_api.exception.MindrabarException;

public class ManageOrderUseCaseImpl implements ManageOrderUseCase {

    private final OrderService orderService;
    private final TableService tableService;
    private final ItemService itemService;

    public ManageOrderUseCaseImpl(OrderService orderService, TableService tableService, 
                                 ItemService itemService) {
        this.orderService = orderService;
        this.tableService = tableService;
        this.itemService = itemService;
    }

    @Override
    public OrderCreateResponseDTO createOrder(OrderCreateRequestDTO request) {
        Table table = tableService.findById(request.tableId());
        tableService.updateStatus(table.getId(), TableStatus.OCCUPIED);
        Order order = orderService.create(
            new Order(table, request.status())
        );

        return new OrderCreateResponseDTO(
            order.getId(),
            order.getTable().getId(),
            order.getStatus(),
            order.getCreatedAt(),
            order.getUpdatedAt()
        );
    }

    @Override
    public OrderStatusUpdateResponseDTO updateStatus(OrderStatusUpdateRequestDTO request) {
        Order order = orderService.updateStatus(request.id(), request.status());
        Table table = order.getTable();
        
        if(orderService.findByTable(table).isEmpty() || orderService.findByTable(table).stream().allMatch(o -> o.getStatus() == OrderStatus.CLOSED)) {
            tableService.updateStatus(table.getId(), TableStatus.AVAILABLE);
        }
        
        return new OrderStatusUpdateResponseDTO(
            order.getId(),
            order.getTable().getId(),
            order.getStatus(),
            order.getUpdatedAt()
            );
    }

    @Override
    public void deleteOrder(Long orderId) {
        Table table = orderService.findById(orderId).getTable();
        orderService.delete(orderId);
        if(orderService.findByTable(table).isEmpty() || orderService.findByTable(table).stream().allMatch(o -> o.getStatus() == OrderStatus.CLOSED)) {
            tableService.updateStatus(table.getId(), TableStatus.AVAILABLE);
        }
    }

    @Override
    public List<OrderResponseDTO> findAll(Long companyId) {
        return orderService.findAll(companyId).stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    public OrderResponseDTO findById(Long id) {
        return toDto(orderService.findById(id));
    }

    @Override
    public List<OrderResponseDTO> findByTable(Long tableId) {
        Table table = tableService.findById(tableId);
        return orderService.findByTable(table).stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    public List<OrderResponseDTO> findByStatusAndCompanyId(OrderStatus status, Long companyId) {
        return orderService.findByStatusAndCompanyId(status, companyId).stream()
                .map(this::toDto)
                .toList();
    }

    private OrderResponseDTO toDto(Order order) {
        return new OrderResponseDTO(
            order.getId(),
            order.getTable().getId(),
            order.getStatus(),
            order.getTotalAmount(),
            order.getAmountPending(),
            order.getCreatedAt(),
            order.getUpdatedAt()
        );
    }

    @Override
    public List<OrderResponseDTO> findByDayAndStatusAndCompanyId(LocalDate day, OrderStatus status, Long companyId) {
        return orderService.findByDayAndStatusAndCompanyId(day, status, companyId).stream()
                .map(this::toDto)
                .toList();
    }
    
    @Override
    public List<OrderSaleResponseDTO> findByDayAndCompanyId(LocalDate day, Long companyId) {
        List<Order> orders = new ArrayList<>(orderService.findByDayAndCompanyId(day, companyId));

        return orders.stream().map(order -> {
            List<Item> items = itemService.findByOrder(order);
            List<OrderItemDTO> itemDTOs = items.stream().map(item -> {
                BigDecimal itemTotal = item.getProduct().getSalePrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                return new OrderItemDTO(
                    item.getProduct().getId(),
                    item.getProduct().getName(),
                    item.getProduct().getSalePrice(),
                    item.getQuantity(),
                    itemTotal
                );
            }).collect(Collectors.toList());
            
            BigDecimal totalOrderValue = items.stream()
                .map(item -> item.getProduct().getSalePrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            return new OrderSaleResponseDTO(
                order.getId(),
                itemDTOs,
                totalOrderValue,
                order.getCreatedAt()
            );
        }).collect(Collectors.toList());
    }

    @Override
    public void payment(PaymentRequestDTO request) {
        orderService.payment(request.id(), request.paymentMethod(), request.amount());
    }

    @Override
    public OrderCloseResponseDTO findByIdForClose(Long id) {
        Order order = orderService.findById(id);
        return new OrderCloseResponseDTO(
            order.getId(),
            order.getTable().getId(),
            order.getStatus(),
            order.getTotalAmount(),
            order.getAmountPending(),
            order.getCreatedAt(),
            order.getUpdatedAt()
        );
    }

    @Override
    public OrderTableUpdateResponseDTO updateTable(OrderTableUpdateRequestDTO request, Long companyId) {
        
        Order order = orderService.findById(request.orderId());
        Table oldTable = order.getTable();
        
        if(!oldTable.getCompany().getId().equals(companyId)) {
            throw new MindrabarException(
                ErrorCode.CROSS_COMPANY_ACCESS,
                "Acesso negado: pedido pertence a outra empresa"
            );
        }
        
        Table newTable = tableService.findById(request.newTableId());
        
        if(!newTable.getCompany().getId().equals(companyId)) {
            throw new MindrabarException(
                ErrorCode.CROSS_COMPANY_ACCESS, 
                "Acesso negado: mesa pertence a outra empresa"
            );
        }
        
        Order updatedOrder = orderService.updateTable(request.orderId(), newTable);
        
        tableService.updateStatus(newTable.getId(), TableStatus.OCCUPIED);
        
        List<Order> ordersInOldTable = orderService.findByTable(oldTable);
        boolean hasOtherOpenOrders = ordersInOldTable.stream()
            .anyMatch(o -> !o.getId().equals(order.getId()) && o.getStatus() == OrderStatus.OPEN);
        
        if(!hasOtherOpenOrders) {
            tableService.updateStatus(oldTable.getId(), TableStatus.AVAILABLE);
        }
        
        return new me.mindra.mindrabar_api.application.dto.order.OrderTableUpdateResponseDTO(
            updatedOrder.getId(),
            oldTable.getId(),
            newTable.getId(),
            updatedOrder.getUpdatedAt()
        );
    }

    @Override
    public ItemResponseDTO addPartialPayment(AddPaymentRequestDTO request, Long companyId) {
        Item item = itemService.findById(request.itemId());
        Order order = item.getOrder();
        
        if(!order.getTable().getCompany().getId().equals(companyId)) {
            throw new MindrabarException(
                ErrorCode.CROSS_COMPANY_ACCESS, 
                "Acesso negado: pedido pertence a outra empresa"
            );
        }
        
        Item updatedItem = itemService.updatePayment(request.itemId(), request.quantityToPay());
        
        BigDecimal amountToDiscount = updatedItem.getProduct().getSalePrice()
            .multiply(BigDecimal.valueOf(request.quantityToPay()));
        orderService.removeAmountPending(order.getId(), amountToDiscount);
        
        return new ItemResponseDTO(updatedItem);
    }

    @Override
    public OrderPaymentDetailsResponseDTO getPaymentDetails(Long orderId, Long companyId) {
        Order order = orderService.findById(orderId);
        
        if(!order.getTable().getCompany().getId().equals(companyId)) {
            throw new MindrabarException(
                ErrorCode.CROSS_COMPANY_ACCESS, 
                "Acesso negado: pedido pertence a outra empresa"
            );
        }
        
        List<Item> items = itemService.findByOrder(order);
        
        BigDecimal totalAmountPaid = BigDecimal.ZERO;
        BigDecimal totalAmountPending = BigDecimal.ZERO;
        
        List<OrderPaymentDetailsResponseDTO.ItemPaymentDTO> itemPayments = items.stream()
            .map(item -> {
                BigDecimal unitPrice = item.getProduct().getSalePrice();
                BigDecimal itemTotal = unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()));
                BigDecimal itemPaid = unitPrice.multiply(BigDecimal.valueOf(item.getQuantityPaid()));
                BigDecimal itemPending = itemTotal.subtract(itemPaid);
                
                return new OrderPaymentDetailsResponseDTO.ItemPaymentDTO(
                    item.getId(),
                    item.getProduct().getId(),
                    item.getProduct().getName(),
                    item.getQuantity(),
                    item.getQuantityPaid(),
                    item.getQuantity() - item.getQuantityPaid(),
                    unitPrice,
                    itemTotal,
                    itemPaid,
                    itemPending
                );
            })
            .toList();
        
        for (OrderPaymentDetailsResponseDTO.ItemPaymentDTO itemPayment : itemPayments) {
            totalAmountPaid = totalAmountPaid.add(itemPayment.amountPaid());
            totalAmountPending = totalAmountPending.add(itemPayment.amountPending());
        }
        
        return new OrderPaymentDetailsResponseDTO(
            order.getId(),
            order.getTable().getId(),
            order.getTable().getName(),
            order.getTotalAmount().add(totalAmountPaid),
            totalAmountPaid,
            totalAmountPending,
            itemPayments
        );
    }
}