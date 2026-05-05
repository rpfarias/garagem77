package com.garagem77.scheduling.controller;

import com.garagem77.scheduling.dto.ScheduleCreateRequest;
import com.garagem77.scheduling.dto.ScheduleResponse;
import com.garagem77.scheduling.entity.Schedule;
import com.garagem77.scheduling.service.ScheduleService;
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
@RequestMapping("/schedules")
@RequiredArgsConstructor
@Tag(name = "Agendamentos", description = "Gerenciamento de agendamentos de serviços")
public class ScheduleController {

    private final ScheduleService scheduleService;

    @GetMapping("/{publicId}")
    @Operation(summary = "Buscar agendamento por ID", description = "Retorna os detalhes de um agendamento específico pelo seu ID público")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Agendamento encontrado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Agendamento não encontrado"),
        @ApiResponse(responseCode = "400", description = "ID inválido")
    })
    public ResponseEntity<ScheduleResponse> getScheduleById(@PathVariable UUID publicId) {
        Schedule schedule = scheduleService.findByPublicId(publicId);
        return ResponseEntity.ok(toResponse(schedule));
    }

    @GetMapping("/customer/{customerPublicId}")
    @Operation(summary = "Listar agendamentos de um cliente", description = "Retorna uma lista de todos os agendamentos de um cliente específico")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de agendamentos retornada com sucesso"),
        @ApiResponse(responseCode = "404", description = "Cliente não encontrado"),
        @ApiResponse(responseCode = "400", description = "ID do cliente inválido")
    })
    public ResponseEntity<List<ScheduleResponse>> getSchedulesByCustomer(@PathVariable UUID customerPublicId) {
        List<Schedule> schedules = scheduleService.findByCustomerId(customerPublicId);
        List<ScheduleResponse> responses = schedules.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Listar agendamentos por status", description = "Retorna uma lista de agendamentos filtrados pelo status especificado")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de agendamentos retornada com sucesso"),
        @ApiResponse(responseCode = "400", description = "Status inválido")
    })
    public ResponseEntity<List<ScheduleResponse>> getSchedulesByStatus(@PathVariable String status) {
        List<Schedule> schedules = scheduleService.findByStatus(status);
        List<ScheduleResponse> responses = schedules.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @PostMapping
    @Operation(summary = "Criar novo agendamento", description = "Cria um novo agendamento de serviço no sistema")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Agendamento criado com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos"),
        @ApiResponse(responseCode = "409", description = "Conflito - Agendamento já existe nesse horário")
    })
    public ResponseEntity<ScheduleResponse> createSchedule(@Valid @RequestBody ScheduleCreateRequest request) {
        Schedule schedule = scheduleService.create(
            null,
            null,
            request.getServiceId(),
            request.getScheduledAt(),
            request.getNotes()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(schedule));
    }

    @PutMapping("/{publicId}")
    @Operation(summary = "Atualizar agendamento", description = "Atualiza as informações de um agendamento existente")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Agendamento atualizado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Agendamento não encontrado"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos")
    })
    public ResponseEntity<ScheduleResponse> updateSchedule(
            @PathVariable UUID publicId,
            @RequestParam(required = false) java.time.LocalDateTime scheduledAt,
            @RequestParam(required = false) String notes) {
        Schedule schedule = scheduleService.update(publicId, scheduledAt, notes);
        return ResponseEntity.ok(toResponse(schedule));
    }

    @PatchMapping("/{publicId}/cancel")
    @Operation(summary = "Cancelar agendamento", description = "Cancela um agendamento existente")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Agendamento cancelado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Agendamento não encontrado"),
        @ApiResponse(responseCode = "400", description = "Agendamento não pode ser cancelado")
    })
    public ResponseEntity<Void> cancelSchedule(@PathVariable UUID publicId) {
        scheduleService.cancel(publicId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{publicId}/in-progress")
    @Operation(summary = "Marcar agendamento como em progresso", description = "Altera o status de um agendamento para em progresso")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Agendamento marcado como em progresso com sucesso"),
        @ApiResponse(responseCode = "404", description = "Agendamento não encontrado"),
        @ApiResponse(responseCode = "400", description = "Agendamento não pode ser marcado como em progresso")
    })
    public ResponseEntity<Void> markInProgress(@PathVariable UUID publicId) {
        scheduleService.markAsInProgress(publicId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{publicId}/complete")
    @Operation(summary = "Completar agendamento", description = "Marca um agendamento como completado")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Agendamento completado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Agendamento não encontrado"),
        @ApiResponse(responseCode = "400", description = "Agendamento não pode ser completado")
    })
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
