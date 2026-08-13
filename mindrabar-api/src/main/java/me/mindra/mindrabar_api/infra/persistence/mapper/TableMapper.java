package me.mindra.mindrabar_api.infra.persistence.mapper;

import me.mindra.mindrabar_api.domain.model.table.Table;
import me.mindra.mindrabar_api.infra.persistence.entity.TableEntity;

public class TableMapper {

    public static TableEntity toEntity(Table domain) {
        return new TableEntity(
            domain.getId(),
            CompanyMapper.toEntity(domain.getCompany()),
            domain.getName(),
            domain.getStatus(),
            domain.getCreatedAt(),
            domain.getUpdatedAt()
        ); 
    }

    public static Table toDomain(TableEntity entity) {
        return new Table(
            entity.getId(),
            CompanyMapper.toDomain(entity.getCompany()),
            entity.getName(),
            entity.getStatus(),
            entity.getCreatedAt(),
            entity.getUpdatedAt()
        );
    }
}
