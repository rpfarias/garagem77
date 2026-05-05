package com.garagem77.service.controller;

import com.garagem77.service.dto.ServiceCreateRequest;
import com.garagem77.service.dto.ServiceResponse;
import com.garagem77.service.entity.Service;
import com.garagem77.service.service.ServiceService;
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
public class ServiceController {

    private final ServiceService serviceService;

    @GetMapping("/{publicId}")
    public ResponseEntity<ServiceResponse> getServiceById(@PathVariable UUID publicId) {
        Service service = serviceService.findByPublicId(publicId);
        return ResponseEntity.ok(toResponse(service));
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<ServiceResponse> getServiceByName(@PathVariable String name) {
        Service service = serviceService.findByName(name);
        return ResponseEntity.ok(toResponse(service));
    }

    @GetMapping("/search")
    public ResponseEntity<List<ServiceResponse>> searchByName(@RequestParam String name) {
        List<Service> services = serviceService.findByNameContaining(name);
        List<ServiceResponse> responses = services.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping
    public ResponseEntity<List<ServiceResponse>> getAllServices() {
        List<Service> services = serviceService.findAll();
        List<ServiceResponse> responses = services.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @PostMapping
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
