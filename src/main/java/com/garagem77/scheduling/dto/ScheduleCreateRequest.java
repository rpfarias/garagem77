package com.garagem77.scheduling.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleCreateRequest {

    @NotBlank(message = "CPF do cliente não pode estar vazio")
    private String customerCpf;

    @NotBlank(message = "Placa do veículo não pode estar vazia")
    private String vehiclePlate;

    @NotBlank(message = "ID do serviço não pode estar vazio")
    private UUID serviceId;

    @Future(message = "A data agendada deve ser no futuro")
    private LocalDateTime scheduledAt;

    @Size(max = 500, message = "Notas não pode ter mais de 500 caracteres")
    private String notes;
}
