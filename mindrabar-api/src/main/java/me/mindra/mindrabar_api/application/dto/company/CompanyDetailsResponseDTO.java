package me.mindra.mindrabar_api.application.dto.company;

import me.mindra.mindrabar_api.domain.model.company.Company;
import me.mindra.mindrabar_api.domain.model.company.ProductType;
import me.mindra.mindrabar_api.domain.model.company.SubscriptionPlan;

public record CompanyDetailsResponseDTO(
    Long id,
    String name,
    String description,
    ProductType product,
    SubscriptionPlan plan,
    String cnpj
) {
    public Company toDomain() {
        return new Company(name, description, product, plan, cnpj);
    }
}
