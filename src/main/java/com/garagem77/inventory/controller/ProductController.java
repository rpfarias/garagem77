package com.garagem77.inventory.controller;

import com.garagem77.inventory.dto.ProductCreateRequest;
import com.garagem77.inventory.dto.ProductResponse;
import com.garagem77.inventory.entity.Product;
import com.garagem77.inventory.service.ProductService;
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
public class ProductController {

    private final ProductService productService;

    @GetMapping("/{publicId}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable UUID publicId) {
        Product product = productService.findByPublicId(publicId);
        return ResponseEntity.ok(toResponse(product));
    }

    @GetMapping("/sku/{sku}")
    public ResponseEntity<ProductResponse> getProductBySku(@PathVariable String sku) {
        Product product = productService.findBySku(sku);
        return ResponseEntity.ok(toResponse(product));
    }

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        List<Product> products = productService.findAll();
        List<ProductResponse> responses = products.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<ProductResponse>> getLowStockProducts() {
        List<Product> products = productService.findLowStock();
        List<ProductResponse> responses = products.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/out-of-stock")
    public ResponseEntity<List<ProductResponse>> getOutOfStockProducts() {
        List<Product> products = productService.findOutOfStock();
        List<ProductResponse> responses = products.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @PostMapping
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
    public ResponseEntity<Void> decreaseStock(
            @PathVariable UUID publicId,
            @RequestParam Integer quantity) {
        productService.decreaseStock(publicId, quantity);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{publicId}/increase-stock")
    public ResponseEntity<Void> increaseStock(
            @PathVariable UUID publicId,
            @RequestParam Integer quantity) {
        productService.increaseStock(publicId, quantity);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{publicId}/toggle-active")
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
