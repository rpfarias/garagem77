package com.garagem77.loyalty.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.garagem77.shared.entity.BaseEntity;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "loyalty_transactions", indexes = {
    @Index(name = "idx_loyalty_transaction_loyalty_point_id", columnList = "loyalty_point_id")
})
public class LoyaltyTransaction extends BaseEntity {

    @Column(nullable = false)
    private Long loyaltyPointId;

    @Column
    private Long orderId;

    @Column(nullable = false, length = 50)
    private String transactionType;

    @Column(nullable = false)
    private Integer pointsValue;

    @Column
    private String description;
}
