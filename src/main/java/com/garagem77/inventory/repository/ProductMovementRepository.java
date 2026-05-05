package com.garagem77.inventory.repository;

import com.garagem77.inventory.entity.ProductMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductMovementRepository extends JpaRepository<ProductMovement, Long> {

    Optional<ProductMovement> findByPublicId(UUID publicId);

    List<ProductMovement> findByProductId(Long productId);

    List<ProductMovement> findByProductIdAndMovementType(Long productId, String movementType);

    List<ProductMovement> findByMovementType(String movementType);

    List<ProductMovement> findByReferenceId(UUID referenceId);
}
