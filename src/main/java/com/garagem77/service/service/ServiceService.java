package com.garagem77.service.service;

import com.garagem77.service.entity.Service;
import com.garagem77.service.repository.ServiceRepository;
import com.garagem77.shared.exception.BusinessRuleException;
import com.garagem77.shared.exception.DuplicateResourceException;
import com.garagem77.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ServiceService {

    private final ServiceRepository serviceRepository;

    @Transactional(readOnly = true)
    public Service findByPublicId(UUID publicId) {
        return serviceRepository.findByPublicId(publicId)
            .orElseThrow(() -> new ResourceNotFoundException("Serviço não encontrado: " + publicId));
    }

    @Transactional(readOnly = true)
    public Service findByName(String name) {
        return serviceRepository.findByName(name)
            .orElseThrow(() -> new ResourceNotFoundException("Serviço não encontrado: " + name));
    }

    @Transactional(readOnly = true)
    public List<Service> findAll() {
        return serviceRepository.findByActive(true);
    }

    @Transactional(readOnly = true)
    public List<Service> findByNameContaining(String name) {
        return serviceRepository.findByNameContainingIgnoreCase(name);
    }

    @Transactional(readOnly = true)
    public Page<Service> findAllPaged(Pageable pageable) {
        return serviceRepository.findByActive(true, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Service> searchByName(String name, Pageable pageable) {
        return serviceRepository.findByActiveAndNameContainingIgnoreCase(true, name, pageable);
    }

    public void delete(UUID publicId) {
        Service service = findByPublicId(publicId);
        service.setActive(false);
        serviceRepository.save(service);
        log.info("Serviço removido (soft delete): {}", publicId);
    }

    public Service create(String name, String description, BigDecimal price, Integer durationMinutes) {
        validatePrice(price);

        if (serviceRepository.findByName(name).isPresent()) {
            throw new DuplicateResourceException("Serviço já existe: " + name);
        }

        Service service = Service.builder()
            .name(name)
            .description(description)
            .price(price)
            .durationMinutes(durationMinutes)
            .active(true)
            .build();

        Service saved = serviceRepository.save(service);
        log.info("Serviço criado: {} (R$ {})", saved.getName(), saved.getPrice());
        return saved;
    }

    public Service update(UUID publicId, String name, String description, BigDecimal price, Integer durationMinutes) {
        Service service = findByPublicId(publicId);

        if (name != null && !name.equals(service.getName())) {
            if (serviceRepository.findByName(name).isPresent()) {
                throw new DuplicateResourceException("Serviço já existe: " + name);
            }
            service.setName(name);
        }

        if (price != null) {
            validatePrice(price);
            service.setPrice(price);
        }

        if (description != null) service.setDescription(description);
        if (durationMinutes != null) service.setDurationMinutes(durationMinutes);

        Service updated = serviceRepository.save(service);
        log.info("Serviço atualizado: {}", updated.getPublicId());
        return updated;
    }

    public void toggleActive(UUID publicId) {
        Service service = findByPublicId(publicId);
        service.setActive(!service.getActive());
        serviceRepository.save(service);
        log.info("Status do serviço alterado para: {}", service.getActive());
    }

    private void validatePrice(BigDecimal price) {
        if (price == null || price.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessRuleException("Preço deve ser maior que 0");
        }
    }
}
