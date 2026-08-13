package me.mindra.mindrabar_api.web;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import me.mindra.mindrabar_api.application.dto.order.*;
import me.mindra.mindrabar_api.application.dto.item.AddPaymentRequestDTO;
import me.mindra.mindrabar_api.application.dto.item.ItemResponseDTO;
import me.mindra.mindrabar_api.application.port.in.ManageOrderUseCase;
import me.mindra.mindrabar_api.domain.model.order.OrderStatus;
import me.mindra.mindrabar_api.infra.persistence.security.SecurityUtils;

@RestController
@RequestMapping("/order")
@Tag(name = "Order", description = "Endpoints para gerenciar pedidos")
public class OrderController {

    private final ManageOrderUseCase manageOrderUseCase;

    public OrderController(ManageOrderUseCase manageOrderUseCase) {
        this.manageOrderUseCase = manageOrderUseCase;
    }

    @Operation(summary = "Listar todos os pedidos")
    @GetMapping
    public List<OrderResponseDTO> getAllOrders() {
        return manageOrderUseCase.findAll(SecurityUtils.getCurrentCompanyId());
    }

    @Operation(summary = "Buscar pedido por ID")
    @GetMapping("/{id}")
    public OrderResponseDTO getOrderById(@PathVariable Long id) {
        return manageOrderUseCase.findById(id);
    }

    @Operation(summary = "Buscar pedido por ID para fechamento")
    @GetMapping("/{id}/close")
    public OrderCloseResponseDTO getOrderByIdForClose(@PathVariable Long id) {
        return manageOrderUseCase.findByIdForClose(id);
    }

    @Operation(summary = "Listar pedidos por mesa")
    @GetMapping("/table/{tableId}")
    public List<OrderResponseDTO> getOrdersByTable(@PathVariable Long tableId) {
        return manageOrderUseCase.findByTable(tableId);
    }

    @Operation(summary = "Listar pedidos por status")
    @GetMapping("/status/{status}")
    public List<OrderResponseDTO> getOrdersByStatus(@PathVariable OrderStatus status) {
        return manageOrderUseCase.findByStatusAndCompanyId(status, SecurityUtils.getCurrentCompanyId());
    }

    @Operation(summary = "Criar um novo pedido")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderCreateResponseDTO createOrder(@RequestBody OrderCreateRequestDTO request) {
        return manageOrderUseCase.createOrder(request);
    }

    @Operation(summary = "Atualizar status do pedido")
    @PatchMapping("/{id}/status")
    public OrderStatusUpdateResponseDTO updateOrderStatus(
            @PathVariable Long id,
            @RequestBody OrderStatusUpdateRequestDTO request) {

        OrderStatusUpdateRequestDTO dto = new OrderStatusUpdateRequestDTO(id, request.status());
        return manageOrderUseCase.updateStatus(dto);
    }

    @Operation(summary = "Deletar um pedido")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public void deleteOrder(@PathVariable Long id) {
        manageOrderUseCase.deleteOrder(id);
    }
    
    @Operation(summary = "Listar pedidos por dia")
    @GetMapping("/day")
    public List<OrderSaleResponseDTO> getOrdersByDay(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate day) {
        return manageOrderUseCase.findByDayAndCompanyId(day, SecurityUtils.getCurrentCompanyId());
    }

    @Operation(summary = "Pagamento de um pedido")
    @PostMapping("/{id}/payment")
    public void paymentOrder(@PathVariable Long id, @RequestBody PaymentRequestDTO request) {
        manageOrderUseCase.payment(new PaymentRequestDTO(id, request.paymentMethod(), request.amount()));
    }

    @Operation(summary = "Alterar mesa de um pedido")
    @PatchMapping("/{id}/table")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public OrderTableUpdateResponseDTO updateOrderTable(
            @PathVariable Long id,
            @RequestBody OrderTableUpdateRequestDTO request) {
        
        OrderTableUpdateRequestDTO dto = 
            new OrderTableUpdateRequestDTO(id, request.newTableId());
        return manageOrderUseCase.updateTable(dto, SecurityUtils.getCurrentCompanyId());
    }

    @Operation(summary = "Adicionar pagamento parcial a um item do pedido")
    @PostMapping("/{orderId}/items/{itemId}/payment")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ItemResponseDTO addPartialPayment(
            @PathVariable Long orderId,
            @PathVariable Long itemId,
            @RequestBody AddPaymentRequestDTO request) {
        
        AddPaymentRequestDTO dto = 
            new AddPaymentRequestDTO(itemId, request.quantityToPay(), request.paymentMethod());
        return manageOrderUseCase.addPartialPayment(dto, SecurityUtils.getCurrentCompanyId());
    }

    @Operation(summary = "Obter detalhes de pagamento do pedido")
    @GetMapping("/{id}/payment-details")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public OrderPaymentDetailsResponseDTO getPaymentDetails(@PathVariable Long id) {
        return manageOrderUseCase.getPaymentDetails(id, SecurityUtils.getCurrentCompanyId());
    }
}
