package me.mindra.mindrabar_api.application.service;

import java.math.BigDecimal;
import java.util.List;

import me.mindra.mindrabar_api.application.dto.customer.CustomerOrderItemRequestDTO;
import me.mindra.mindrabar_api.application.dto.item.ItemCreateRequestDTO;
import me.mindra.mindrabar_api.application.dto.item.ItemCreateResponseDTO;
import me.mindra.mindrabar_api.application.dto.item.ItemQueueResponseDTO;
import me.mindra.mindrabar_api.application.dto.item.ItemResponseDTO;
import me.mindra.mindrabar_api.application.dto.item.ItemStatusUpdateRequestDTO;
import me.mindra.mindrabar_api.application.dto.item.ItemStatusUpdateResponseDTO;
import me.mindra.mindrabar_api.application.dto.item.SessionItemStatusDTO;
import me.mindra.mindrabar_api.exception.ErrorCode;
import me.mindra.mindrabar_api.exception.MindrabarException;
import me.mindra.mindrabar_api.application.port.in.ManageItemUseCase;
import me.mindra.mindrabar_api.domain.model.customer.TableSession;
import me.mindra.mindrabar_api.domain.model.item.Item;
import me.mindra.mindrabar_api.domain.model.item.ItemStatus;
import me.mindra.mindrabar_api.domain.model.order.Order;
import me.mindra.mindrabar_api.domain.model.order.OrderStatus;
import me.mindra.mindrabar_api.domain.model.product.Product;
import me.mindra.mindrabar_api.domain.model.table.Table;
import me.mindra.mindrabar_api.domain.model.table.TableStatus;
import me.mindra.mindrabar_api.domain.model.user.User;
import me.mindra.mindrabar_api.domain.service.ItemService;
import me.mindra.mindrabar_api.domain.service.OrderService;
import me.mindra.mindrabar_api.domain.service.ProductService;
import me.mindra.mindrabar_api.domain.service.TableService;
import me.mindra.mindrabar_api.domain.service.TableSessionService;
import me.mindra.mindrabar_api.domain.service.UserService;

public class ManageItemUseCaseImpl implements ManageItemUseCase {

    private final ItemService itemService;
    private final UserService userService;
    private final OrderService orderService;
    private final ProductService productService;
    private final TableService tableService;
    private final TableSessionService tableSessionService;

    public ManageItemUseCaseImpl(
            ItemService itemService,
            UserService userService,
            OrderService orderService,
            ProductService productService,
            TableService tableService,
            TableSessionService tableSessionService) {
        this.itemService = itemService;
        this.userService = userService;
        this.orderService = orderService;
        this.productService = productService;
        this.tableService = tableService;
        this.tableSessionService = tableSessionService;
    }

    @Override
    public ItemCreateResponseDTO createItem(ItemCreateRequestDTO request) {
        if (request == null) throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Request não pode ser nulo");

        User user = userService.findById(request.userId());
        Order order = orderService.findById(request.orderId());
        Product product = productService.findById(request.productId());

        Item created = itemService.create(request.toDomain(user, order, product));
        productService.removeStock(request.productId(), created.getQuantity());
        orderService.addTotalAmount(request.orderId(), product.getSalePrice().multiply(BigDecimal.valueOf(created.getQuantity())));
        return new ItemCreateResponseDTO(created);
    }

    @Override
    public ItemCreateResponseDTO createItemForSession(String sessionToken, CustomerOrderItemRequestDTO request) {
        if (request == null) throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Request não pode ser nulo");

        TableSession session = tableSessionService.findByToken(sessionToken);
        if (!session.canOrder()) {
            throw new MindrabarException(ErrorCode.INVALID_STATUS_TRANSITION, "Sessão encerrada, não é possível fazer novos pedidos");
        }

        Table table = session.getTable();
        Order order = orderService.findByTable(table).stream()
            .filter(o -> o.getStatus() == OrderStatus.OPEN)
            .findFirst()
            .orElseGet(() -> {
                tableService.updateStatus(table.getId(), TableStatus.OCCUPIED);
                return orderService.create(new Order(table, OrderStatus.OPEN));
            });

        Product product = productService.findById(request.productId());

        Item created = itemService.create(new Item(session, order, product, request.quantity(), ItemStatus.PENDING));
        productService.removeStock(request.productId(), created.getQuantity());
        orderService.addTotalAmount(order.getId(), product.getSalePrice().multiply(BigDecimal.valueOf(created.getQuantity())));
        return new ItemCreateResponseDTO(created);
    }

