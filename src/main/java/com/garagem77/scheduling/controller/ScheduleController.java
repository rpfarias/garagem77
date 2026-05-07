package com.garagem77.scheduling.controller;

import com.garagem77.customer.entity.Customer;
import com.garagem77.customer.entity.Vehicle;
import com.garagem77.scheduling.dto.ScheduleCreateRequest;
import com.garagem77.scheduling.dto.ScheduleResponse;
import com.garagem77.scheduling.entity.Schedule;
import com.garagem77.scheduling.service.ScheduleService;
import com.garagem77.service.entity.Service;
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
@RequestMapping("/schedules")
@RequiredArgsConstructor
@Tag(name = "Agendamentos", description = "Gerenciamento de agendamentos de serviços")
public class ScheduleController {

    private final ScheduleService scheduleService;

    @GetMapping
    @Operation(summary = "Listar agendamentos paginados", description = "Lista paginada de agendamentos, opcionalmente filtrada por status")
    public ResponseEntity<Page<ScheduleResponse>> listSchedules(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("scheduledAt").descending());
        Page<Schedule> schedules = (status != null && !status.isBlank())
            ? scheduleService.findByStatusPaged(status, pageable)
            : scheduleService.findAllPaged(pageable);
        return ResponseEntity.ok(schedules.map(this::toResponse));
    }

    @GetMapping("/{publicId}")
    @Operation(summary = "Buscar agendamento por ID")
    public ResponseEntity<ScheduleResponse> getScheduleById(@PathVariable UUID publicId) {
        Schedule schedule = scheduleService.findByPublicId(publicId);
        return ResponseEntity.ok(toResponse(schedule));
    }

    @GetMapping("/customer/{customerPublicId}")
    @Operation(summary = "Listar agendamentos de um cliente")
    public ResponseEntity<List<ScheduleResponse>> getSchedulesByCustomer(@PathVariable UUID customerPublicId) {
        List<Schedule> schedules = scheduleService.findByCustomerId(customerPublicId);
        List<ScheduleResponse> responses = schedules.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Listar agendamentos por status (não paginado)")
    public ResponseEntity<List<ScheduleResponse>> getSchedulesByStatus(@PathVariable String status) {
        List<Schedule> schedules = scheduleService.findByStatus(status);
        List<ScheduleResponse> responses = schedules.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @PostMapping
    @Operation(summary = "Criar novo agendamento")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Agendamento criado com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos"),
        @ApiResponse(responseCode = "404", description = "Cliente, veículo ou serviço não encontrado")
    })
    public ResponseEntity<ScheduleResponse> createSchedule(@Valid @RequestBody ScheduleCreateRequest request) {
        Schedule schedule = scheduleService.create(
            request.getCustomerId(),
            request.getVehicleId(),
            request.getServiceId(),
            request.getScheduledAt(),
            request.getNotes()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(schedule));
    }

    @PutMapping("/{publicId}")
    @Operation(summary = "Atualizar agendamento")
    public ResponseEntity<ScheduleResponse> updateSchedule(
            @PathVariable UUID publicId,
            @RequestParam(required = false) java.time.LocalDateTime scheduledAt,
            @RequestParam(required = false) String notes) {
        Schedule schedule = scheduleService.update(publicId, scheduledAt, notes);
        return ResponseEntity.ok(toResponse(schedule));
    }

    @PatchMapping("/{publicId}/cancel")
    @Operation(summary = "Cancelar agendamento")
    public ResponseEntity<Void> cancelSchedule(@PathVariable UUID publicId) {
        scheduleService.cancel(publicId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{publicId}/in-progress")
    @Operation(summary = "Marcar agendamento como em andamento")
    public ResponseEntity<Void> markInProgress(@PathVariable UUID publicId) {
        scheduleService.markAsInProgress(publicId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{publicId}/complete")
    @Operation(summary = "Marcar agendamento como concluído")
    public ResponseEntity<Void> completeSchedule(@PathVariable UUID publicId) {
        scheduleService.complete(publicId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{publicId}")
    @Operation(summary = "Remover agendamento", description = "Remove permanentemente um agendamento")
    public ResponseEntity<Void> deleteSchedule(@PathVariable UUID publicId) {
        scheduleService.delete(publicId);
        return ResponseEntity.noContent().build();
    }

    private ScheduleResponse toResponse(Schedule schedule) {
        Customer customer = scheduleService.getCustomerById(schedule.getCustomerId());
        Vehicle vehicle = scheduleService.getVehicleById(schedule.getVehicleId());
        Service service = scheduleService.getServiceById(schedule.getServiceId());

        return ScheduleResponse.builder()
            .id(schedule.getPublicId())
            .customerPublicId(customer != null ? customer.getPublicId() : null)
            .customerName(customer != null ? customer.getName() : null)
            .vehiclePublicId(vehicle != null ? vehicle.getPublicId() : null)
            .vehiclePlate(vehicle != null ? vehicle.getPlate() : null)
            .vehicleModel(vehicle != null ? vehicle.getModel() : null)
            .serviceId(service != null ? service.getPublicId() : null)
            .serviceName(service != null ? service.getName() : null)
            .servicePrice(service != null ? service.getPrice() : null)
            .scheduledAt(schedule.getScheduledAt())
            .status(schedule.getStatus())
            .notes(schedule.getNotes())
            .createdAt(schedule.getCreatedAt())
            .updatedAt(schedule.getUpdatedAt())
            .build();
    }
}
