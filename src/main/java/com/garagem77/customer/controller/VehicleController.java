package com.garagem77.customer.controller;

import com.garagem77.customer.dto.VehicleCreateRequest;
import com.garagem77.customer.dto.VehicleResponse;
import com.garagem77.customer.entity.Vehicle;
import com.garagem77.customer.service.VehicleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;

    @GetMapping("/{publicId}")
    public ResponseEntity<VehicleResponse> getVehicleById(@PathVariable UUID publicId) {
        Vehicle vehicle = vehicleService.findByPublicId(publicId);
        return ResponseEntity.ok(toResponse(vehicle));
    }

    @GetMapping("/plate/{plate}")
    public ResponseEntity<VehicleResponse> getVehicleByPlate(@PathVariable String plate) {
        Vehicle vehicle = vehicleService.findByPlate(plate);
        return ResponseEntity.ok(toResponse(vehicle));
    }

    @GetMapping("/customer/{customerPublicId}")
    public ResponseEntity<List<VehicleResponse>> getVehiclesByCustomer(@PathVariable UUID customerPublicId) {
        List<Vehicle> vehicles = vehicleService.findByCustomerId(customerPublicId);
        List<VehicleResponse> responses = vehicles.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @PostMapping
    public ResponseEntity<VehicleResponse> createVehicle(@Valid @RequestBody VehicleCreateRequest request) {
        Vehicle vehicle = vehicleService.create(
            UUID.fromString(request.getCustomerCpf()), // Você precisará passar o UUID do cliente
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
    public ResponseEntity<Void> deleteVehicle(@PathVariable UUID publicId) {
        vehicleService.delete(publicId);
        return ResponseEntity.noContent().build();
    }

    private VehicleResponse toResponse(Vehicle vehicle) {
        return VehicleResponse.builder()
            .id(vehicle.getPublicId())
            .plate(vehicle.getPlate())
            .model(vehicle.getModel())
            .color(vehicle.getColor())
            .year(vehicle.getModelYear())
            .brand(vehicle.getBrand())
            .observations(vehicle.getObservations())
            .active(vehicle.getActive())
            .customerPublicId(null) // Você precisaria fazer uma query para pegar o UUID do cliente
            .createdAt(vehicle.getCreatedAt())
            .updatedAt(vehicle.getUpdatedAt())
            .build();
    }
}
