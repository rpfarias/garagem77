package com.garagem77.expense.dto;

import com.garagem77.expense.entity.CategoryType;
import com.garagem77.expense.entity.ExpenseStatus;
import com.garagem77.expense.entity.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseResponse {
    private UUID id;
    private String supplier;
    private String description;
    private LocalDate expenseDate;
    private LocalDate dueDate;
    private BigDecimal amount;
    private PaymentMethod paymentMethod;
    private ExpenseStatus paymentStatus;
    private UUID categoryId;
    private String categoryName;
    private CategoryType categoryType;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
