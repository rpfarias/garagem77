package com.garagem77.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderCreateRequest {

    private UUID scheduleId;

    @NotEmpty(message = "CPF do cliente não pode estar vazio")
    private String customerCpf;

    @NotEmpty(message = "Placa do veículo não pode estar vazia")
    private String vehiclePlate;

    @NotEmpty(message = "Itens não podem estar vazios")
    private List<OrderItemRequest> items;

    @Size(max = 500, message = "Notas não pode ter mais de 500 caracteres")
    private String notes;
}
