package com.garagem77.inventory.controller;

import com.garagem77.inventory.dto.ProductCreateRequest;
import com.garagem77.inventory.dto.ProductResponse;
import com.garagem77.inventory.entity.Product;
import com.garagem77.inventory.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
@Tag(name = "Produtos", description = "Gerenciamento de produtos do inventário")
public class ProductController {

    private final ProductService productService;

    @GetMapping("/{publicId}")
    @Operation(summary = "Buscar produto por ID", description = "Retorna os detalhes de um produto específico pelo seu ID público")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Produto encontrado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Produto não encontrado"),
        @ApiResponse(responseCode = "400", description = "ID inválido")
    })
    public ResponseEntity<ProductResponse> getProductById(@PathVariable UUID publicId) {
        Product product = productService.findByPublicId(publicId);
        return ResponseEntity.ok(toResponse(product));
    }

    @GetMapping("/sku/{sku}")
    @Operation(summary = "Buscar produto por SKU", description = "Retorna um produto específico pelo seu código SKU")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Produto encontrado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Produto não encontrado"),
        @ApiResponse(responseCode = "400", description = "SKU inválido")
    })
    public ResponseEntity<ProductResponse> getProductBySku(@PathVariable String sku) {
        Product product = productService.findBySku(sku);
        return ResponseEntity.ok(toResponse(product));
    }

    @GetMapping
    @Operation(summary = "Listar todos os produtos", description = "Retorna uma lista com todos os produtos cadastrados no inventário")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de produtos retornada com sucesso"),
        @ApiResponse(responseCode = "400", description = "Erro ao processar a requisição")
    })
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        List<Product> products = productService.findAll();
        List<ProductResponse> responses = products.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/low-stock")
    @Operation(summary = "Listar produtos com baixo estoque", description = "Retorna uma lista de produtos cuja quantidade está abaixo do mínimo especificado")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de produtos com baixo estoque retornada com sucesso"),
        @ApiResponse(responseCode = "400", description = "Erro ao processar a requisição")
    })
    public ResponseEntity<List<ProductResponse>> getLowStockProducts() {
        List<Product> products = productService.findLowStock();
        List<ProductResponse> responses = products.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/out-of-stock")
    @Operation(summary = "Listar produtos fora de estoque", description = "Retorna uma lista de produtos sem quantidade disponível")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de produtos fora de estoque retornada com sucesso"),
        @ApiResponse(responseCode = "400", description = "Erro ao processar a requisição")
    })
    public ResponseEntity<List<ProductResponse>> getOutOfStockProducts() {
        List<Product> products = productService.findOutOfStock();
        List<ProductResponse> responses = products.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @PostMapping
    @Operation(summary = "Criar novo produto", description = "Cria um novo produto no inventário com as informações fornecidas")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Produto criado com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos"),
        @ApiResponse(responseCode = "409", description = "Conflito - SKU já registrado")
    })
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody ProductCreateRequest request) {
        Product product = productService.create(
            request.getName(),
            request.getDescription(),
            request.getSku(),
            request.getUnitPrice(),
            request.getQuantityStock(),
            request.getMinimumQuantity()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(product));
    }

    @PutMapping("/{publicId}")
    @Operation(summary = "Atualizar produto", description = "Atualiza as informações de um produto existente")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Produto atualizado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Produto não encontrado"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos")
    })
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable UUID publicId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String sku,
            @RequestParam(required = false) java.math.BigDecimal unitPrice,
            @RequestParam(required = false) Integer minimumQuantity) {
        Product product = productService.update(publicId, name, description, sku, unitPrice, minimumQuantity);
        return ResponseEntity.ok(toResponse(product));
    }

    @PatchMapping("/{publicId}/decrease-stock")
    @Operation(summary = "Diminuir estoque do produto", description = "Reduz a quantidade em estoque de um produto")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Estoque reduzido com sucesso"),
        @ApiResponse(responseCode = "404", description = "Produto não encontrado"),
        @ApiResponse(responseCode = "400", description = "Quantidade inválida ou quantidade insuficiente")
    })
    public ResponseEntity<Void> decreaseStock(
            @PathVariable UUID publicId,
            @RequestParam Integer quantity) {
        productService.decreaseStock(publicId, quantity);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{publicId}/increase-stock")
    @Operation(summary = "Aumentar estoque do produto", description = "Aumenta a quantidade em estoque de um produto")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Estoque aumentado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Produto não encontrado"),
        @ApiResponse(responseCode = "400", description = "Quantidade inválida")
    })
    public ResponseEntity<Void> increaseStock(
            @PathVariable UUID publicId,
            @RequestParam Integer quantity) {
        productService.increaseStock(publicId, quantity);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{publicId}/toggle-active")
    @Operation(summary = "Alternar status ativo/inativo do produto", description = "Ativa ou desativa um produto no sistema")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Status do produto alterado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Produto não encontrado"),
        @ApiResponse(responseCode = "400", description = "ID inválido")
    })
    public ResponseEntity<Void> toggleActive(@PathVariable UUID publicId) {
        productService.toggleActive(publicId);
        return ResponseEntity.noContent().build();
    }

    private ProductResponse toResponse(Product product) {
        return ProductResponse.builder()
            .id(product.getPublicId())
            .name(product.getName())
            .description(product.getDescription())
            .sku(product.getSku())
            .unitPrice(product.getUnitPrice())
            .quantityStock(product.getQuantityStock())
            .minimumQuantity(product.getMinimumQuantity())
            .active(product.getActive())
            .createdAt(product.getCreatedAt())
            .updatedAt(product.getUpdatedAt())
            .build();
    }
}
