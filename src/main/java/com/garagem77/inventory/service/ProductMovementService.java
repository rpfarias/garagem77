package com.garagem77.inventory.service;

import com.garagem77.inventory.entity.Product;
import com.garagem77.inventory.entity.ProductMovement;
import com.garagem77.inventory.repository.ProductMovementRepository;
import com.garagem77.inventory.repository.ProductRepository;
import com.garagem77.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ProductMovementService {

    private final ProductMovementRepository productMovementRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public ProductMovement findByPublicId(UUID publicId) {
        return productMovementRepository.findByPublicId(publicId)
            .orElseThrow(() -> new ResourceNotFoundException("Movimento não encontrado: " + publicId));
    }

    @Transactional(readOnly = true)
    public List<ProductMovement> findByProductId(UUID productPublicId) {
        Product product = productRepository.findByPublicId(productPublicId)
            .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado: " + productPublicId));

        return productMovementRepository.findByProductId(product.getId());
    }

    public ProductMovement recordEntry(UUID productPublicId, Integer quantity, UUID referenceId, String notes) {
        Product product = productRepository.findByPublicId(productPublicId)
            .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado: " + productPublicId));

        ProductMovement movement = ProductMovement.builder()
            .productId(product.getId())
            .movementType("ENTRADA")
            .quantity(quantity)
            .referenceId(referenceId)
            .notes(notes)
            .build();

        ProductMovement saved = productMovementRepository.save(movement);
        product.setQuantityStock(product.getQuantityStock() + quantity);
        productRepository.save(product);

        log.info("Entrada registrada: {} unidades de {}", quantity, product.getName());
        return saved;
    }

    public ProductMovement recordExit(UUID productPublicId, Integer quantity, UUID referenceId, String notes) {
        Product product = productRepository.findByPublicId(productPublicId)
            .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado: " + productPublicId));

        ProductMovement movement = ProductMovement.builder()
            .productId(product.getId())
            .movementType("SAÍDA")
            .quantity(quantity)
            .referenceId(referenceId)
            .notes(notes)
            .build();

        ProductMovement saved = productMovementRepository.save(movement);
        product.setQuantityStock(product.getQuantityStock() - quantity);
        productRepository.save(product);

        log.info("Saída registrada: {} unidades de {}", quantity, product.getName());
        return saved;
    }

    @Transactional(readOnly = true)
    public List<ProductMovement> findByMovementType(String movementType) {
        return productMovementRepository.findByMovementType(movementType);
    }
}
