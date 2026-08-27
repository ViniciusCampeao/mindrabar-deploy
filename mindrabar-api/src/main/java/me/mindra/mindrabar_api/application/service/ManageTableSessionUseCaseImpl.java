package me.mindra.mindrabar_api.application.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import me.mindra.mindrabar_api.application.dto.customer.BillItemDTO;
import me.mindra.mindrabar_api.application.dto.customer.BillResponseDTO;
import me.mindra.mindrabar_api.application.dto.customer.PublicTableInfoDTO;
import me.mindra.mindrabar_api.application.dto.customer.TableSessionResponseDTO;
import me.mindra.mindrabar_api.application.dto.customer.TableSessionStartRequestDTO;
import me.mindra.mindrabar_api.application.dto.customer.TableSessionStartResponseDTO;
import me.mindra.mindrabar_api.application.dto.product.ProductResponseDTO;
import me.mindra.mindrabar_api.application.port.in.ManageTableSessionUseCase;
import me.mindra.mindrabar_api.domain.model.customer.Customer;
import me.mindra.mindrabar_api.domain.model.customer.TableSession;
import me.mindra.mindrabar_api.domain.model.customer.TableSessionStatus;
import me.mindra.mindrabar_api.domain.model.item.Item;
import me.mindra.mindrabar_api.domain.model.order.Order;
import me.mindra.mindrabar_api.domain.model.order.OrderStatus;
import me.mindra.mindrabar_api.domain.model.product.Product;
import me.mindra.mindrabar_api.domain.model.table.Table;
import me.mindra.mindrabar_api.domain.model.user.User;
import me.mindra.mindrabar_api.domain.service.CustomerService;
import me.mindra.mindrabar_api.domain.service.ItemService;
import me.mindra.mindrabar_api.domain.service.OrderService;
import me.mindra.mindrabar_api.domain.service.ProductService;
import me.mindra.mindrabar_api.domain.service.TableService;
import me.mindra.mindrabar_api.domain.service.TableSessionService;
import me.mindra.mindrabar_api.domain.service.UserService;
import me.mindra.mindrabar_api.exception.ErrorCode;
import me.mindra.mindrabar_api.exception.MindrabarException;

public class ManageTableSessionUseCaseImpl implements ManageTableSessionUseCase {

    private final TableSessionService tableSessionService;
    private final CustomerService customerService;
    private final TableService tableService;
    private final UserService userService;
    private final ProductService productService;
    private final OrderService orderService;
    private final ItemService itemService;

    public ManageTableSessionUseCaseImpl(
            TableSessionService tableSessionService,
            CustomerService customerService,
            TableService tableService,
            UserService userService,
            ProductService productService,
            OrderService orderService,
            ItemService itemService) {
        this.tableSessionService = tableSessionService;
        this.customerService = customerService;
        this.tableService = tableService;
        this.userService = userService;
        this.productService = productService;
        this.orderService = orderService;
        this.itemService = itemService;
    }

    @Override
    public TableSessionStartResponseDTO startSession(String tableToken, TableSessionStartRequestDTO request) {
        Table table = tableService.findByQrToken(tableToken);
        Customer customer = customerService.create(new Customer(request.name(), request.phone()));
        TableSession session = tableSessionService.create(new TableSession(table, customer));

        return new TableSessionStartResponseDTO(
            session.getId(),
            session.getSessionToken(),
            table.getId(),
            table.getName(),
            customer.getName(),
            session.getStatus()
        );
    }

    @Override
    public PublicTableInfoDTO getTableInfoByToken(String tableToken) {
        Table table = tableService.findByQrToken(tableToken);
        return new PublicTableInfoDTO(
            table.getId(),
            table.getName(),
            table.getCompany().getId(),
            table.getCompany().getName()
        );
    }

    @Override
    public List<ProductResponseDTO> getMenuByToken(String tableToken) {
        Table table = tableService.findByQrToken(tableToken);
        List<Product> products = productService.findByCompany(table.getCompany());
        return products.stream().map(this::toDto).toList();
    }

    @Override
    public List<TableSessionResponseDTO> findPendingByCompanyId(Long companyId) {
        return tableSessionService.findPendingByCompanyId(companyId).stream()
            .map(this::toDto)
            .toList();
    }

    @Override
    public long countPendingByCompanyId(Long companyId) {
        return tableSessionService.countPendingByCompanyId(companyId);
    }

    @Override
    public TableSessionResponseDTO confirmSession(Long sessionId, Long staffUserId) {
        User staff = userService.findById(staffUserId);
        TableSession session = tableSessionService.confirm(sessionId, staff);
        return toDto(session);
    }

    @Override
    public void closeSessionsByTable(Long tableId) {
        Table table = tableService.findById(tableId);
        tableSessionService.closeByTable(table);
    }

    @Override
    public BillResponseDTO getBillByTableId(Long tableId) {
        Table table = tableService.findById(tableId);
        return buildBill(table);
    }

    @Override
    public BillResponseDTO getBillBySessionToken(String sessionToken) {
        TableSession session = tableSessionService.findByToken(sessionToken);
        if (session.getStatus() == TableSessionStatus.CLOSED) {
            throw new MindrabarException(ErrorCode.INVALID_STATUS_TRANSITION, "Sessão encerrada, conta não está mais disponível");
        }
        return buildBill(session.getTable());
    }

    private BillResponseDTO buildBill(Table table) {
        List<Order> openOrders = orderService.findByTable(table).stream()
            .filter(order -> order.getStatus() == OrderStatus.OPEN)
            .toList();

        List<BillItemDTO> billItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;
        BigDecimal amountPending = BigDecimal.ZERO;

        for (Order order : openOrders) {
            totalAmount = totalAmount.add(order.getTotalAmount());
            amountPending = amountPending.add(order.getAmountPending());

            for (Item item : findItemsByOrderSafe(order)) {
                BigDecimal unitPrice = item.getProduct().getSalePrice();
                BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()));
                String orderedBy = item.getUser() != null
                    ? item.getUser().getUsername()
                    : item.getTableSession().getCustomer().getName();

                billItems.add(new BillItemDTO(
                    item.getProduct().getName(),
                    item.getQuantity(),
                    unitPrice,
                    subtotal,
                    orderedBy
                ));
            }
        }

        return new BillResponseDTO(table.getId(), table.getName(), billItems, totalAmount, amountPending);
    }

    private List<Item> findItemsByOrderSafe(Order order) {
        try {
            return itemService.findByOrder(order);
        } catch (MindrabarException e) {
            if (e.getErrorCode() == ErrorCode.ITEM_NOT_FOUND) {
                return List.of();
            }
            throw e;
        }
    }

    private ProductResponseDTO toDto(Product product) {
        return new ProductResponseDTO(
            product.getId(),
            product.getCompany().getId(),
            product.getName(),
            product.getCostPrice(),
            product.getSalePrice(),
            product.getStockQuantity()
        );
    }

    private TableSessionResponseDTO toDto(TableSession session) {
        return new TableSessionResponseDTO(
            session.getId(),
            session.getTable().getId(),
            session.getTable().getName(),
            session.getCustomer().getName(),
            session.getStatus(),
            session.getCreatedAt(),
            session.getConfirmedAt()
        );
    }
}
