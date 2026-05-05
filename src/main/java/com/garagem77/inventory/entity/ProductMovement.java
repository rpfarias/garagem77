package com.garagem77.inventory.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.garagem77.shared.entity.BaseEntity;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "product_movements", indexes = {
    @Index(name = "idx_product_movement_product_id", columnList = "product_id")
})
public class ProductMovement extends BaseEntity {

    @Column(nullable = false)
    private Long productId;

    @Column(nullable = false, length = 50)
    private String movementType;

    @Column(nullable = false)
    private Integer quantity;

    @Column
    private UUID referenceId;

    @Column
    private String notes;
}
