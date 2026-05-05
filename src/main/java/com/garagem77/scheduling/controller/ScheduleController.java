package com.garagem77.scheduling.controller;

import com.garagem77.scheduling.dto.ScheduleCreateRequest;
import com.garagem77.scheduling.dto.ScheduleResponse;
import com.garagem77.scheduling.entity.Schedule;
import com.garagem77.scheduling.service.ScheduleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/schedules")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    @GetMapping("/{publicId}")
    public ResponseEntity<ScheduleResponse> getScheduleById(@PathVariable UUID publicId) {
        Schedule schedule = scheduleService.findByPublicId(publicId);
        return ResponseEntity.ok(toResponse(schedule));
    }

    @GetMapping("/customer/{customerPublicId}")
    public ResponseEntity<List<ScheduleResponse>> getSchedulesByCustomer(@PathVariable UUID customerPublicId) {
        List<Schedule> schedules = scheduleService.findByCustomerId(customerPublicId);
        List<ScheduleResponse> responses = schedules.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<ScheduleResponse>> getSchedulesByStatus(@PathVariable String status) {
        List<Schedule> schedules = scheduleService.findByStatus(status);
        List<ScheduleResponse> responses = schedules.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @PostMapping
    public ResponseEntity<ScheduleResponse> createSchedule(@Valid @RequestBody ScheduleCreateRequest request) {
        // Nota: Você precisaria buscar o UUID do cliente pelo CPF
        Schedule schedule = scheduleService.create(
            null, // customerPublicId precisa ser extraído do CPF
            null, // vehiclePublicId precisa ser extraído da placa
            request.getServiceId(),
            request.getScheduledAt(),
            request.getNotes()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(schedule));
    }

    @PutMapping("/{publicId}")
    public ResponseEntity<ScheduleResponse> updateSchedule(
            @PathVariable UUID publicId,
            @RequestParam(required = false) java.time.LocalDateTime scheduledAt,
            @RequestParam(required = false) String notes) {
        Schedule schedule = scheduleService.update(publicId, scheduledAt, notes);
        return ResponseEntity.ok(toResponse(schedule));
    }

    @PatchMapping("/{publicId}/cancel")
    public ResponseEntity<Void> cancelSchedule(@PathVariable UUID publicId) {
        scheduleService.cancel(publicId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{publicId}/in-progress")
    public ResponseEntity<Void> markInProgress(@PathVariable UUID publicId) {
        scheduleService.markAsInProgress(publicId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{publicId}/complete")
    public ResponseEntity<Void> completeSchedule(@PathVariable UUID publicId) {
        scheduleService.complete(publicId);
        return ResponseEntity.noContent().build();
    }

    private ScheduleResponse toResponse(Schedule schedule) {
        return ScheduleResponse.builder()
            .id(schedule.getPublicId())
            .scheduledAt(schedule.getScheduledAt())
            .status(schedule.getStatus())
            .notes(schedule.getNotes())
            .createdAt(schedule.getCreatedAt())
            .updatedAt(schedule.getUpdatedAt())
            .build();
    }
}
