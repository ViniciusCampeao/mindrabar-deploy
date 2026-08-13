package me.mindra.mindrabar_api.web;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import me.mindra.mindrabar_api.application.dto.table.*;
import me.mindra.mindrabar_api.application.port.in.ManageTableUseCase;
import me.mindra.mindrabar_api.domain.model.table.TableStatus;
import me.mindra.mindrabar_api.infra.persistence.security.SecurityUtils;

@RestController
@RequestMapping("/tables")
@Tag(name = "Tables", description = "Endpoints para gerenciar mesas")
public class TableController {

    private final ManageTableUseCase manageTableUseCase;

    public TableController(ManageTableUseCase manageTableUseCase) {
        this.manageTableUseCase = manageTableUseCase;
    }

    @Operation(summary = "Listar todas as mesas")
    @GetMapping
    public List<TableResponseDTO> getAllTables() {
        return manageTableUseCase.findByCompany(SecurityUtils.getCurrentCompanyId());
    }

    @Operation(summary = "Buscar mesa por ID")
    @GetMapping("/{id}")
    public TableResponseDTO getTableById(@PathVariable Long id) {
        return manageTableUseCase.findById(id);
    }

    @Operation(summary = "Buscar mesa por nome")
    @GetMapping("/name/{name}")
    public TableResponseDTO getTableByName(@PathVariable String name) {
        return manageTableUseCase.findByName(name);
    }

    @Operation(summary = "Listar mesas por status")
    @GetMapping("/status/{status}")
    public List<TableResponseDTO> getTablesByStatus(@PathVariable TableStatus status) {
        return manageTableUseCase.findByStatus(status);
    }

    @Operation(summary = "Criar uma nova mesa")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TableCreateResponseDTO createTable(@RequestBody TableCreateRequestDTO request) {
        return manageTableUseCase.createTable(SecurityUtils.getCurrentCompanyId(), request);
    }

    @Operation(summary = "Atualizar nome da mesa")
    @PatchMapping("/{id}/name")
    public TableNameUpdateResponseDTO updateTableName(
            @PathVariable Long id,
            @RequestBody TableNameUpdateRequestDTO request) {

        TableNameUpdateRequestDTO dto = new TableNameUpdateRequestDTO(id, request.name());
        return manageTableUseCase.updateName(dto);
    }

    @Operation(summary = "Atualizar status da mesa")
    @PatchMapping("/{id}/status")
    public TableStatusUpdateResponseDTO updateTableStatus(
            @PathVariable Long id,
            @RequestBody TableStatusUpdateRequestDTO request) {

        TableStatusUpdateRequestDTO dto = new TableStatusUpdateRequestDTO(id, request.status());
        return manageTableUseCase.updateStatus(dto);
    }

    @Operation(summary = "Deletar uma mesa")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTable(@PathVariable Long id) {
        manageTableUseCase.deleteTable(id);
    }
}