package com.garagem77.loyalty.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.garagem77.shared.entity.BaseEntity;
import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "loyalty_programs")
public class LoyaltyProgram extends BaseEntity {

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal pointsPerReal;

    @Column(nullable = false)
    private Boolean active;
}
