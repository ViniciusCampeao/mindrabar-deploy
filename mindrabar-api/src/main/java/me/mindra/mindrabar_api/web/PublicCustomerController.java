package me.mindra.mindrabar_api.web;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import me.mindra.mindrabar_api.application.dto.customer.BillResponseDTO;
import me.mindra.mindrabar_api.application.dto.customer.CustomerOrderItemRequestDTO;
import me.mindra.mindrabar_api.application.dto.customer.PublicTableInfoDTO;
import me.mindra.mindrabar_api.application.dto.customer.TableSessionStartRequestDTO;
import me.mindra.mindrabar_api.application.dto.customer.TableSessionStartResponseDTO;
import me.mindra.mindrabar_api.application.dto.item.ItemCreateResponseDTO;
import me.mindra.mindrabar_api.application.dto.item.SessionItemStatusDTO;
import me.mindra.mindrabar_api.application.dto.product.ProductResponseDTO;
import me.mindra.mindrabar_api.application.port.in.ManageItemUseCase;
import me.mindra.mindrabar_api.application.port.in.ManageTableSessionUseCase;

@RestController
@RequestMapping("/public")
@Tag(name = "Public Customer Ordering", description = "Endpoints públicos para o fluxo de cardápio via QR Code")
public class PublicCustomerController {

    private final ManageTableSessionUseCase manageTableSessionUseCase;
    private final ManageItemUseCase manageItemUseCase;

    public PublicCustomerController(ManageTableSessionUseCase manageTableSessionUseCase, ManageItemUseCase manageItemUseCase) {
        this.manageTableSessionUseCase = manageTableSessionUseCase;
        this.manageItemUseCase = manageItemUseCase;
    }

    @Operation(summary = "Buscar informações da mesa pelo token do QR Code")
    @GetMapping("/tables/{qrToken}")
    public PublicTableInfoDTO getTableInfo(@PathVariable String qrToken) {
        return manageTableSessionUseCase.getTableInfoByToken(qrToken);
    }

    @Operation(summary = "Listar cardápio da empresa dona da mesa")
    @GetMapping("/tables/{qrToken}/menu")
    public List<ProductResponseDTO> getMenu(@PathVariable String qrToken) {
        return manageTableSessionUseCase.getMenuByToken(qrToken);
    }

    @Operation(summary = "Iniciar uma sessão de cliente na mesa (nome + telefone)")
    @PostMapping("/tables/{qrToken}/sessions")
    @ResponseStatus(HttpStatus.CREATED)
    public TableSessionStartResponseDTO startSession(@PathVariable String qrToken, @RequestBody TableSessionStartRequestDTO request) {
        return manageTableSessionUseCase.startSession(qrToken, request);
    }

    @Operation(summary = "Fazer um pedido dentro de uma sessão de cliente")
    @PostMapping("/sessions/{sessionToken}/items")
    @ResponseStatus(HttpStatus.CREATED)
    public ItemCreateResponseDTO createItem(@PathVariable String sessionToken, @RequestBody CustomerOrderItemRequestDTO request) {
        return manageItemUseCase.createItemForSession(sessionToken, request);
    }

    @Operation(summary = "Consultar a conta da mesa (todos os pedidos, de todas as sessões)")
    @GetMapping("/sessions/{sessionToken}/bill")
    public BillResponseDTO getBill(@PathVariable String sessionToken) {
        return manageTableSessionUseCase.getBillBySessionToken(sessionToken);
    }

    @Operation(summary = "Consultar o status dos itens pedidos nesta sessão de cliente")
    @GetMapping("/sessions/{sessionToken}/items")
    public List<SessionItemStatusDTO> getSessionItems(@PathVariable String sessionToken) {
        return manageItemUseCase.findItemsBySession(sessionToken);
    }
}
