package com.garagem77.reports.dto;

import com.garagem77.expense.entity.CategoryType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpensesByCategoryItem {
    private UUID categoryId;
    private String categoryName;
    private CategoryType categoryType;
    private BigDecimal total;
    private long count;
}
