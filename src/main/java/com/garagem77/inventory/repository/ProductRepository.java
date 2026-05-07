package com.garagem77.inventory.repository;

import com.garagem77.inventory.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findByPublicId(UUID publicId);

    Optional<Product> findBySku(String sku);

    List<Product> findByActive(Boolean active);

    List<Product> findByNameContainingIgnoreCase(String name);

    List<Product> findByQuantityStockLessThan(Integer minimumQuantity);

    @Query("SELECT p FROM Product p WHERE p.quantityStock <= p.minimumQuantity")
    List<Product> findProductsLowStock();

    @Query("SELECT p FROM Product p WHERE p.quantityStock = 0")
    List<Product> findOutOfStock();

    Page<Product> findByActive(Boolean active, Pageable pageable);

    Page<Product> findByActiveAndNameContainingIgnoreCase(Boolean active, String name, Pageable pageable);

    Page<Product> findByActiveAndSkuContainingIgnoreCase(Boolean active, String sku, Pageable pageable);
}
