package me.mindra.mindrabar_api.domain.service;

import java.util.List;

import me.mindra.mindrabar_api.domain.model.item.Item;
import me.mindra.mindrabar_api.domain.model.item.ItemStatus;
import me.mindra.mindrabar_api.domain.model.order.Order;
import me.mindra.mindrabar_api.domain.model.product.Product;
import me.mindra.mindrabar_api.domain.model.user.User;
import me.mindra.mindrabar_api.domain.repository.ItemRepository;
import me.mindra.mindrabar_api.exception.ErrorCode;
import me.mindra.mindrabar_api.exception.MindrabarException;

public class ItemService {

    private final ItemRepository itemRepository;

    public ItemService(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    public Item create(Item item) {
        if (item == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Item não pode ser nulo");
        }
        if (item.getUser() == null || item.getUser().getId() == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Item deve pertencer a um Usuário existente");
        }
        if (item.getOrder() == null || item.getOrder().getId() == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Item deve pertencer a um Pedido existente");
        }
        if (item.getProduct() == null || item.getProduct().getId() == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Item deve ter um Produto associado");
        }
        if (item.getQuantity() <= 0) {
            throw new MindrabarException(ErrorCode.INVALID_QUANTITY, "Quantidade do item deve ser maior que zero");
        }
        if (item.getStatus() == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Status do item não pode ser nulo");
        }
        return itemRepository.save(item);
    }

    public Item updateStatus(Long itemId, ItemStatus status) {
        if (status == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Status do item não pode ser nulo");
        }
        Item item = findById(itemId);
        item.updateStatus(status);
        return itemRepository.save(item);
    }

    public Item updatePayment(Long itemId, int quantityToPay) {
        if (quantityToPay <= 0) {
            throw new MindrabarException(ErrorCode.INVALID_QUANTITY, "Quantidade a pagar deve ser maior que zero");
        }
        Item item = findById(itemId);
        item.addPayment(quantityToPay);
        return itemRepository.save(item);
    }

    public void deleteById(Long id) {
        if (id == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "ID do item não pode ser nulo");
        }
        itemRepository.deleteById(id);
    }

    public Item findById(Long id) {
        if (id == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "ID do item não pode ser nulo");
        }
        return itemRepository.findById(id)
                .orElseThrow(() -> new MindrabarException(ErrorCode.ITEM_NOT_FOUND, "Item não encontrado"));
    }

    public List<Item> findAll(Long companyId) {
        List<Item> items = itemRepository.findByCompanyId(companyId);
        if (items.isEmpty()) {
            throw new MindrabarException(ErrorCode.ITEM_NOT_FOUND, "Nenhum item encontrado");
        }
        return items;
    }

    public List<Item> findByOrder(Order order) {
        if (order == null || order.getId() == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Pedido não pode ser nulo");
        }
        List<Item> items = itemRepository.findByOrder(order);
        if (items.isEmpty()) {
            throw new MindrabarException(ErrorCode.ITEM_NOT_FOUND, "Nenhum item encontrado para este pedido");
        }
        return items;
    }

    public List<Item> findByUser(User user) {
        if (user == null || user.getId() == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Usuário não pode ser nulo");
        }
        List<Item> items = itemRepository.findByUser(user);
        if (items.isEmpty()) {
            throw new MindrabarException(ErrorCode.ITEM_NOT_FOUND, "Nenhum item encontrado para este usuário");
        }
        return items;
    }

    public List<Item> findByProduct(Product product) {
        if (product == null || product.getId() == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Produto não pode ser nulo");
        }
        List<Item> items = itemRepository.findByProduct(product);
        if (items.isEmpty()) {
            throw new MindrabarException(ErrorCode.ITEM_NOT_FOUND, "Nenhum item encontrado para este produto");
        }
        return items;
    }

    public List<Item> findByStatusAndCompanyId(ItemStatus status, Long companyId) {
        if (status == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Status do item não pode ser nulo");
        }
        List<Item> items = itemRepository.findByStatusAndCompanyId(status, companyId);
        if (items.isEmpty()) {
            throw new MindrabarException(ErrorCode.ITEM_NOT_FOUND, "Nenhum item encontrado com este status");
        }
        return items;
    }

    public List<Item> findByProduct(Long productId) {
        if (productId == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "ID do produto não pode ser nulo");
        }
        List<Item> items = itemRepository.findByProductId(productId);
        if (items.isEmpty()) {
            throw new MindrabarException(ErrorCode.ITEM_NOT_FOUND, "Nenhum item encontrado para este produto");
        }
        return items;
    }
}