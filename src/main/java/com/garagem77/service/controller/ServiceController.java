package com.garagem77.service.controller;

import com.garagem77.service.dto.ServiceCreateRequest;
import com.garagem77.service.dto.ServiceResponse;
import com.garagem77.service.entity.Service;
import com.garagem77.service.service.ServiceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
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
@RequestMapping("/services")
@RequiredArgsConstructor
@Tag(name = "Serviços", description = "Gerenciamento de serviços oferecidos pela oficina")
public class ServiceController {

    private final ServiceService serviceService;

    @GetMapping("/{publicId}")
    @Operation(summary = "Buscar serviço por ID", description = "Retorna os detalhes de um serviço específico pelo seu ID público")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Serviço encontrado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Serviço não encontrado"),
        @ApiResponse(responseCode = "400", description = "ID inválido")
    })
    public ResponseEntity<ServiceResponse> getServiceById(@PathVariable UUID publicId) {
        Service service = serviceService.findByPublicId(publicId);
        return ResponseEntity.ok(toResponse(service));
    }

    @GetMapping("/name/{name}")
    @Operation(summary = "Buscar serviço por nome", description = "Retorna um serviço específico pelo seu nome exato")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Serviço encontrado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Serviço não encontrado"),
        @ApiResponse(responseCode = "400", description = "Nome inválido")
    })
    public ResponseEntity<ServiceResponse> getServiceByName(@PathVariable String name) {
        Service service = serviceService.findByName(name);
        return ResponseEntity.ok(toResponse(service));
    }

    @GetMapping("/search")
    @Operation(summary = "Pesquisar serviços por nome", description = "Retorna uma lista de serviços cujo nome contém o termo de busca")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Busca realizada com sucesso"),
        @ApiResponse(responseCode = "400", description = "Parâmetro de busca inválido")
    })
    public ResponseEntity<List<ServiceResponse>> searchByName(@RequestParam String name) {
        List<Service> services = serviceService.findByNameContaining(name);
        List<ServiceResponse> responses = services.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping
    @Operation(summary = "Listar todos os serviços", description = "Retorna uma lista com todos os serviços cadastrados no sistema")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de serviços retornada com sucesso"),
        @ApiResponse(responseCode = "400", description = "Erro ao processar a requisição")
    })
    public ResponseEntity<List<ServiceResponse>> getAllServices() {
        List<Service> services = serviceService.findAll();
        List<ServiceResponse> responses = services.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @PostMapping
    @Operation(summary = "Criar novo serviço", description = "Cria um novo serviço no sistema com as informações fornecidas")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Serviço criado com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos"),
        @ApiResponse(responseCode = "409", description = "Conflito - Serviço já existe")
    })
    public ResponseEntity<ServiceResponse> createService(@Valid @RequestBody ServiceCreateRequest request) {
        Service service = serviceService.create(
            request.getName(),
            request.getDescription(),
            request.getPrice(),
            request.getDurationMinutes()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(service));
    }

    @PutMapping("/{publicId}")
    @Operation(summary = "Atualizar serviço", description = "Atualiza as informações de um serviço existente")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Serviço atualizado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Serviço não encontrado"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos")
    })
    public ResponseEntity<ServiceResponse> updateService(
            @PathVariable UUID publicId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) java.math.BigDecimal price,
            @RequestParam(required = false) Integer durationMinutes) {
        Service service = serviceService.update(publicId, name, description, price, durationMinutes);
        return ResponseEntity.ok(toResponse(service));
    }

    @PatchMapping("/{publicId}/toggle-active")
    @Operation(summary = "Alternar status ativo/inativo do serviço", description = "Ativa ou desativa um serviço no sistema")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Status do serviço alterado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Serviço não encontrado"),
        @ApiResponse(responseCode = "400", description = "ID inválido")
    })
    public ResponseEntity<Void> toggleActive(@PathVariable UUID publicId) {
        serviceService.toggleActive(publicId);
        return ResponseEntity.noContent().build();
    }

    private ServiceResponse toResponse(Service service) {
        return ServiceResponse.builder()
            .id(service.getPublicId())
            .name(service.getName())
            .description(service.getDescription())
            .price(service.getPrice())
            .durationMinutes(service.getDurationMinutes())
            .active(service.getActive())
            .createdAt(service.getCreatedAt())
            .updatedAt(service.getUpdatedAt())
            .build();
    }
}
