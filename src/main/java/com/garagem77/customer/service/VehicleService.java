package com.garagem77.customer.service;

import com.garagem77.customer.entity.Customer;
import com.garagem77.customer.entity.Vehicle;
import com.garagem77.customer.repository.CustomerRepository;
import com.garagem77.customer.repository.VehicleRepository;
import com.garagem77.shared.exception.BusinessRuleException;
import com.garagem77.shared.exception.DuplicateResourceException;
import com.garagem77.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final CustomerRepository customerRepository;

    @Transactional(readOnly = true)
    public Vehicle findByPublicId(UUID publicId) {
        return vehicleRepository.findByPublicId(publicId)
            .orElseThrow(() -> new ResourceNotFoundException("Veículo não encontrado: " + publicId));
    }

    @Transactional(readOnly = true)
    public Vehicle findByPlate(String plate) {
        return vehicleRepository.findByPlate(plate)
            .orElseThrow(() -> new ResourceNotFoundException("Veículo não encontrado: " + plate));
    }

    @Transactional(readOnly = true)
    public List<Vehicle> findByCustomerId(UUID customerPublicId) {
        Customer customer = customerRepository.findByPublicId(customerPublicId)
            .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado: " + customerPublicId));

        return vehicleRepository.findByCustomerIdAndActive(customer.getId(), true);
    }

    public Vehicle create(UUID customerPublicId, String plate, String model, String color, Integer year, String brand, String observations) {
        validatePlate(plate);

        if (vehicleRepository.findByPlate(plate).isPresent()) {
            throw new DuplicateResourceException("Placa já existe: " + plate);
        }

        Customer customer = customerRepository.findByPublicId(customerPublicId)
            .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado: " + customerPublicId));

        Vehicle vehicle = Vehicle.builder()
            .customerId(customer.getId())
            .plate(plate)
            .model(model)
            .color(color)
            .year(year)
            .brand(brand)
            .observations(observations)
            .active(true)
            .build();

        Vehicle saved = vehicleRepository.save(vehicle);
        log.info("Veículo criado: {} (Placa: {})", saved.getModel(), plate);
        return saved;
    }

    public Vehicle update(UUID publicId, String plate, String model, String color, Integer year, String brand, String observations) {
        Vehicle vehicle = findByPublicId(publicId);

        if (plate != null && !plate.equals(vehicle.getPlate())) {
            validatePlate(plate);
            if (vehicleRepository.findByPlate(plate).isPresent()) {
                throw new DuplicateResourceException("Placa já existe: " + plate);
            }
            vehicle.setPlate(plate);
        }

        if (model != null) vehicle.setModel(model);
        if (color != null) vehicle.setColor(color);
        if (year != null) vehicle.setYear(year);
        if (brand != null) vehicle.setBrand(brand);
        if (observations != null) vehicle.setObservations(observations);

        Vehicle updated = vehicleRepository.save(vehicle);
        log.info("Veículo atualizado: {}", updated.getPublicId());
        return updated;
    }

    public void delete(UUID publicId) {
        Vehicle vehicle = findByPublicId(publicId);
        vehicle.setActive(false);
        vehicleRepository.save(vehicle);
        log.info("Veículo deletado: {}", publicId);
    }

    private void validatePlate(String plate) {
        if (plate == null || plate.length() < 7 || plate.length() > 10) {
            throw new BusinessRuleException("Placa deve ter entre 7 e 10 caracteres");
        }
    }
}
