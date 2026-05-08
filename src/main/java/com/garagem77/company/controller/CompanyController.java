package com.garagem77.company.controller;

import com.garagem77.auth.security.UserPrincipal;
import com.garagem77.company.entity.Company;
import com.garagem77.company.service.CompanyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/companies")
@RequiredArgsConstructor
@Tag(name = "Empresas", description = "Gerenciamento de empresas")
public class CompanyController {

    private final CompanyService companyService;

    @GetMapping("/me")
    @Operation(summary = "Obter empresa do usuário autenticado", description = "Retorna a empresa associada ao usuário logado a partir do token JWT")
    public ResponseEntity<Company> getCurrentCompany(@AuthenticationPrincipal UserPrincipal principal) {
        Company company = companyService.findById(principal.getCompanyId());
        return ResponseEntity.ok(company);
    }

    @GetMapping("/{publicId}")
    @Operation(summary = "Obter empresa por ID", description = "Retorna os detalhes de uma empresa específica")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Empresa encontrada"),
        @ApiResponse(responseCode = "404", description = "Empresa não encontrada")
    })
    public ResponseEntity<Company> getCompanyById(@PathVariable UUID publicId) {
        Company company = companyService.findByPublicId(publicId);
        return ResponseEntity.ok(company);
    }

    @GetMapping("/slug/{slug}")
    @Operation(summary = "Obter empresa por slug", description = "Retorna os detalhes de uma empresa pelo identificador único")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Empresa encontrada"),
        @ApiResponse(responseCode = "404", description = "Empresa não encontrada")
    })
    public ResponseEntity<Company> getCompanyBySlug(@PathVariable String slug) {
        Company company = companyService.findBySlug(slug);
        return ResponseEntity.ok(company);
    }

    @PostMapping
    @Operation(summary = "Criar empresa", description = "Cria uma nova empresa no sistema")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Empresa criada com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos")
    })
    public ResponseEntity<Company> createCompany(
            @RequestParam String slug,
            @RequestParam String name,
            @RequestParam String email,
            @RequestParam(required = false) String phone) {
        Company company = companyService.create(slug, name, email, phone);
        return ResponseEntity.status(HttpStatus.CREATED).body(company);
    }

    @PutMapping("/{publicId}")
    @Operation(summary = "Atualizar empresa", description = "Atualiza os dados de uma empresa existente")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Empresa atualizada"),
        @ApiResponse(responseCode = "404", description = "Empresa não encontrada")
    })
    public ResponseEntity<Company> updateCompany(
            @PathVariable UUID publicId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String phone) {
        Company company = companyService.update(publicId, name, email, phone);
        return ResponseEntity.ok(company);
    }

    @PatchMapping("/{publicId}/toggle-active")
    @Operation(summary = "Alternar status de atividade", description = "Ativa ou desativa uma empresa")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Status alterado"),
        @ApiResponse(responseCode = "404", description = "Empresa não encontrada")
    })
    public ResponseEntity<Void> toggleActive(@PathVariable UUID publicId) {
        companyService.toggleActive(publicId);
        return ResponseEntity.noContent().build();
    }
}
