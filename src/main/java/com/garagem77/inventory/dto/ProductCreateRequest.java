package com.garagem77.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductCreateRequest {

    @NotBlank(message = "Nome não pode estar vazio")
    @Size(min = 3, max = 255, message = "Nome deve ter entre 3 e 255 caracteres")
    private String name;

    @Size(max = 500, message = "Descrição não pode ter mais de 500 caracteres")
    private String description;

    @Size(max = 100, message = "SKU não pode ter mais de 100 caracteres")
    private String sku;

    @DecimalMin(value = "0.01", message = "Preço deve ser maior que 0")
    private BigDecimal unitPrice;

    @Min(value = 0, message = "Quantidade não pode ser negativa")
    private Integer quantityStock;

    @Min(value = 1, message = "Quantidade mínima deve ser pelo menos 1")
    private Integer minimumQuantity;
}
