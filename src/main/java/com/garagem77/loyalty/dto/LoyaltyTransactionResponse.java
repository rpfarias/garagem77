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
public class LoyaltyTransactionResponse {
    private UUID id;
    private UUID loyaltyPointPublicId;
    private UUID orderPublicId;
    private String transactionType;
    private Integer pointsValue;
    private String description;
    private LocalDateTime createdAt;
}
