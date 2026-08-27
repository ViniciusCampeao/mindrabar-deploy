package me.mindra.mindrabar_api.web;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import me.mindra.mindrabar_api.application.dto.product.*;
import me.mindra.mindrabar_api.application.port.in.ManageProductUseCase;
import me.mindra.mindrabar_api.infra.persistence.security.SecurityUtils;

@RestController
@RequestMapping("/product")
@Tag(name = "Products", description = "Endpoints para gerenciar produtos")
public class ProductController {

    private final ManageProductUseCase manageProductUseCase;

    public ProductController(ManageProductUseCase manageProductUseCase) {
        this.manageProductUseCase = manageProductUseCase;
    }

    @Operation(summary = "Listar todos os produtos")
    @GetMapping
    public List<ProductResponseDTO> getAllProducts() {
        return manageProductUseCase.findAll();
    }

    @Operation(summary = "Buscar produto por ID")
    @GetMapping("/{id}")
    public ProductResponseDTO getProductById(@PathVariable Long id) {
        return manageProductUseCase.findProductById(id);
    }

    @Operation(summary = "Buscar produto por nome")
    @GetMapping("/name/{name}")
    public ProductResponseDTO getProductByName(@PathVariable String name) {
        return manageProductUseCase.findProductByName(name);
    }

    @Operation(summary = "Listar produtos de uma empresa")
    @GetMapping("/company")
    public List<ProductResponseDTO> getProductsByCompany() {
        return manageProductUseCase.findProductsByCompany(SecurityUtils.getCurrentCompanyId());
    }

    @Operation(summary = "Listar produtos por preço de custo")
    @GetMapping("/cost-price/{costPrice}")
    public List<ProductResponseDTO> getProductsByCostPrice(@PathVariable BigDecimal costPrice) {
        return manageProductUseCase.findProductsByCostPrice(costPrice);
    }

    @Operation(summary = "Listar produtos por preço de venda")
    @GetMapping("/sale-price/{salePrice}")
    public List<ProductResponseDTO> getProductsBySalePrice(@PathVariable BigDecimal salePrice) {
        return manageProductUseCase.findProductsBySalePrice(salePrice);
    }

    // @Operation(summary = "Listar produtos por quantidade em estoque")
    // @GetMapping("/stock/{stockQuantity}")
    // public List<ProductResponseDTO> getProductsByStockQuantity(@PathVariable int stockQuantity) {
    //     return manageProductUseCase.findProductsByStockQuantity(stockQuantity);
    // }

    @Operation(summary = "Adicionar estoque a um produto")
    @PatchMapping("/{id}/stock/add")
    public ProductStockUpdateResponseDTO addStock(
            @PathVariable Long id,
            @RequestBody ProductStockUpdateRequestDTO request) {

        ProductStockUpdateRequestDTO dto = new ProductStockUpdateRequestDTO(id, request.stockQuantity());
        return manageProductUseCase.addStock(dto);
    }

    @Operation(summary = "Remover estoque de um produto")
    @PatchMapping("/{id}/stock/remove")
    public ProductStockUpdateResponseDTO removeStock(
            @PathVariable Long id,
            @RequestBody ProductStockUpdateRequestDTO request) {

        ProductStockUpdateRequestDTO dto = new ProductStockUpdateRequestDTO(id, request.stockQuantity());
        return manageProductUseCase.removeStock(dto);
    }

    @Operation(summary = "Atualizar preço de custo do produto")
    @PatchMapping("/{id}/price/cost")
    public ProductPriceUpdateResponseDTO updateCostPrice(
            @PathVariable Long id,
            @RequestBody ProductPriceUpdateRequestDTO request) {

        ProductPriceUpdateRequestDTO dto = new ProductPriceUpdateRequestDTO(id, request.price());
        return manageProductUseCase.updateCostPrice(dto);
    }

    @Operation(summary = "Atualizar preço de venda do produto")
    @PatchMapping("/{id}/price/sale")
    public ProductPriceUpdateResponseDTO updateSalePrice(
            @PathVariable Long id,
            @RequestBody ProductPriceUpdateRequestDTO request) {

        ProductPriceUpdateRequestDTO dto = new ProductPriceUpdateRequestDTO(id, request.price());
        return manageProductUseCase.updateSalePrice(dto);
    }

    @Operation(summary = "Atribuir ou remover a categoria de um produto")
    @PatchMapping("/{id}/category")
    public ProductResponseDTO updateCategory(
            @PathVariable Long id,
            @RequestBody ProductCategoryAssignRequestDTO request) {

        return manageProductUseCase.updateCategory(id, request);
    }

    @Operation(summary = "Criar um novo produto")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductCreateResponseDTO createProduct(@RequestBody ProductCreateRequestDTO request) {
        return manageProductUseCase.createProduct(SecurityUtils.getCurrentCompanyId(), request);
    }

    @Operation(summary = "Deletar um produto")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProduct(@PathVariable Long id) {
        manageProductUseCase.deleteProduct(id);
    }
}