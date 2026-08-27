package me.mindra.mindrabar_api.infra.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import me.mindra.mindrabar_api.application.port.in.AuthenticateUserUseCase;
import me.mindra.mindrabar_api.application.port.in.ManageCompanyUseCase;
import me.mindra.mindrabar_api.application.port.in.ManageItemUseCase;
import me.mindra.mindrabar_api.application.port.in.ManageOrderUseCase;
import me.mindra.mindrabar_api.application.port.in.ManageProductCategoryUseCase;
import me.mindra.mindrabar_api.application.port.in.ManageProductUseCase;
import me.mindra.mindrabar_api.application.port.in.ManageTableSessionUseCase;
import me.mindra.mindrabar_api.application.port.in.ManageTableUseCase;
import me.mindra.mindrabar_api.application.port.in.ManageUserUseCase;
import me.mindra.mindrabar_api.application.port.out.TokenProviderPort;
import me.mindra.mindrabar_api.application.port.out.UserAuthPort;
import me.mindra.mindrabar_api.application.service.ManageCompanyUseCaseImpl;
import me.mindra.mindrabar_api.application.service.ManageItemUseCaseImpl;
import me.mindra.mindrabar_api.application.service.ManageOrderUseCaseImpl;
import me.mindra.mindrabar_api.application.service.ManageProductCategoryUseCaseImpl;
import me.mindra.mindrabar_api.application.service.ManageProductUseCaseImpl;
import me.mindra.mindrabar_api.application.service.ManageTableSessionUseCaseImpl;
import me.mindra.mindrabar_api.application.service.ManageTableUseCaseImpl;
import me.mindra.mindrabar_api.application.service.ManageUseruseCaseImpl;
import me.mindra.mindrabar_api.application.service.auth.AuthenticateUserUseCaseImpl;
import me.mindra.mindrabar_api.domain.repository.CompanyRepository;
import me.mindra.mindrabar_api.domain.repository.CustomerRepository;
import me.mindra.mindrabar_api.domain.repository.ItemRepository;
import me.mindra.mindrabar_api.domain.repository.OrderRepository;
import me.mindra.mindrabar_api.domain.repository.ProductCategoryRepository;
import me.mindra.mindrabar_api.domain.repository.ProductRepository;
import me.mindra.mindrabar_api.domain.repository.TableRepository;
import me.mindra.mindrabar_api.domain.repository.TableSessionRepository;
import me.mindra.mindrabar_api.domain.repository.UserRepository;
import me.mindra.mindrabar_api.domain.service.CompanyService;
import me.mindra.mindrabar_api.domain.service.CustomerService;
import me.mindra.mindrabar_api.domain.service.ItemService;
import me.mindra.mindrabar_api.domain.service.OrderService;
import me.mindra.mindrabar_api.domain.service.ProductCategoryService;
import me.mindra.mindrabar_api.domain.service.ProductService;
import me.mindra.mindrabar_api.domain.service.TableService;
import me.mindra.mindrabar_api.domain.service.TableSessionService;
import me.mindra.mindrabar_api.domain.service.UserService;

@Configuration
public class ApplicationConfig {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ProductCategoryRepository productCategoryRepository;
    private final TableRepository tableRepository;
    private final OrderRepository orderRepository;
    private final ItemRepository itemRepository;
    private final CustomerRepository customerRepository;
    private final TableSessionRepository tableSessionRepository;

    public ApplicationConfig(CompanyRepository companyRepository, UserRepository userRepository,
        ProductRepository productRepository, ProductCategoryRepository productCategoryRepository, TableRepository tableRepository,
        OrderRepository orderRepository, ItemRepository itemRepository,
        CustomerRepository customerRepository, TableSessionRepository tableSessionRepository) {

        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.productCategoryRepository = productCategoryRepository;
        this.tableRepository = tableRepository;
        this.orderRepository = orderRepository;
        this.itemRepository = itemRepository;
        this.customerRepository = customerRepository;
        this.tableSessionRepository = tableSessionRepository;
    }

    @Bean
    public CompanyService companyService() {
        return new CompanyService(companyRepository);
    }

    @Bean
    public UserService userService() {
        return new UserService(userRepository);
    }

    @Bean
    public ProductService productService() {
        return new ProductService(productRepository);
    }

    @Bean
    public ProductCategoryService productCategoryService() {
        return new ProductCategoryService(productCategoryRepository);
    }

    @Bean
    public TableService tableService() {
        return new TableService(tableRepository);
    }

    @Bean
    public OrderService orderService() {
        return new OrderService(orderRepository);
    }

    @Bean
    public ItemService itemService() {
        return new ItemService(itemRepository);
    }

    @Bean
    public CustomerService customerService() {
        return new CustomerService(customerRepository);
    }

    @Bean
    public TableSessionService tableSessionService() {
        return new TableSessionService(tableSessionRepository);
    }

    @Bean
    public AuthenticateUserUseCase authenticateUserUseCase(UserAuthPort userAuthPort, TokenProviderPort tokenProviderPort, 
        PasswordEncoder passwordEncoder) {
        return new AuthenticateUserUseCaseImpl(userAuthPort, tokenProviderPort, passwordEncoder);
    }

    @Bean
    public ManageCompanyUseCase manageCompanyUseCase() {
        return new ManageCompanyUseCaseImpl(companyService());
    }

    @Bean
    public ManageUserUseCase manageUserUseCase(PasswordEncoder passwordEncoder) {
        return new ManageUseruseCaseImpl(userService(), companyService(), passwordEncoder);
    }

    @Bean
    public ManageProductUseCase manageProductUseCase() {
        return new ManageProductUseCaseImpl(productService(), companyService(), productCategoryService());
    }

    @Bean
    public ManageProductCategoryUseCase manageProductCategoryUseCase() {
        return new ManageProductCategoryUseCaseImpl(productCategoryService(), companyService());
    }

    @Bean
    public ManageTableUseCase manageTableUseCase() {
        return new ManageTableUseCaseImpl(tableService(), companyService());
    }

    @Bean
    public ManageOrderUseCase manageOrderUseCase() {
        return new ManageOrderUseCaseImpl(orderService(), tableService(), itemService());
    }

    @Bean
    public ManageItemUseCase manageItemUseCase() {
        return new ManageItemUseCaseImpl(itemService(), userService(), orderService(), productService(), tableService(), tableSessionService());
    }

    @Bean
    public ManageTableSessionUseCase manageTableSessionUseCase() {
        return new ManageTableSessionUseCaseImpl(tableSessionService(), customerService(), tableService(), userService(), productService(), orderService(), itemService());
    }
}
