package com.garagem77.scheduling.dto;

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
public class ScheduleResponse {

    private UUID id;

    private UUID customerPublicId;
    private String customerName;

    private UUID vehiclePublicId;
    private String vehiclePlate;
    private String vehicleModel;

    private UUID serviceId;
    private String serviceName;
    private BigDecimal servicePrice;

    private LocalDateTime scheduledAt;

    private String status;

    private String notes;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
