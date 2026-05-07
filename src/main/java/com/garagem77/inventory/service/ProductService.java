package com.garagem77.inventory.service;

import com.garagem77.inventory.entity.Product;
import com.garagem77.inventory.repository.ProductRepository;
import com.garagem77.shared.exception.BusinessRuleException;
import com.garagem77.shared.exception.DuplicateResourceException;
import com.garagem77.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public Product findByPublicId(UUID publicId) {
        return productRepository.findByPublicId(publicId)
            .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado: " + publicId));
    }

    @Transactional(readOnly = true)
    public Product findBySku(String sku) {
        return productRepository.findBySku(sku)
            .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado: " + sku));
    }

    @Transactional(readOnly = true)
    public List<Product> findAll() {
        return productRepository.findByActive(true);
    }

    @Transactional(readOnly = true)
    public List<Product> findLowStock() {
        return productRepository.findProductsLowStock();
    }

    @Transactional(readOnly = true)
    public List<Product> findOutOfStock() {
        return productRepository.findOutOfStock();
    }

    @Transactional(readOnly = true)
    public Page<Product> findAllPaged(Pageable pageable) {
        return productRepository.findByActive(true, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Product> searchByName(String name, Pageable pageable) {
        return productRepository.findByActiveAndNameContainingIgnoreCase(true, name, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Product> searchBySku(String sku, Pageable pageable) {
        return productRepository.findByActiveAndSkuContainingIgnoreCase(true, sku, pageable);
    }

    public void delete(UUID publicId) {
        Product product = findByPublicId(publicId);
        product.setActive(false);
        productRepository.save(product);
        log.info("Produto removido (soft delete): {}", publicId);
    }

    public Product create(String name, String description, String sku, BigDecimal unitPrice, Integer quantityStock, Integer minimumQuantity) {
        validatePrice(unitPrice);
        validateQuantity(quantityStock);
        validateMinimum(minimumQuantity);

        if (sku != null && productRepository.findBySku(sku).isPresent()) {
            throw new DuplicateResourceException("SKU já existe: " + sku);
        }

        Product product = Product.builder()
            .name(name)
            .description(description)
            .sku(sku)
            .unitPrice(unitPrice)
            .quantityStock(quantityStock)
            .minimumQuantity(minimumQuantity)
            .active(true)
            .build();

        Product saved = productRepository.save(product);
        log.info("Produto criado: {} (SKU: {})", saved.getName(), sku);
        return saved;
    }

    public Product update(UUID publicId, String name, String description, String sku, BigDecimal unitPrice, Integer minimumQuantity) {
        Product product = findByPublicId(publicId);

        if (sku != null && !sku.equals(product.getSku())) {
            if (productRepository.findBySku(sku).isPresent()) {
                throw new DuplicateResourceException("SKU já existe: " + sku);
            }
            product.setSku(sku);
        }

        if (unitPrice != null) {
            validatePrice(unitPrice);
            product.setUnitPrice(unitPrice);
        }

        if (minimumQuantity != null) {
            validateMinimum(minimumQuantity);
            product.setMinimumQuantity(minimumQuantity);
        }

        if (name != null) product.setName(name);
        if (description != null) product.setDescription(description);

        Product updated = productRepository.save(product);
        log.info("Produto atualizado: {}", updated.getPublicId());
        return updated;
    }

    public void decreaseStock(UUID publicId, Integer quantity) {
        Product product = findByPublicId(publicId);

        if (product.getQuantityStock() < quantity) {
            log.warn("Estoque insuficiente para: {} (Disponível: {}, Solicitado: {})",
                product.getName(), product.getQuantityStock(), quantity);
        }

        product.setQuantityStock(product.getQuantityStock() - quantity);
        productRepository.save(product);
    }

    public void increaseStock(UUID publicId, Integer quantity) {
        Product product = findByPublicId(publicId);
        product.setQuantityStock(product.getQuantityStock() + quantity);
        productRepository.save(product);
    }

    public void toggleActive(UUID publicId) {
        Product product = findByPublicId(publicId);
        product.setActive(!product.getActive());
        productRepository.save(product);
        log.info("Status do produto alterado para: {}", product.getActive());
    }

    private void validatePrice(BigDecimal price) {
        if (price == null || price.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessRuleException("Preço deve ser maior que 0");
        }
    }

    private void validateQuantity(Integer quantity) {
        if (quantity == null || quantity < 0) {
            throw new BusinessRuleException("Quantidade não pode ser negativa");
        }
    }

    private void validateMinimum(Integer minimum) {
        if (minimum == null || minimum < 1) {
            throw new BusinessRuleException("Quantidade mínima deve ser pelo menos 1");
        }
    }
}
