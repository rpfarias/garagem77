package com.garagem77.customer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleCreateRequest {

    @NotBlank(message = "Placa não pode estar vazia")
    @Size(min = 7, max = 10, message = "Placa deve ter entre 7 e 10 caracteres")
    private String plate;

    @NotBlank(message = "Modelo não pode estar vazio")
    @Size(min = 2, max = 255, message = "Modelo deve ter entre 2 e 255 caracteres")
    private String model;

    @Size(max = 100, message = "Cor não pode ter mais de 100 caracteres")
    private String color;

    private Integer year;

    @Size(max = 100, message = "Marca não pode ter mais de 100 caracteres")
    private String brand;

    @Size(max = 500, message = "Observações não pode ter mais de 500 caracteres")
    private String observations;

    @NotBlank(message = "CPF do cliente não pode estar vazio")
    private String customerCpf;
}
