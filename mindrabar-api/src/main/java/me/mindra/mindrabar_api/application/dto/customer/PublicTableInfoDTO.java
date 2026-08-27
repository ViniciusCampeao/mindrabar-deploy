package me.mindra.mindrabar_api.application.dto.customer;

public record PublicTableInfoDTO(
    Long tableId,
    String tableName,
    Long companyId,
    String companyName
) {
}
