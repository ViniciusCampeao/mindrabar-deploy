package me.mindra.mindrabar_api.infra.persistence.repository.impl;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import me.mindra.mindrabar_api.domain.model.item.Item;
import me.mindra.mindrabar_api.domain.model.item.ItemStatus;
import me.mindra.mindrabar_api.domain.model.order.Order;
import me.mindra.mindrabar_api.domain.model.product.Product;
import me.mindra.mindrabar_api.domain.model.user.User;
import me.mindra.mindrabar_api.domain.repository.ItemRepository;
import me.mindra.mindrabar_api.infra.persistence.mapper.ItemMapper;
import me.mindra.mindrabar_api.infra.persistence.mapper.OrderMapper;
import me.mindra.mindrabar_api.infra.persistence.mapper.ProductMapper;
import me.mindra.mindrabar_api.infra.persistence.mapper.UserMapper;
import me.mindra.mindrabar_api.infra.persistence.repository.ItemJpaRepository;

@Component
public class ItemRepositoryImpl implements ItemRepository {

    private final ItemJpaRepository repository;

    public ItemRepositoryImpl(ItemJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    public Optional<Item> findById(Long id) {
        return repository.findById(id)
            .map(ItemMapper::toDomain);
    }

    @Override
    public List<Item> findByOrder(Order order) {
        return repository.findByOrder(OrderMapper.toEntity(order)).stream()
            .map(ItemMapper::toDomain)
            .collect(Collectors.toList());
    }

    @Override
    public List<Item> findByProduct(Product product) {
        return repository.findByProduct(ProductMapper.toEntity(product)).stream()
            .map(ItemMapper::toDomain)
            .collect(Collectors.toList());
    }

    @Override
    public List<Item> findByUser(User user) {
        return repository.findByUser(UserMapper.toEntity(user)).stream()
            .map(ItemMapper::toDomain)
            .collect(Collectors.toList());
    }

    @Override
    public List<Item> findByStatusAndCompanyId(ItemStatus status, Long companyId) {
        return repository.findByStatusAndOrder_Table_Company_Id(status, companyId).stream()
            .map(ItemMapper::toDomain)
            .collect(Collectors.toList());
    }

    @Override
    public Optional<Item> findByOrderAndProduct(Order order, Product product) {
        return repository.findByOrderAndProduct(OrderMapper.toEntity(order), ProductMapper.toEntity(product))
            .map(ItemMapper::toDomain);
    }

    @Override
    public Item save(Item item) {
        return ItemMapper.toDomain(repository.save(ItemMapper.toEntity(item)));
    }

    @Override
    public void deleteById(Long id) {
        repository.deleteById(id);
    }

    @Override
    public List<Item> findByCompanyId(Long companyId) {
        return repository.findByOrder_Table_Company_Id(companyId)
            .stream()
            .map(ItemMapper::toDomain)
            .collect(Collectors.toList());
    }

    @Override
    public List<Item> findByProductId(Long productId) {
        return repository.findByProductId(productId)
            .stream()
            .map(ItemMapper::toDomain)
            .collect(Collectors.toList());
    }
}