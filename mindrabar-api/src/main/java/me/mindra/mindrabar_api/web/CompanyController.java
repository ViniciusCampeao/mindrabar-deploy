package me.mindra.mindrabar_api.web;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import me.mindra.mindrabar_api.application.dto.company.CompanyCreateRequestDTO;
import me.mindra.mindrabar_api.application.dto.company.CompanyCreateResponseDTO;
import me.mindra.mindrabar_api.application.dto.company.CompanyDetailsResponseDTO;
import me.mindra.mindrabar_api.application.port.in.ManageCompanyUseCase;
import me.mindra.mindrabar_api.infra.persistence.security.SecurityUtils;

@RestController
@RequestMapping("/company")
@Tag(name = "Companies", description = "Endpoints para gerenciar empresas")
public class CompanyController {

    private final ManageCompanyUseCase manageCompanyUseCase;

    public CompanyController(ManageCompanyUseCase manageCompanyUseCase) {
        this.manageCompanyUseCase = manageCompanyUseCase;
    }

    @Operation(summary = "Criar uma nova empresa")
    @PostMapping("/create")
    @ResponseStatus(HttpStatus.CREATED)
    public CompanyCreateResponseDTO createCompany(@RequestBody CompanyCreateRequestDTO request) {
        return manageCompanyUseCase.createCompany(request);
    }

    @Operation(summary = "Obter detalhes da empresa")
    @GetMapping("/details")
    public CompanyDetailsResponseDTO getCompanyDetails() {
        Long companyId = SecurityUtils.getCurrentCompanyId();
        return manageCompanyUseCase.getCompanyDetails(companyId, companyId);
    }
}
