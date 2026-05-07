package com.garagem77.scheduling.service;

import com.garagem77.customer.entity.Customer;
import com.garagem77.customer.entity.Vehicle;
import com.garagem77.customer.repository.CustomerRepository;
import com.garagem77.customer.repository.VehicleRepository;
import com.garagem77.scheduling.entity.Schedule;
import com.garagem77.scheduling.repository.ScheduleRepository;
import com.garagem77.service.entity.Service;
import com.garagem77.service.repository.ServiceRepository;
import com.garagem77.shared.exception.BusinessRuleException;
import com.garagem77.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final CustomerRepository customerRepository;
    private final VehicleRepository vehicleRepository;
    private final ServiceRepository serviceRepository;

    @Transactional(readOnly = true)
    public Schedule findByPublicId(UUID publicId) {
        return scheduleRepository.findByPublicId(publicId)
            .orElseThrow(() -> new ResourceNotFoundException("Agendamento não encontrado: " + publicId));
    }

    @Transactional(readOnly = true)
    public List<Schedule> findByCustomerId(UUID customerPublicId) {
        Customer customer = customerRepository.findByPublicId(customerPublicId)
            .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado: " + customerPublicId));

        return scheduleRepository.findByCustomerId(customer.getId());
    }

    @Transactional(readOnly = true)
    public List<Schedule> findByStatus(String status) {
        return scheduleRepository.findByStatus(status);
    }

    @Transactional(readOnly = true)
    public Page<Schedule> findAllPaged(Pageable pageable) {
        return scheduleRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Page<Schedule> findByStatusPaged(String status, Pageable pageable) {
        return scheduleRepository.findByStatus(status, pageable);
    }

    @Transactional(readOnly = true)
    public Customer getCustomerById(Long id) {
        return customerRepository.findById(id).orElse(null);
    }

    @Transactional(readOnly = true)
    public Vehicle getVehicleById(Long id) {
        return vehicleRepository.findById(id).orElse(null);
    }

    @Transactional(readOnly = true)
    public Service getServiceById(Long id) {
        return serviceRepository.findById(id).orElse(null);
    }

    public void delete(UUID publicId) {
        Schedule schedule = findByPublicId(publicId);
        scheduleRepository.delete(schedule);
        log.info("Agendamento removido: {}", publicId);
    }

    public Schedule create(UUID customerPublicId, UUID vehiclePublicId, UUID servicePublicId, LocalDateTime scheduledAt, String notes) {
        validateScheduledAt(scheduledAt);

        Customer customer = customerRepository.findByPublicId(customerPublicId)
            .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado: " + customerPublicId));

        Vehicle vehicle = vehicleRepository.findByPublicId(vehiclePublicId)
            .orElseThrow(() -> new ResourceNotFoundException("Veículo não encontrado: " + vehiclePublicId));

        Service service = serviceRepository.findByPublicId(servicePublicId)
            .orElseThrow(() -> new ResourceNotFoundException("Serviço não encontrado: " + servicePublicId));

        Schedule schedule = Schedule.builder()
            .customerId(customer.getId())
            .vehicleId(vehicle.getId())
            .serviceId(service.getId())
            .scheduledAt(scheduledAt)
            .status("SCHEDULED")
            .notes(notes)
            .build();

        Schedule saved = scheduleRepository.save(schedule);
        log.info("Agendamento criado: {} às {}", customer.getName(), scheduledAt);
        return saved;
    }

    public Schedule update(UUID publicId, LocalDateTime scheduledAt, String notes) {
        Schedule schedule = findByPublicId(publicId);

        if (!schedule.getStatus().equals("SCHEDULED")) {
            throw new BusinessRuleException("Não é possível alterar agendamento que não está em SCHEDULED");
        }

        if (scheduledAt != null) {
            validateScheduledAt(scheduledAt);
            schedule.setScheduledAt(scheduledAt);
        }

        if (notes != null) schedule.setNotes(notes);

        Schedule updated = scheduleRepository.save(schedule);
        log.info("Agendamento atualizado: {}", updated.getPublicId());
        return updated;
    }

    public void cancel(UUID publicId) {
        Schedule schedule = findByPublicId(publicId);

        if (schedule.getStatus().equals("COMPLETED")) {
            throw new BusinessRuleException("Não é possível cancelar agendamento já concluído");
        }

        schedule.setStatus("CANCELLED");
        scheduleRepository.save(schedule);
        log.info("Agendamento cancelado: {}", publicId);
    }

    public void markAsInProgress(UUID publicId) {
        Schedule schedule = findByPublicId(publicId);
        schedule.setStatus("IN_PROGRESS");
        scheduleRepository.save(schedule);
        log.info("Agendamento marcado como em andamento: {}", publicId);
    }

    public void complete(UUID publicId) {
        Schedule schedule = findByPublicId(publicId);
        schedule.setStatus("COMPLETED");
        scheduleRepository.save(schedule);
        log.info("Agendamento concluído: {}", publicId);
    }

    private void validateScheduledAt(LocalDateTime scheduledAt) {
        if (scheduledAt == null || scheduledAt.isBefore(LocalDateTime.now())) {
            throw new BusinessRuleException("Data de agendamento deve ser no futuro");
        }
    }
}
