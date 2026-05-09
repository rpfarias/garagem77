package com.garagem77.expense.entity;

import com.garagem77.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "expenses", indexes = {
    @Index(name = "idx_expense_category_id", columnList = "category_id"),
    @Index(name = "idx_expense_date", columnList = "expense_date"),
    @Index(name = "idx_expense_due_date", columnList = "due_date"),
    @Index(name = "idx_expense_status", columnList = "payment_status")
})
public class Expense extends BaseEntity {

    @Column(nullable = false, length = 255)
    private String supplier;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private LocalDate expenseDate;

    @Column
    private LocalDate dueDate;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ExpenseStatus paymentStatus;

    @Column(nullable = false)
    private Long categoryId;
}
