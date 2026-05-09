package com.garagem77.expense.dto;

import com.garagem77.expense.entity.ExpenseStatus;
import com.garagem77.expense.entity.PaymentMethod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseRequest {

    @NotBlank(message = "Fornecedor é obrigatório")
    @Size(max = 255)
    private String supplier;

    @Size(max = 1000)
    private String description;

    @NotNull(message = "Data da despesa é obrigatória")
    private LocalDate expenseDate;

    private LocalDate dueDate;

    @NotNull(message = "Valor é obrigatório")
    @DecimalMin(value = "0.01", message = "Valor deve ser maior que zero")
    private BigDecimal amount;

    @NotNull(message = "Forma de pagamento é obrigatória")
    private PaymentMethod paymentMethod;

    @NotNull(message = "Status de pagamento é obrigatório")
    private ExpenseStatus paymentStatus;

    @NotNull(message = "Categoria é obrigatória")
    private UUID categoryId;
}
