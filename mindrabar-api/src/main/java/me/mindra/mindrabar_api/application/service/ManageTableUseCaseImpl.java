package me.mindra.mindrabar_api.application.service;

import java.util.List;
import java.util.stream.Collectors;

import me.mindra.mindrabar_api.application.dto.table.TableCreateRequestDTO;
import me.mindra.mindrabar_api.application.dto.table.TableCreateResponseDTO;
import me.mindra.mindrabar_api.application.dto.table.TableNameUpdateRequestDTO;
import me.mindra.mindrabar_api.application.dto.table.TableNameUpdateResponseDTO;
import me.mindra.mindrabar_api.application.dto.table.TableResponseDTO;
import me.mindra.mindrabar_api.application.dto.table.TableStatusUpdateRequestDTO;
import me.mindra.mindrabar_api.application.dto.table.TableStatusUpdateResponseDTO;
import me.mindra.mindrabar_api.application.port.in.ManageTableUseCase;
import me.mindra.mindrabar_api.domain.model.company.Company;
import me.mindra.mindrabar_api.domain.model.table.Table;
import me.mindra.mindrabar_api.domain.model.table.TableStatus;
import me.mindra.mindrabar_api.domain.service.CompanyService;
import me.mindra.mindrabar_api.domain.service.TableService;
import me.mindra.mindrabar_api.exception.ErrorCode;
import me.mindra.mindrabar_api.exception.MindrabarException;

public class ManageTableUseCaseImpl implements ManageTableUseCase {

    private final TableService tableService;
    private final CompanyService companyService;

    public ManageTableUseCaseImpl(TableService tableService, CompanyService companyService) {
        this.tableService = tableService;
        this.companyService = companyService;
    }

    @Override
    public TableCreateResponseDTO createTable(Long companyId, TableCreateRequestDTO request) {
        Company company = companyService.findById(companyId);
        Table table = tableService.create(
            new Table(company, request.name(), request.status())
        );
        return new TableCreateResponseDTO(
            table.getId(),
            table.getCompany().getId(),
            table.getName(),
            table.getStatus(),
            table.getCreatedAt(),
            table.getUpdatedAt()
        );
    }

    @Override
    public TableNameUpdateResponseDTO updateName(TableNameUpdateRequestDTO request) {
        Table table = tableService.updateName(request.id(), request.name());
        return new TableNameUpdateResponseDTO(
            table.getId(),
            table.getName(),
            table.getStatus(),
            table.getCompany().getId(),
            table.getUpdatedAt()
        );
    }

    @Override
    public TableStatusUpdateResponseDTO updateStatus(TableStatusUpdateRequestDTO request) {
        Table table = tableService.updateStatus(request.id(), request.status());
        return new TableStatusUpdateResponseDTO(
            table.getId(),
            table.getName(),
            table.getStatus(),
            table.getCompany().getId(),
            table.getUpdatedAt()
        );
    }

    @Override
    public void deleteTable(Long tableId) {
        tableService.deleteById(tableId);
    }

    @Override
    public List<TableResponseDTO> findAll() {
        return tableService.findAll().stream().map(this::toDto).toList();
    }

    @Override
    public TableResponseDTO findById(Long id) {
        return toDto(tableService.findById(id));
    }

    @Override
    public TableResponseDTO findByName(String name) {
        return toDto(tableService.findByName(name));
    }

    @Override
    public List<TableResponseDTO> findByStatus(TableStatus status) {
        return tableService.findByStatus(status).stream().map(this::toDto).toList();
    }

    private TableResponseDTO toDto(Table table) {
        return new TableResponseDTO(
            table.getId(),
            table.getName(),
            table.getStatus(),
            table.getCompany().getId(),
            table.getCreatedAt(),
            table.getUpdatedAt()
        );
    }

    @Override
    public List<TableResponseDTO> findByCompany(Long companyId) {
        if(companyId == null || companyId == 0) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "ID da empresa não pode ser nulo");
        }
        Company company = companyService.findById(companyId);
        return tableService.findByCompany(company)
        .stream()
        .map(this::toDto)
        .collect(Collectors.toList());
    }
}