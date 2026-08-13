package me.mindra.mindrabar_api.infra.persistence.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import me.mindra.mindrabar_api.domain.model.order.OrderStatus;
import me.mindra.mindrabar_api.infra.persistence.entity.OrderEntity;
import me.mindra.mindrabar_api.infra.persistence.entity.TableEntity;

public interface OrderJpaRepository extends JpaRepository<OrderEntity, Long> {
    List<OrderEntity> findByTable(TableEntity table);
    List<OrderEntity> findByStatusAndTable_Company_Id(OrderStatus status, Long companyId);
    @Query("""
        SELECT o
        FROM OrderEntity o
        WHERE o.status = :status
        AND o.table.company.id = :companyId
        AND o.createdAt >= :startOfDay
        AND o.createdAt <= :endOfDay
    """)
    List<OrderEntity> findByDayAndStatusAndCompany(
        @Param("status") OrderStatus status,
        @Param("companyId") Long companyId,
        @Param("startOfDay") LocalDateTime startOfDay,
        @Param("endOfDay") LocalDateTime endOfDay
    );
    @Query("""
        SELECT DISTINCT o
        FROM OrderEntity o
        INNER JOIN ItemEntity i ON i.order.id = o.id
        WHERE o.table.company.id = :companyId
        AND o.createdAt >= :startOfDay
        AND o.createdAt <= :endOfDay
    """)
    List<OrderEntity> findByDayAndCompany(
        @Param("companyId") Long companyId,
        @Param("startOfDay") LocalDateTime startOfDay,
        @Param("endOfDay") LocalDateTime endOfDay
    );
    List<OrderEntity> findByTable_Company_Id(Long companyId);
}
