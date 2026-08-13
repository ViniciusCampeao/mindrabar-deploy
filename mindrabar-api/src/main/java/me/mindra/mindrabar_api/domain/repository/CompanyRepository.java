package me.mindra.mindrabar_api.domain.repository;

import java.util.List;
import java.util.Optional;

import me.mindra.mindrabar_api.domain.model.company.Company;

public interface CompanyRepository {

    List<Company> findAll();
    Optional<Company> findById(Long id);
    Optional<Company> findByName(String name);
    List<Company> findByProduct(String product);
    List<Company> findByPlan(String plan);
    Company save(Company company);
    void deleteById(Long id);
}
