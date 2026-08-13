package me.mindra.mindrabar_api.application.service;

import me.mindra.mindrabar_api.application.dto.company.CompanyCreateRequestDTO;
import me.mindra.mindrabar_api.application.dto.company.CompanyCreateResponseDTO;
import me.mindra.mindrabar_api.application.dto.company.CompanyDetailsResponseDTO;
import me.mindra.mindrabar_api.application.port.in.ManageCompanyUseCase;
import me.mindra.mindrabar_api.domain.model.company.Company;
import me.mindra.mindrabar_api.domain.service.CompanyService;
import me.mindra.mindrabar_api.exception.ErrorCode;
import me.mindra.mindrabar_api.exception.MindrabarException;

public class ManageCompanyUseCaseImpl implements ManageCompanyUseCase {
    
    private final CompanyService companyService;
    public ManageCompanyUseCaseImpl(CompanyService companyService) {
        this.companyService = companyService;
    }

    public CompanyCreateResponseDTO createCompany(CompanyCreateRequestDTO request) {
        Company company = companyService.create(request.toDomain());
        return new CompanyCreateResponseDTO(company.getId());
    }

    @Override
    public CompanyDetailsResponseDTO getCompanyDetails(Long companyId, Long userCompanyId) {
        if(!companyId.equals(userCompanyId)) {
            throw new MindrabarException(ErrorCode.CROSS_COMPANY_ACCESS, "Acesso negado a empresa de outro usuário");
        }
        Company company = companyService.findById(companyId);
        return new CompanyDetailsResponseDTO(
            company.getId(),
            company.getName(),
            company.getDescription(),
            company.getProduct(),
            company.getPlan(),
            company.getCnpj()
        );
    }
}
