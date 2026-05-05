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
@Table(name = "customers", indexes = {
    @Index(name = "idx_customer_cpf", columnList = "cpf", unique = true)
})
public class Customer extends BaseEntity {

    @Column(nullable = false, unique = true, length = 11)
    private String cpf;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(length = 255)
    private String email;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column
    private java.time.LocalDate birthDate;

    @Column(length = 500)
    private String address;

    @Column(nullable = false)
    private Boolean active;
}
