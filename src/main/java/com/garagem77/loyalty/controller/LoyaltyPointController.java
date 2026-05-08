package com.garagem77.loyalty.controller;

import com.garagem77.customer.entity.Customer;
import com.garagem77.loyalty.dto.LoyaltyPointResponse;
import com.garagem77.loyalty.dto.LoyaltyTransactionResponse;
import com.garagem77.loyalty.entity.LoyaltyPoint;
import com.garagem77.loyalty.entity.LoyaltyProgram;
import com.garagem77.loyalty.entity.LoyaltyTransaction;
import com.garagem77.loyalty.service.LoyaltyPointService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/loyalty-points")
@RequiredArgsConstructor
@Tag(name = "Pontos de Fidelidade", description = "Gerenciamento de pontos de fidelidade dos clientes")
public class LoyaltyPointController {

    private final LoyaltyPointService loyaltyPointService;

    @GetMapping
    @Operation(summary = "Listar saldos paginados", description = "Lista paginada de saldos de pontos por cliente")
    public ResponseEntity<Page<LoyaltyPointResponse>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(loyaltyPointService.findAllPaged(pageable).map(this::toResponse));
    }

    @GetMapping("/{publicId}")
    @Operation(summary = "Buscar pontos de fidelidade por ID")
    public ResponseEntity<LoyaltyPointResponse> getPointsById(@PathVariable UUID publicId) {
        LoyaltyPoint loyaltyPoint = loyaltyPointService.findByPublicId(publicId);
        return ResponseEntity.ok(toResponse(loyaltyPoint));
    }

    @GetMapping("/customer/{customerPublicId}")
    @Operation(summary = "Obter pontos de fidelidade de um cliente")
    public ResponseEntity<LoyaltyPointResponse> getPointsByCustomer(@PathVariable UUID customerPublicId) {
        LoyaltyPoint loyaltyPoint = loyaltyPointService.findByCustomerId(customerPublicId);
        return ResponseEntity.ok(toResponse(loyaltyPoint));
    }

    @GetMapping("/customer/{customerPublicId}/total")
    @Operation(summary = "Obter total de pontos de um cliente")
    public ResponseEntity<Integer> getTotalPoints(@PathVariable UUID customerPublicId) {
        Integer totalPoints = loyaltyPointService.getTotalPoints(customerPublicId);
        return ResponseEntity.ok(totalPoints);
    }

    @PostMapping("/customer/{customerPublicId}")
    @Operation(summary = "Criar ou obter conta de pontos para o cliente")
    public ResponseEntity<LoyaltyPointResponse> createOrGetForCustomer(@PathVariable UUID customerPublicId) {
        LoyaltyPoint loyaltyPoint = loyaltyPointService.createOrGetForCustomer(customerPublicId);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(loyaltyPoint));
    }

    @PatchMapping("/customer/{customerPublicId}/add-points")
    @Operation(summary = "Adicionar pontos ao saldo do cliente")
    public ResponseEntity<Void> addPoints(
            @PathVariable UUID customerPublicId,
            @RequestParam Integer points,
            @RequestParam(required = false) String description) {
        loyaltyPointService.addPoints(customerPublicId, points, description);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/customer/{customerPublicId}/redeem-points")
    @Operation(summary = "Resgatar pontos do saldo do cliente")
    public ResponseEntity<Void> redeemPoints(
            @PathVariable UUID customerPublicId,
            @RequestParam Integer points,
            @RequestParam(required = false) String description) {
        loyaltyPointService.redeemPoints(customerPublicId, points, description);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/customer/{customerPublicId}/active")
    @Operation(summary = "Listar pontos ativos de um cliente (com saldo > 0)")
    public ResponseEntity<List<LoyaltyPointResponse>> getActivePoints(@PathVariable UUID customerPublicId) {
        List<LoyaltyPoint> activePoints = loyaltyPointService.findActivePoints(customerPublicId);
        return ResponseEntity.ok(
            activePoints.stream().map(this::toResponse).collect(Collectors.toList())
        );
    }

    @GetMapping("/{publicId}/transactions")
    @Operation(summary = "Listar transações (extrato) de um saldo")
    public ResponseEntity<List<LoyaltyTransactionResponse>> getTransactions(@PathVariable UUID publicId) {
        LoyaltyPoint lp = loyaltyPointService.findByPublicId(publicId);
        List<LoyaltyTransaction> txs = loyaltyPointService.getTransactionsByLoyaltyPoint(lp.getId());
        return ResponseEntity.ok(
            txs.stream().map(this::toTransactionResponse).collect(Collectors.toList())
        );
    }

    private LoyaltyPointResponse toResponse(LoyaltyPoint lp) {
        Customer customer = loyaltyPointService.getCustomerById(lp.getCustomerId());
        LoyaltyProgram program = loyaltyPointService.getProgramById(lp.getProgramId());

        return LoyaltyPointResponse.builder()
            .id(lp.getPublicId())
            .customerPublicId(customer != null ? customer.getPublicId() : null)
            .customerName(customer != null ? customer.getName() : null)
            .customerCpf(customer != null ? customer.getCpf() : null)
            .programPublicId(program != null ? program.getPublicId() : null)
            .programName(program != null ? program.getName() : null)
            .pointsBalance(lp.getPointsBalance())
            .createdAt(lp.getCreatedAt())
            .updatedAt(lp.getUpdatedAt())
            .build();
    }

    private LoyaltyTransactionResponse toTransactionResponse(LoyaltyTransaction tx) {
        return LoyaltyTransactionResponse.builder()
            .id(tx.getPublicId())
            .transactionType(tx.getTransactionType())
            .pointsValue(tx.getPointsValue())
            .description(tx.getDescription())
            .createdAt(tx.getCreatedAt())
            .build();
    }
}
