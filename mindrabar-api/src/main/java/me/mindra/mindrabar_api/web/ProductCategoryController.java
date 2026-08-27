package me.mindra.mindrabar_api.web;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import me.mindra.mindrabar_api.application.dto.productcategory.ProductCategoryCreateRequestDTO;
import me.mindra.mindrabar_api.application.dto.productcategory.ProductCategoryResponseDTO;
import me.mindra.mindrabar_api.application.dto.productcategory.ProductCategoryUpdateRequestDTO;
import me.mindra.mindrabar_api.application.port.in.ManageProductCategoryUseCase;
import me.mindra.mindrabar_api.infra.persistence.security.SecurityUtils;

@RestController
@RequestMapping("/product-category")
@Tag(name = "Product Categories", description = "Endpoints para gerenciar categorias de produtos")
public class ProductCategoryController {

    private final ManageProductCategoryUseCase manageProductCategoryUseCase;

    public ProductCategoryController(ManageProductCategoryUseCase manageProductCategoryUseCase) {
        this.manageProductCategoryUseCase = manageProductCategoryUseCase;
    }

    @Operation(summary = "Listar categorias de produto da empresa logada")
    @GetMapping
    public List<ProductCategoryResponseDTO> getCategories() {
        return manageProductCategoryUseCase.findByCompany(SecurityUtils.getCurrentCompanyId());
    }

    @Operation(summary = "Criar uma nova categoria de produto")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductCategoryResponseDTO createCategory(@RequestBody ProductCategoryCreateRequestDTO request) {
        return manageProductCategoryUseCase.create(SecurityUtils.getCurrentCompanyId(), request);
    }

    @Operation(summary = "Atualizar o nome de uma categoria de produto")
    @PutMapping("/{id}")
    public ProductCategoryResponseDTO updateCategory(@PathVariable Long id, @RequestBody ProductCategoryUpdateRequestDTO request) {
        return manageProductCategoryUseCase.update(id, request);
    }

    @Operation(summary = "Remover uma categoria de produto")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCategory(@PathVariable Long id) {
        manageProductCategoryUseCase.delete(id);
    }
}
