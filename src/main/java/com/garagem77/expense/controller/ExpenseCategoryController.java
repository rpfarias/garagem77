package com.garagem77.expense.controller;

import com.garagem77.expense.dto.ExpenseCategoryRequest;
import com.garagem77.expense.dto.ExpenseCategoryResponse;
import com.garagem77.expense.entity.CategoryType;
import com.garagem77.expense.entity.ExpenseCategory;
import com.garagem77.expense.service.ExpenseCategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/expense-categories")
@RequiredArgsConstructor
@Tag(name = "Categorias de Despesa", description = "Gerenciamento de categorias de despesa")
public class ExpenseCategoryController {

    private final ExpenseCategoryService categoryService;

    @GetMapping
    @Operation(summary = "Listar categorias ativas",
        description = "Retorna todas as categorias ativas; filtre por tipo com ?type=OPERACIONAL ou INFRAESTRUTURA")
    public ResponseEntity<List<ExpenseCategoryResponse>> list(
            @RequestParam(required = false) CategoryType type) {
        List<ExpenseCategory> categories = (type != null)
            ? categoryService.findByType(type)
            : categoryService.findAll();
        List<ExpenseCategoryResponse> response = categories.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{publicId}")
    @Operation(summary = "Buscar categoria por ID")
    public ResponseEntity<ExpenseCategoryResponse> getById(@PathVariable UUID publicId) {
        ExpenseCategory category = categoryService.findByPublicId(publicId);
        return ResponseEntity.ok(toResponse(category));
    }

    @PostMapping
    @Operation(summary = "Criar nova categoria")
    public ResponseEntity<ExpenseCategoryResponse> create(@Valid @RequestBody ExpenseCategoryRequest request) {
        ExpenseCategory category = categoryService.create(request.getName(), request.getType());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(category));
    }

    @PutMapping("/{publicId}")
    @Operation(summary = "Atualizar categoria")
    public ResponseEntity<ExpenseCategoryResponse> update(
            @PathVariable UUID publicId,
            @Valid @RequestBody ExpenseCategoryRequest request) {
        ExpenseCategory category = categoryService.update(publicId, request.getName(), request.getType());
        return ResponseEntity.ok(toResponse(category));
    }

    @DeleteMapping("/{publicId}")
    @Operation(summary = "Desativar categoria",
        description = "Soft delete; falha se houver despesas associadas")
    public ResponseEntity<Void> delete(@PathVariable UUID publicId) {
        categoryService.delete(publicId);
        return ResponseEntity.noContent().build();
    }

    private ExpenseCategoryResponse toResponse(ExpenseCategory category) {
        return ExpenseCategoryResponse.builder()
            .id(category.getPublicId())
            .name(category.getName())
            .type(category.getType())
            .active(category.getActive())
            .createdAt(category.getCreatedAt())
            .updatedAt(category.getUpdatedAt())
            .build();
    }
}
