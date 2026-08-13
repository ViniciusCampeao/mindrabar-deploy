package me.mindra.mindrabar_api.application.port.in;

import me.mindra.mindrabar_api.application.dto.company.CompanyCreateRequestDTO;
import me.mindra.mindrabar_api.application.dto.company.CompanyCreateResponseDTO;
import me.mindra.mindrabar_api.application.dto.company.CompanyDetailsResponseDTO;

public interface ManageCompanyUseCase {
    CompanyCreateResponseDTO createCompany(CompanyCreateRequestDTO request);
    CompanyDetailsResponseDTO getCompanyDetails(Long companyId, Long userCompanyId);
}
