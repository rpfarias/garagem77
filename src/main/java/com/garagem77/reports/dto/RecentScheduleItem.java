package com.garagem77.reports.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecentScheduleItem {
    private UUID id;
    private String customerName;
    private String vehiclePlate;
    private String serviceName;
    private BigDecimal servicePrice;
    private String status;
    private LocalDateTime scheduledAt;
}
