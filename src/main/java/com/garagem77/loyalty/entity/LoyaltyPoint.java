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
@Table(name = "loyalty_points", indexes = {
    @Index(name = "idx_loyalty_point_customer_id", columnList = "customer_id")
})
public class LoyaltyPoint extends BaseEntity {

    @Column(nullable = false)
    private Long customerId;

    @Column(nullable = false)
    private Long programId;

    @Column(nullable = false)
    private Integer pointsBalance;
}
