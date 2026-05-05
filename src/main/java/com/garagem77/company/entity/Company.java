package com.garagem77.company.entity;

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
@Table(name = "companies", indexes = {
    @Index(name = "idx_company_slug", columnList = "slug", unique = true)
})
public class Company extends BaseEntity {

    @Column(nullable = false, unique = true, length = 50)
    private String slug;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, length = 255)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(length = 50)
    private String planType;

    @Column(nullable = false)
    private Boolean active;

    @Column(length = 100)
    private String schemaName;
}