    @Override
    public ItemStatusUpdateResponseDTO updateStatus(ItemStatusUpdateRequestDTO request) {
        if (request == null) throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Request não pode ser nulo");
        
        Item updated = itemService.updateStatus(request.itemId(), request.status());
        
        if(request.status() == ItemStatus.CANCELLED) {
            productService.addStock(updated.getProduct().getId(), updated.getQuantity());
            orderService.removeTotalAmount(
                updated.getOrder().getId(), 
                updated.getProduct().getSalePrice().multiply(BigDecimal.valueOf(updated.getQuantity()))
            );
        }
        
        return new ItemStatusUpdateResponseDTO(updated);
    }

    @Override
    public void deleteItem(Long itemId) {
        Item item = itemService.findById(itemId);
        productService.addStock(item.getProduct().getId(), item.getQuantity());
        orderService.removeTotalAmount(
            item.getOrder().getId(), 
            item.getProduct().getSalePrice().multiply(BigDecimal.valueOf(item.getQuantity()))
        );
        itemService.deleteById(itemId);
    }

    @Override
    public ItemResponseDTO findItemById(Long itemId) {
        Item item = itemService.findById(itemId);
        return new ItemResponseDTO(item);
    }

    @Override
    public List<ItemResponseDTO> findAll(Long companyId) {
        return itemService.findAll(companyId).stream()
            .map(ItemResponseDTO::new)
            .toList();
    }

    @Override
    public List<ItemResponseDTO> findItemsByOrder(Long orderId) {
        Order order = orderService.findById(orderId);
        List<Item> items = itemService.findByOrder(order);
        return items.stream().map(ItemResponseDTO::new).toList();
    }

    @Override
    public List<ItemResponseDTO> findItemsByUser(Long userId) {
        User user = userService.findById(userId);
        List<Item> items = itemService.findByUser(user);
        return items.stream().map(ItemResponseDTO::new).toList();
    }

    @Override
    public List<ItemResponseDTO> findItemsByProduct(Long productId) {
        Product product = productService.findById(productId);
        List<Item> items = itemService.findByProduct(product);
        return items.stream().map(ItemResponseDTO::new).toList();
    }

    @Override
    public BigDecimal getTotalAmount(Long orderId) {
        List<Item> items = itemService.findByOrder(orderService.findById(orderId));
        BigDecimal totalAmount = BigDecimal.ZERO;
        for(Item  item : items) {
            BigDecimal itemTotal = item.getProduct().getSalePrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);
        }

        return totalAmount;
    }

    @Override
    public List<ItemQueueResponseDTO> findItemByStatusAndCompanyId(ItemStatus status, Long companyId) {
        List<Item> items = itemService.findByStatusAndCompanyId(status, companyId);
        return items.stream()
                .map(ItemQueueResponseDTO::new)
                .toList();
    }

    @Override
    public List<SessionItemStatusDTO> findItemsBySession(String sessionToken) {
        TableSession session = tableSessionService.findByToken(sessionToken);
        List<Item> items = itemService.findByTableSession(session);
        return items.stream()
                .sorted((a, b) -> a.getCreatedAt().compareTo(b.getCreatedAt()))
                .map(item -> new SessionItemStatusDTO(
                    item.getId(),
                    item.getProduct().getName(),
                    item.getQuantity(),
                    item.getStatus().name(),
                    item.getCreatedAt(),
                    item.getUpdatedAt()
                ))
                .toList();
    }
}