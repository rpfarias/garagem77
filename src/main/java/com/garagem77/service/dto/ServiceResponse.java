package com.garagem77.service.dto;

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
public class ServiceResponse {

    private UUID id;

    private String name;

    private String description;

    private BigDecimal price;

    private Integer durationMinutes;

    private Boolean active;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
