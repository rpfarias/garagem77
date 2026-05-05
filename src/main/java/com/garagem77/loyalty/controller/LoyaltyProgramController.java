package com.garagem77.loyalty.controller;

import com.garagem77.loyalty.entity.LoyaltyProgram;
import com.garagem77.loyalty.service.LoyaltyProgramService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequestMapping("/loyalty-programs")
@RequiredArgsConstructor
@Tag(name = "Programas de Fidelidade", description = "Gerenciamento de programas de fidelidade e pontos")
public class LoyaltyProgramController {

    private final LoyaltyProgramService loyaltyProgramService;

    @GetMapping("/{publicId}")
    @Operation(summary = "Buscar programa de fidelidade por ID", description = "Retorna os detalhes de um programa de fidelidade específico pelo seu ID público")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Programa encontrado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Programa não encontrado"),
        @ApiResponse(responseCode = "400", description = "ID inválido")
    })
    public ResponseEntity<LoyaltyProgram> getProgramById(@PathVariable UUID publicId) {
        LoyaltyProgram program = loyaltyProgramService.findByPublicId(publicId);
        return ResponseEntity.ok(program);
    }

    @GetMapping("/name/{name}")
    @Operation(summary = "Buscar programa de fidelidade por nome", description = "Retorna um programa de fidelidade específico pelo seu nome")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Programa encontrado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Programa não encontrado"),
        @ApiResponse(responseCode = "400", description = "Nome inválido")
    })
    public ResponseEntity<LoyaltyProgram> getProgramByName(@PathVariable String name) {
        LoyaltyProgram program = loyaltyProgramService.findByName(name);
        return ResponseEntity.ok(program);
    }

    @GetMapping("/active")
    @Operation(summary = "Obter programa de fidelidade ativo", description = "Retorna o programa de fidelidade que está ativo no sistema")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Programa ativo encontrado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Nenhum programa ativo encontrado"),
        @ApiResponse(responseCode = "400", description = "Erro ao processar a requisição")
    })
    public ResponseEntity<LoyaltyProgram> getActiveProgram() {
        LoyaltyProgram program = loyaltyProgramService.getActive();
        return ResponseEntity.ok(program);
    }

    @PostMapping
    @Operation(summary = "Criar novo programa de fidelidade", description = "Cria um novo programa de fidelidade no sistema")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Programa criado com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos"),
        @ApiResponse(responseCode = "409", description = "Conflito - Programa já existe")
    })
    public ResponseEntity<LoyaltyProgram> createProgram(
            @RequestParam String name,
            @RequestParam BigDecimal pointsPerReal) {
        LoyaltyProgram program = loyaltyProgramService.create(name, pointsPerReal);
        return ResponseEntity.status(HttpStatus.CREATED).body(program);
    }

    @PutMapping("/{publicId}")
    @Operation(summary = "Atualizar programa de fidelidade", description = "Atualiza as informações de um programa de fidelidade existente")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Programa atualizado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Programa não encontrado"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos")
    })
    public ResponseEntity<LoyaltyProgram> updateProgram(
            @PathVariable UUID publicId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) BigDecimal pointsPerReal) {
        LoyaltyProgram program = loyaltyProgramService.update(publicId, name, pointsPerReal);
        return ResponseEntity.ok(program);
    }

    @PatchMapping("/{publicId}/toggle-active")
    @Operation(summary = "Alternar status ativo/inativo do programa", description = "Ativa ou desativa um programa de fidelidade")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Status do programa alterado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Programa não encontrado"),
        @ApiResponse(responseCode = "400", description = "ID inválido")
    })
    public ResponseEntity<Void> toggleActive(@PathVariable UUID publicId) {
        loyaltyProgramService.toggleActive(publicId);
        return ResponseEntity.noContent().build();
    }
}
