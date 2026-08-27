package me.mindra.mindrabar_api.infra.persistence.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import me.mindra.mindrabar_api.domain.model.item.ItemStatus;
import me.mindra.mindrabar_api.infra.persistence.entity.ItemEntity;
import me.mindra.mindrabar_api.infra.persistence.entity.OrderEntity;
import me.mindra.mindrabar_api.infra.persistence.entity.ProductEntity;
import me.mindra.mindrabar_api.infra.persistence.entity.UserEntity;

public interface ItemJpaRepository extends JpaRepository<ItemEntity, Long> {
    List<ItemEntity> findByOrder(OrderEntity order);
    List<ItemEntity> findByProduct(ProductEntity product);
    List<ItemEntity> findByUser(UserEntity user);
    List<ItemEntity> findByStatusAndOrder_Table_Company_Id(ItemStatus status, Long companyId);
    Optional<ItemEntity> findByOrderAndProduct(OrderEntity order, ProductEntity product);
    List<ItemEntity> findByOrder_Table_Company_Id(Long companyId);
    List<ItemEntity> findByProductId(Long productId);
    List<ItemEntity> findByTableSession_Id(Long tableSessionId);
}
