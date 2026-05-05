package com.garagem77.customer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleResponse {

    private UUID id;

    private String plate;

    private String model;

    private String color;

    private Integer year;

    private String brand;

    private String observations;

    private Boolean active;

    private UUID customerPublicId;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
