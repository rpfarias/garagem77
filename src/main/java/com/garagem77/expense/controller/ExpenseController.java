package com.garagem77.expense.controller;

import com.garagem77.expense.dto.ExpenseRequest;
import com.garagem77.expense.dto.ExpenseResponse;
import com.garagem77.expense.entity.Expense;
import com.garagem77.expense.entity.ExpenseCategory;
import com.garagem77.expense.entity.ExpenseStatus;
import com.garagem77.expense.repository.ExpenseCategoryRepository;
import com.garagem77.expense.service.ExpenseService;
import com.garagem77.shared.exception.ResourceNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/expenses")
@RequiredArgsConstructor
@Tag(name = "Despesas", description = "Gerenciamento de despesas operacionais e de infraestrutura")
public class ExpenseController {

    private final ExpenseService expenseService;
    private final ExpenseCategoryRepository categoryRepository;

    @GetMapping
    @Operation(summary = "Listar despesas paginadas",
        description = "Filtros opcionais: período (start/end), status, categoryId. Default: mês corrente.")
    public ResponseEntity<Page<ExpenseResponse>> list(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end,
            @RequestParam(required = false) ExpenseStatus status,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        LocalDate today = LocalDate.now();
        LocalDate effectiveStart = (start != null) ? start : today.withDayOfMonth(1);
        LocalDate effectiveEnd = (end != null) ? end : today.withDayOfMonth(today.lengthOfMonth());

        Pageable pageable = PageRequest.of(page, size, Sort.by("expenseDate").descending());

        Page<Expense> result;
        if (categoryId != null) {
            result = expenseService.findByPeriodAndCategory(effectiveStart, effectiveEnd, categoryId, pageable);
        } else if (status != null) {
            result = expenseService.findByPeriodAndStatus(effectiveStart, effectiveEnd, status, pageable);
        } else {
            result = expenseService.findByPeriod(effectiveStart, effectiveEnd, pageable);
        }

        return ResponseEntity.ok(result.map(this::toResponse));
    }

    @GetMapping("/{publicId}")
    @Operation(summary = "Buscar despesa por ID")
    public ResponseEntity<ExpenseResponse> getById(@PathVariable UUID publicId) {
        Expense expense = expenseService.findByPublicId(publicId);
        return ResponseEntity.ok(toResponse(expense));
    }

    @PostMapping
    @Operation(summary = "Criar nova despesa")
    public ResponseEntity<ExpenseResponse> create(@Valid @RequestBody ExpenseRequest request) {
        Expense expense = expenseService.create(
            request.getSupplier(),
            request.getDescription(),
            request.getExpenseDate(),
            request.getDueDate(),
            request.getAmount(),
            request.getPaymentMethod(),
            request.getPaymentStatus(),
            request.getCategoryId()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(expense));
    }

    @PutMapping("/{publicId}")
    @Operation(summary = "Atualizar despesa")
    public ResponseEntity<ExpenseResponse> update(
            @PathVariable UUID publicId,
            @Valid @RequestBody ExpenseRequest request) {
        Expense expense = expenseService.update(
            publicId,
            request.getSupplier(),
            request.getDescription(),
            request.getExpenseDate(),
            request.getDueDate(),
            request.getAmount(),
            request.getPaymentMethod(),
            request.getPaymentStatus(),
            request.getCategoryId()
        );
        return ResponseEntity.ok(toResponse(expense));
    }

    @DeleteMapping("/{publicId}")
    @Operation(summary = "Remover despesa")
    public ResponseEntity<Void> delete(@PathVariable UUID publicId) {
        expenseService.delete(publicId);
        return ResponseEntity.noContent().build();
    }

    private ExpenseResponse toResponse(Expense expense) {
        ExpenseCategory category = categoryRepository.findById(expense.getCategoryId())
            .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada: id=" + expense.getCategoryId()));

        return ExpenseResponse.builder()
            .id(expense.getPublicId())
            .supplier(expense.getSupplier())
            .description(expense.getDescription())
            .expenseDate(expense.getExpenseDate())
            .dueDate(expense.getDueDate())
            .amount(expense.getAmount())
            .paymentMethod(expense.getPaymentMethod())
            .paymentStatus(expenseService.effectiveStatus(expense))
            .categoryId(category.getPublicId())
            .categoryName(category.getName())
            .categoryType(category.getType())
            .createdAt(expense.getCreatedAt())
            .updatedAt(expense.getUpdatedAt())
            .build();
    }
}
