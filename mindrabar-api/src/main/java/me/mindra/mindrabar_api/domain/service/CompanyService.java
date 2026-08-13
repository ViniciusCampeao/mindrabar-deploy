package me.mindra.mindrabar_api.domain.service;

import me.mindra.mindrabar_api.domain.model.company.Company;
import me.mindra.mindrabar_api.domain.repository.CompanyRepository;
import me.mindra.mindrabar_api.exception.ErrorCode;
import me.mindra.mindrabar_api.exception.MindrabarException;

public class CompanyService {
    
    private final CompanyRepository companyRepository;
    
    public CompanyService(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    public Company create(Company company) {
        Company savedCompany = companyRepository.save(company);
        if(savedCompany == null) {
            throw new MindrabarException(ErrorCode.DATABASE_ERROR, "Falha ao salvar empresa");
        }

        return savedCompany;
    }

    public Company findById(Long companyId) {
        return companyRepository.findById(companyId)
            .orElseThrow(() -> new MindrabarException(ErrorCode.COMPANY_NOT_FOUND, "Empresa não encontrada"));
    }
}
