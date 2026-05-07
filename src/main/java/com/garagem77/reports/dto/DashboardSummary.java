package com.garagem77.reports.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummary {

    // Counts
    private long totalCustomers;
    private long totalVehicles;
    private long totalServices;
    private long totalProducts;
    private long totalSchedules;

    // Schedule status breakdown
    private Map<String, Long> schedulesByStatus;

    // Inventory health
    private long lowStockCount;
    private long outOfStockCount;
    private BigDecimal totalInventoryValue;

    // Service catalog
    private BigDecimal averageServicePrice;
    private BigDecimal maxServicePrice;
    private BigDecimal minServicePrice;
}
