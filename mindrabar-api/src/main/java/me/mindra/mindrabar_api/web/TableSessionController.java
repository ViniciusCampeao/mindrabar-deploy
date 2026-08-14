package me.mindra.mindrabar_api.web;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import me.mindra.mindrabar_api.application.dto.customer.BillResponseDTO;
import me.mindra.mindrabar_api.application.dto.customer.TableSessionResponseDTO;
import me.mindra.mindrabar_api.application.port.in.ManageTableSessionUseCase;
import me.mindra.mindrabar_api.infra.persistence.security.SecurityUtils;

@RestController
@RequestMapping("/table-session")
@Tag(name = "Table Sessions", description = "Endpoints para a equipe gerenciar as sessões de clientes vindas do QR Code")
public class TableSessionController {

    private final ManageTableSessionUseCase manageTableSessionUseCase;

    public TableSessionController(ManageTableSessionUseCase manageTableSessionUseCase) {
        this.manageTableSessionUseCase = manageTableSessionUseCase;
    }

    @Operation(summary = "Listar sessões de clientes aguardando confirmação")
    @GetMapping("/pending")
    public List<TableSessionResponseDTO> getPending() {
        return manageTableSessionUseCase.findPendingByCompanyId(SecurityUtils.getCurrentCompanyId());
    }

    @Operation(summary = "Contar sessões de clientes aguardando confirmação")
    @GetMapping("/pending/count")
    public long getPendingCount() {
        return manageTableSessionUseCase.countPendingByCompanyId(SecurityUtils.getCurrentCompanyId());
    }

    @Operation(summary = "Confirmar uma sessão de cliente")
    @PatchMapping("/{id}/confirm")
    public TableSessionResponseDTO confirm(@PathVariable Long id) {
        return manageTableSessionUseCase.confirmSession(id, SecurityUtils.getCurrentUserId());
    }

    @Operation(summary = "Encerrar todas as sessões de clientes de uma mesa (ao fechar a conta)")
    @PostMapping("/table/{tableId}/close")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void closeByTable(@PathVariable Long tableId) {
        manageTableSessionUseCase.closeSessionsByTable(tableId);
    }

    @Operation(summary = "Consultar a conta de uma mesa")
    @GetMapping("/table/{tableId}/bill")
    public BillResponseDTO getBillByTable(@PathVariable Long tableId) {
        return manageTableSessionUseCase.getBillByTableId(tableId);
    }
}
