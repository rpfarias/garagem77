package com.garagem77.customer.entity;

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
@Table(name = "vehicles", indexes = {
    @Index(name = "idx_vehicle_customer_id", columnList = "customer_id"),
    @Index(name = "idx_vehicle_plate", columnList = "plate", unique = true)
})
public class Vehicle extends BaseEntity {

    @Column(nullable = false)
    private Long customerId;

    @Column(nullable = false, unique = true, length = 10)
    private String plate;

    @Column(nullable = false, length = 255)
    private String model;

    @Column(length = 100)
    private String color;

    @Column
    private Integer year;

    @Column(length = 100)
    private String brand;

    @Column
    private String observations;

    @Column(nullable = false)
    private Boolean active;
}
