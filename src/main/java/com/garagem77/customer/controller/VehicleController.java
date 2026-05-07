package com.garagem77.customer.controller;

import com.garagem77.customer.dto.VehicleCreateRequest;
import com.garagem77.customer.dto.VehicleResponse;
import com.garagem77.customer.entity.Customer;
import com.garagem77.customer.entity.Vehicle;
import com.garagem77.customer.service.VehicleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
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

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/vehicles")
@RequiredArgsConstructor
@Tag(name = "Veículos", description = "Gerenciamento de veículos dos clientes")
public class VehicleController {

    private final VehicleService vehicleService;

    @GetMapping
    @Operation(summary = "Listar veículos paginados", description = "Retorna lista paginada de veículos ativos")
    public ResponseEntity<Page<VehicleResponse>> listVehicles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Vehicle> vehicles = vehicleService.findAllPaged(pageable);
        Page<VehicleResponse> response = vehicles.map(this::toResponse);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    @Operation(summary = "Buscar veículos por placa", description = "Busca paginada por placa contendo o termo")
    public ResponseEntity<Page<VehicleResponse>> searchVehicles(
            @RequestParam String plate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Vehicle> vehicles = vehicleService.searchByPlate(plate, pageable);
        Page<VehicleResponse> response = vehicles.map(this::toResponse);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{publicId}")
    @Operation(summary = "Buscar veículo por ID", description = "Retorna os detalhes de um veículo específico pelo seu ID público")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Veículo encontrado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Veículo não encontrado"),
        @ApiResponse(responseCode = "400", description = "ID inválido")
    })
    public ResponseEntity<VehicleResponse> getVehicleById(@PathVariable UUID publicId) {
        Vehicle vehicle = vehicleService.findByPublicId(publicId);
        return ResponseEntity.ok(toResponse(vehicle));
    }

    @GetMapping("/plate/{plate}")
    @Operation(summary = "Buscar veículo por placa", description = "Retorna os detalhes de um veículo específico pela sua placa de identificação")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Veículo encontrado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Veículo não encontrado"),
        @ApiResponse(responseCode = "400", description = "Placa inválida")
    })
    public ResponseEntity<VehicleResponse> getVehicleByPlate(@PathVariable String plate) {
        Vehicle vehicle = vehicleService.findByPlate(plate);
        return ResponseEntity.ok(toResponse(vehicle));
    }

    @GetMapping("/customer/{customerPublicId}")
    @Operation(summary = "Listar veículos de um cliente", description = "Retorna uma lista de todos os veículos cadastrados para um cliente específico")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de veículos retornada com sucesso"),
        @ApiResponse(responseCode = "404", description = "Cliente não encontrado"),
        @ApiResponse(responseCode = "400", description = "ID do cliente inválido")
    })
    public ResponseEntity<List<VehicleResponse>> getVehiclesByCustomer(@PathVariable UUID customerPublicId) {
        List<Vehicle> vehicles = vehicleService.findByCustomerId(customerPublicId);
        List<VehicleResponse> responses = vehicles.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @PostMapping
    @Operation(summary = "Criar novo veículo", description = "Cria um novo veículo cadastrado para um cliente")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Veículo criado com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos"),
        @ApiResponse(responseCode = "409", description = "Conflito - Placa já registrada")
    })
    public ResponseEntity<VehicleResponse> createVehicle(@Valid @RequestBody VehicleCreateRequest request) {
        Vehicle vehicle = vehicleService.create(
            UUID.fromString(request.getCustomerCpf()),
            request.getPlate(),
            request.getModel(),
            request.getColor(),
            request.getYear(),
            request.getBrand(),
            request.getObservations()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(vehicle));
    }

    @PutMapping("/{publicId}")
    @Operation(summary = "Atualizar veículo", description = "Atualiza as informações de um veículo existente")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Veículo atualizado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Veículo não encontrado"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos")
    })
    public ResponseEntity<VehicleResponse> updateVehicle(
            @PathVariable UUID publicId,
            @RequestParam(required = false) String plate,
            @RequestParam(required = false) String model,
            @RequestParam(required = false) String color,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String observations) {
        Vehicle vehicle = vehicleService.update(publicId, plate, model, color, year, brand, observations);
        return ResponseEntity.ok(toResponse(vehicle));
    }

    @DeleteMapping("/{publicId}")
    @Operation(summary = "Deletar veículo", description = "Remove um veículo do sistema")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Veículo deletado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Veículo não encontrado"),
        @ApiResponse(responseCode = "400", description = "ID inválido")
    })
    public ResponseEntity<Void> deleteVehicle(@PathVariable UUID publicId) {
        vehicleService.delete(publicId);
        return ResponseEntity.noContent().build();
    }

    private VehicleResponse toResponse(Vehicle vehicle) {
        Customer customer = vehicleService.getCustomerByVehicleId(vehicle.getCustomerId());
        return VehicleResponse.builder()
            .id(vehicle.getPublicId())
            .plate(vehicle.getPlate())
            .model(vehicle.getModel())
            .color(vehicle.getColor())
            .year(vehicle.getModelYear())
            .brand(vehicle.getBrand())
            .observations(vehicle.getObservations())
            .active(vehicle.getActive())
            .customerPublicId(customer != null ? customer.getPublicId() : null)
            .customerName(customer != null ? customer.getName() : null)
            .createdAt(vehicle.getCreatedAt())
            .updatedAt(vehicle.getUpdatedAt())
            .build();
    }
}
