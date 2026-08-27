package me.mindra.mindrabar_api.application.port.in;

import java.util.List;

import me.mindra.mindrabar_api.application.dto.customer.BillResponseDTO;
import me.mindra.mindrabar_api.application.dto.customer.PublicTableInfoDTO;
import me.mindra.mindrabar_api.application.dto.customer.TableSessionResponseDTO;
import me.mindra.mindrabar_api.application.dto.customer.TableSessionStartRequestDTO;
import me.mindra.mindrabar_api.application.dto.customer.TableSessionStartResponseDTO;
import me.mindra.mindrabar_api.application.dto.product.ProductResponseDTO;

public interface ManageTableSessionUseCase {
    TableSessionStartResponseDTO startSession(String tableToken, TableSessionStartRequestDTO request);
    PublicTableInfoDTO getTableInfoByToken(String tableToken);
    List<ProductResponseDTO> getMenuByToken(String tableToken);
    List<TableSessionResponseDTO> findPendingByCompanyId(Long companyId);
    long countPendingByCompanyId(Long companyId);
    TableSessionResponseDTO confirmSession(Long sessionId, Long staffUserId);
    void closeSessionsByTable(Long tableId);
    BillResponseDTO getBillByTableId(Long tableId);
    BillResponseDTO getBillBySessionToken(String sessionToken);
}
