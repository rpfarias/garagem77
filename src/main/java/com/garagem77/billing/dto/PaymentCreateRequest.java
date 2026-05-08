package com.garagem77.billing.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentCreateRequest {

    @NotNull(message = "ID do pedido é obrigatório")
    private UUID orderId;

    @NotBlank(message = "Método de pagamento é obrigatório")
    private String paymentMethod; // PIX, DINHEIRO, CARTAO_CREDITO, CARTAO_DEBITO

    @NotNull(message = "Valor é obrigatório")
    @DecimalMin(value = "0.01", message = "Valor deve ser maior que 0")
    private BigDecimal amount;
}
