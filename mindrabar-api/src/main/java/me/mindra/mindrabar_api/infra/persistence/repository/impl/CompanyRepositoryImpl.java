package me.mindra.mindrabar_api.infra.persistence.repository.impl;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import me.mindra.mindrabar_api.domain.model.company.Company;
import me.mindra.mindrabar_api.domain.repository.CompanyRepository;
import me.mindra.mindrabar_api.infra.persistence.mapper.CompanyMapper;
import me.mindra.mindrabar_api.infra.persistence.repository.CompanyJpaRepository;

@Component
public class CompanyRepositoryImpl implements CompanyRepository {

    private final CompanyJpaRepository repository;

    public CompanyRepositoryImpl(CompanyJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<Company> findAll() {
        return repository.findAll()
            .stream()
            .map(CompanyMapper::toDomain)
            .collect(Collectors.toList());
    }

    @Override
    public Optional<Company> findById(Long id) {
        return repository.findById(id).map(CompanyMapper::toDomain);
    }

    @Override
    public Optional<Company> findByName(String name) {
        return repository.findByName(name).map(CompanyMapper::toDomain);
    }

    @Override
    public List<Company> findByProduct(String product) {
        return repository.findByProduct(product)
            .stream()
            .map(CompanyMapper::toDomain)
            .collect(Collectors.toList());
    }

    @Override
    public List<Company> findByPlan(String plan) {
        return repository.findByPlan(plan)
            .stream()
            .map(CompanyMapper::toDomain)
            .collect(Collectors.toList());
    }

    @Override
    public Company save(Company company) {
        return CompanyMapper.toDomain(repository.save(CompanyMapper.toEntity(company)));
    }

    @Override
    public void deleteById(Long id) {
        repository.deleteById(id);
    }

}
