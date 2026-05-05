package com.garagem77.loyalty.controller;

import com.garagem77.loyalty.entity.LoyaltyPoint;
import com.garagem77.loyalty.service.LoyaltyPointService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/loyalty-points")
@RequiredArgsConstructor
@Tag(name = "Pontos de Fidelidade", description = "Gerenciamento de pontos de fidelidade dos clientes")
public class LoyaltyPointController {

    private final LoyaltyPointService loyaltyPointService;

    @GetMapping("/{publicId}")
    @Operation(summary = "Buscar pontos de fidelidade por ID", description = "Retorna os detalhes de um registro de pontos de fidelidade pelo seu ID público")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Pontos encontrados com sucesso"),
        @ApiResponse(responseCode = "404", description = "Pontos não encontrados"),
        @ApiResponse(responseCode = "400", description = "ID inválido")
    })
    public ResponseEntity<LoyaltyPoint> getPointsById(@PathVariable UUID publicId) {
        LoyaltyPoint loyaltyPoint = loyaltyPointService.findByPublicId(publicId);
        return ResponseEntity.ok(loyaltyPoint);
    }

    @GetMapping("/customer/{customerPublicId}")
    @Operation(summary = "Obter pontos de fidelidade de um cliente", description = "Retorna o registro de pontos de fidelidade de um cliente específico")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Pontos encontrados com sucesso"),
        @ApiResponse(responseCode = "404", description = "Cliente não encontrado"),
        @ApiResponse(responseCode = "400", description = "ID do cliente inválido")
    })
    public ResponseEntity<LoyaltyPoint> getPointsByCustomer(@PathVariable UUID customerPublicId) {
        LoyaltyPoint loyaltyPoint = loyaltyPointService.findByCustomerId(customerPublicId);
        return ResponseEntity.ok(loyaltyPoint);
    }

    @GetMapping("/customer/{customerPublicId}/total")
    @Operation(summary = "Obter total de pontos de um cliente", description = "Retorna a quantidade total de pontos de fidelidade acumulados por um cliente")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Total de pontos retornado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Cliente não encontrado"),
        @ApiResponse(responseCode = "400", description = "ID do cliente inválido")
    })
    public ResponseEntity<Integer> getTotalPoints(@PathVariable UUID customerPublicId) {
        Integer totalPoints = loyaltyPointService.getTotalPoints(customerPublicId);
        return ResponseEntity.ok(totalPoints);
    }

    @PostMapping("/customer/{customerPublicId}")
    @Operation(summary = "Criar ou obter pontos de fidelidade do cliente", description = "Cria um novo registro de pontos ou retorna o existente para um cliente")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Registro de pontos criado ou retornado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Cliente não encontrado"),
        @ApiResponse(responseCode = "400", description = "ID do cliente inválido")
    })
    public ResponseEntity<LoyaltyPoint> createOrGetForCustomer(@PathVariable UUID customerPublicId) {
        LoyaltyPoint loyaltyPoint = loyaltyPointService.createOrGetForCustomer(customerPublicId);
        return ResponseEntity.status(HttpStatus.CREATED).body(loyaltyPoint);
    }

    @PatchMapping("/customer/{customerPublicId}/add-points")
    @Operation(summary = "Adicionar pontos de fidelidade", description = "Adiciona pontos de fidelidade à conta de um cliente")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Pontos adicionados com sucesso"),
        @ApiResponse(responseCode = "404", description = "Cliente não encontrado"),
        @ApiResponse(responseCode = "400", description = "Quantidade de pontos inválida")
    })
    public ResponseEntity<Void> addPoints(
            @PathVariable UUID customerPublicId,
            @RequestParam Integer points) {
        loyaltyPointService.addPoints(customerPublicId, points);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/customer/{customerPublicId}/redeem-points")
    @Operation(summary = "Resgatar pontos de fidelidade", description = "Resgata pontos de fidelidade da conta de um cliente")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Pontos resgatados com sucesso"),
        @ApiResponse(responseCode = "404", description = "Cliente não encontrado"),
        @ApiResponse(responseCode = "400", description = "Quantidade insuficiente de pontos ou valor inválido")
    })
    public ResponseEntity<Void> redeemPoints(
            @PathVariable UUID customerPublicId,
            @RequestParam Integer points) {
        loyaltyPointService.redeemPoints(customerPublicId, points);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/customer/{customerPublicId}/active")
    @Operation(summary = "Listar pontos ativos de um cliente", description = "Retorna uma lista de registros de pontos de fidelidade ativos para um cliente")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de pontos ativos retornada com sucesso"),
        @ApiResponse(responseCode = "404", description = "Cliente não encontrado"),
        @ApiResponse(responseCode = "400", description = "ID do cliente inválido")
    })
    public ResponseEntity<List<LoyaltyPoint>> getActivePoints(@PathVariable UUID customerPublicId) {
        List<LoyaltyPoint> activePoints = loyaltyPointService.findActivePoints(customerPublicId);
        return ResponseEntity.ok(activePoints);
    }
}
