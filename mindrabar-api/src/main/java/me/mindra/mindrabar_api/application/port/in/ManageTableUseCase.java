package me.mindra.mindrabar_api.application.port.in;

import java.util.List;

import me.mindra.mindrabar_api.application.dto.table.TableCreateRequestDTO;
import me.mindra.mindrabar_api.application.dto.table.TableCreateResponseDTO;
import me.mindra.mindrabar_api.application.dto.table.TableNameUpdateRequestDTO;
import me.mindra.mindrabar_api.application.dto.table.TableNameUpdateResponseDTO;
import me.mindra.mindrabar_api.application.dto.table.TableResponseDTO;
import me.mindra.mindrabar_api.application.dto.table.TableStatusUpdateResponseDTO;
import me.mindra.mindrabar_api.application.dto.table.TableStatusUpdateRequestDTO;
import me.mindra.mindrabar_api.domain.model.table.TableStatus;

public interface ManageTableUseCase {
    TableCreateResponseDTO createTable(Long companyId, TableCreateRequestDTO request);
    TableNameUpdateResponseDTO updateName(TableNameUpdateRequestDTO request);
    TableStatusUpdateResponseDTO updateStatus(TableStatusUpdateRequestDTO request);
    void deleteTable(Long tableId);

    List<TableResponseDTO> findAll();
    TableResponseDTO findById(Long id);
    TableResponseDTO findByName(String id);
    List<TableResponseDTO> findByStatus(TableStatus status);
    List<TableResponseDTO> findByCompany(Long companyId);
    
}
