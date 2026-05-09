package com.garagem77.reports.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpensesByMonthItem {
    private int year;
    private int month;
    private String label;
    private BigDecimal total;
    private BigDecimal opex;
    private BigDecimal infra;
}
