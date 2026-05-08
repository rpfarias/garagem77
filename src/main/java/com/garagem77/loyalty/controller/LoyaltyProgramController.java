package com.garagem77.loyalty.controller;

import com.garagem77.loyalty.dto.LoyaltyProgramCreateRequest;
import com.garagem77.loyalty.dto.LoyaltyProgramResponse;
import com.garagem77.loyalty.entity.LoyaltyProgram;
import com.garagem77.loyalty.service.LoyaltyProgramService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequestMapping("/loyalty-programs")
@RequiredArgsConstructor
@Tag(name = "Programas de Fidelidade", description = "Gerenciamento de programas de pontuação")
public class LoyaltyProgramController {

    private final LoyaltyProgramService service;

    @GetMapping
    @Operation(summary = "Listar programas paginados")
    public ResponseEntity<Page<LoyaltyProgramResponse>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(service.findAllPaged(pageable).map(this::toResponse));
    }

    @GetMapping("/{publicId}")
    @Operation(summary = "Buscar programa por ID")
    public ResponseEntity<LoyaltyProgramResponse> getById(@PathVariable UUID publicId) {
        return ResponseEntity.ok(toResponse(service.findByPublicId(publicId)));
    }

    @GetMapping("/active")
    @Operation(summary = "Obter programa ativo")
    public ResponseEntity<LoyaltyProgramResponse> getActive() {
        return ResponseEntity.ok(toResponse(service.getActive()));
    }

    @PostMapping
    @Operation(summary = "Criar novo programa")
    public ResponseEntity<LoyaltyProgramResponse> create(
            @Valid @RequestBody LoyaltyProgramCreateRequest request) {
        LoyaltyProgram p = service.create(request.getName(), request.getPointsPerReal());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(p));
    }

    @PutMapping("/{publicId}")
    @Operation(summary = "Atualizar programa")
    public ResponseEntity<LoyaltyProgramResponse> update(
            @PathVariable UUID publicId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) BigDecimal pointsPerReal) {
        LoyaltyProgram p = service.update(publicId, name, pointsPerReal);
        return ResponseEntity.ok(toResponse(p));
    }

    @PatchMapping("/{publicId}/toggle-active")
    @Operation(summary = "Alternar ativo/inativo")
    public ResponseEntity<Void> toggleActive(@PathVariable UUID publicId) {
        service.toggleActive(publicId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{publicId}")
    @Operation(summary = "Remover programa")
    public ResponseEntity<Void> delete(@PathVariable UUID publicId) {
        service.delete(publicId);
        return ResponseEntity.noContent().build();
    }

    private LoyaltyProgramResponse toResponse(LoyaltyProgram p) {
        return LoyaltyProgramResponse.builder()
            .id(p.getPublicId())
            .name(p.getName())
            .pointsPerReal(p.getPointsPerReal())
            .active(p.getActive())
            .createdAt(p.getCreatedAt())
            .updatedAt(p.getUpdatedAt())
            .build();
    }
}
