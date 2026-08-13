package me.mindra.mindrabar_api.application.port.in;

import java.time.LocalDate;
import java.util.List;

import me.mindra.mindrabar_api.application.dto.order.OrderCloseResponseDTO;
import me.mindra.mindrabar_api.application.dto.order.OrderCreateRequestDTO;
import me.mindra.mindrabar_api.application.dto.order.OrderCreateResponseDTO;
import me.mindra.mindrabar_api.application.dto.order.OrderPaymentDetailsResponseDTO;
import me.mindra.mindrabar_api.application.dto.order.OrderResponseDTO;
import me.mindra.mindrabar_api.application.dto.order.OrderSaleResponseDTO;
import me.mindra.mindrabar_api.application.dto.order.OrderStatusUpdateRequestDTO;
import me.mindra.mindrabar_api.application.dto.order.OrderStatusUpdateResponseDTO;
import me.mindra.mindrabar_api.application.dto.order.OrderTableUpdateRequestDTO;
import me.mindra.mindrabar_api.application.dto.order.OrderTableUpdateResponseDTO;
import me.mindra.mindrabar_api.application.dto.order.PaymentRequestDTO;
import me.mindra.mindrabar_api.application.dto.item.AddPaymentRequestDTO;
import me.mindra.mindrabar_api.application.dto.item.ItemResponseDTO;
import me.mindra.mindrabar_api.domain.model.order.OrderStatus;

public interface ManageOrderUseCase {
    
    OrderCreateResponseDTO createOrder(OrderCreateRequestDTO request);
    OrderStatusUpdateResponseDTO updateStatus(OrderStatusUpdateRequestDTO request);
    void deleteOrder(Long orderId);

    List<OrderResponseDTO> findAll(Long companyId);
    OrderResponseDTO findById(Long id);
    List<OrderResponseDTO> findByTable(Long tableId);
    List<OrderResponseDTO> findByStatusAndCompanyId(OrderStatus status, Long companyId);
    List<OrderResponseDTO> findByDayAndStatusAndCompanyId(LocalDate day, OrderStatus status, Long companyId);
    List<OrderSaleResponseDTO> findByDayAndCompanyId(LocalDate day, Long companyId);
    void payment(PaymentRequestDTO request);
    OrderCloseResponseDTO findByIdForClose(Long id);
    OrderTableUpdateResponseDTO updateTable(OrderTableUpdateRequestDTO request, Long companyId);
    ItemResponseDTO addPartialPayment(AddPaymentRequestDTO request, Long companyId);
    OrderPaymentDetailsResponseDTO getPaymentDetails(Long orderId, Long companyId);
}
