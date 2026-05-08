package com.garagem77.billing.dto;

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
public class PaymentResponse {

    private UUID id;

    private UUID orderPublicId;
    private String customerName;
    private BigDecimal orderFinalAmount;

    private String paymentMethod;
    private BigDecimal amount;
    private String status;
    private LocalDateTime paymentDate;
    private String transactionId;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
