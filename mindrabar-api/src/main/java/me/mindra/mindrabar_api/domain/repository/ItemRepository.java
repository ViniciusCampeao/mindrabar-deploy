package me.mindra.mindrabar_api.domain.repository;

import java.util.List;
import java.util.Optional;

import me.mindra.mindrabar_api.domain.model.item.Item;
import me.mindra.mindrabar_api.domain.model.item.ItemStatus;
import me.mindra.mindrabar_api.domain.model.order.Order;
import me.mindra.mindrabar_api.domain.model.product.Product;
import me.mindra.mindrabar_api.domain.model.user.User;

public interface ItemRepository {
    Optional<Item> findById(Long id);
    List<Item> findByCompanyId(Long companyId);
    List<Item> findByOrder(Order order);
    List<Item> findByProduct(Product product);
    List<Item> findByUser(User user);
    List<Item> findByStatusAndCompanyId(ItemStatus status, Long companyId);
    Optional<Item> findByOrderAndProduct(Order order, Product product);
    Item save(Item item);
    void deleteById(Long id);
    List<Item> findByProductId(Long productId);
}
