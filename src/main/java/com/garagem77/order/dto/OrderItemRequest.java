package com.garagem77.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemRequest {

    private UUID serviceId;

    private UUID productId;

    @Min(value = 1, message = "Quantidade deve ser maior que 0")
    private Integer quantity;

    @DecimalMin(value = "0.01", message = "Preço deve ser maior que 0")
    private BigDecimal unitPrice;
}
