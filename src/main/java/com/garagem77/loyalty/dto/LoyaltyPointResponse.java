package com.garagem77.loyalty.dto;

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
public class LoyaltyPointResponse {
    private UUID id;
    private UUID customerPublicId;
    private String customerName;
    private String customerCpf;
    private UUID programPublicId;
    private String programName;
    private Integer pointsBalance;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
