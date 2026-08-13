package me.mindra.mindrabar_api.web;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import me.mindra.mindrabar_api.application.dto.item.*;
import me.mindra.mindrabar_api.application.port.in.ManageItemUseCase;
import me.mindra.mindrabar_api.domain.model.item.ItemStatus;
import me.mindra.mindrabar_api.infra.persistence.security.SecurityUtils;

@RestController
@RequestMapping("/item")
@Tag(name = "Items", description = "Endpoints para gerenciar itens")
public class ItemController {

    private final ManageItemUseCase manageItemUseCase;

    public ItemController(ManageItemUseCase manageItemUseCase) {
        this.manageItemUseCase = manageItemUseCase;
    }

    @Operation(summary = "Listar todos os itens")
    @GetMapping
    public List<ItemResponseDTO> getAllItems() {
        return manageItemUseCase.findAll(SecurityUtils.getCurrentCompanyId());
    }

    @Operation(summary = "Buscar item por ID")
    @GetMapping("/{id}")
    public ItemResponseDTO getItemById(@PathVariable Long id) {
        return manageItemUseCase.findItemById(id);
    }

    @Operation(summary = "Listar itens de um pedido")
    @GetMapping("/order/{orderId}")
    public List<ItemResponseDTO> getItemsByOrder(@PathVariable Long orderId) {
        return manageItemUseCase.findItemsByOrder(orderId);
    }

    @Operation(summary = "Listar itens de um usuário")
    @GetMapping("/user/{userId}")
    public List<ItemResponseDTO> getItemsByUser(@PathVariable Long userId) {
        return manageItemUseCase.findItemsByUser(userId);
    }

    @Operation(summary = "Listar itens de um produto")
    @GetMapping("/product/{productId}")
    public List<ItemResponseDTO> getItemsByProduct(@PathVariable Long productId) {
        return manageItemUseCase.findItemsByProduct(productId);
    }
    
    @Operation(summary = "Listar itens por status")
    @GetMapping("/status/{status}")
    public List<ItemQueueResponseDTO> getItemsByStatus(@PathVariable ItemStatus status) {
        return manageItemUseCase.findItemByStatusAndCompanyId(status, SecurityUtils.getCurrentCompanyId());
    }

    @Operation(summary = "Criar um novo item")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ItemCreateResponseDTO createItem(@RequestBody ItemCreateRequestDTO request) {
        return manageItemUseCase.createItem(request);
    }

    @Operation(summary = "Atualizar status de um item")
    @PatchMapping("/{id}/status")
    public ItemStatusUpdateResponseDTO updateStatus(
            @PathVariable Long id,
            @RequestBody ItemStatusUpdateRequestDTO request) {

        ItemStatusUpdateRequestDTO dto = new ItemStatusUpdateRequestDTO(id, request.status());
        return manageItemUseCase.updateStatus(dto);
    }
    
    @Operation(summary = "Lista o valor total de um pedido")
    @GetMapping("/total/{order}")
    public BigDecimal getTotalAmount(@PathVariable Long orderId) {

        return manageItemUseCase.getTotalAmount(orderId);
    }

    @Operation(summary = "Deletar um item")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public void deleteItem(@PathVariable Long id) {
        manageItemUseCase.deleteItem(id);
    }
}