package me.mindra.mindrabar_api.application.dto.item;

import me.mindra.mindrabar_api.domain.model.item.Item;
import me.mindra.mindrabar_api.domain.model.item.ItemStatus;
import me.mindra.mindrabar_api.domain.model.order.Order;
import me.mindra.mindrabar_api.domain.model.product.Product;
import me.mindra.mindrabar_api.domain.model.user.User;

public record ItemCreateRequestDTO(
    Long userId,
    Long orderId,
    Long productId,
    int quantity,
    ItemStatus status
) {
    public Item toDomain(User user, Order order, Product product) {
        return new Item(user, order, product, quantity, status);
    }
}
