package com.garagem77.expense.entity;

import com.garagem77.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "expense_categories", indexes = {
    @Index(name = "idx_expense_category_name", columnList = "name", unique = true)
})
public class ExpenseCategory extends BaseEntity {

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private CategoryType type;

    @Column(nullable = false)
    private Boolean active;
}
