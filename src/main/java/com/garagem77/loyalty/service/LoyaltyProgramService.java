package com.garagem77.loyalty.service;

import com.garagem77.loyalty.entity.LoyaltyProgram;
import com.garagem77.loyalty.repository.LoyaltyProgramRepository;
import com.garagem77.shared.exception.BusinessRuleException;
import com.garagem77.shared.exception.DuplicateResourceException;
import com.garagem77.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class LoyaltyProgramService {

    private final LoyaltyProgramRepository loyaltyProgramRepository;

    @Transactional(readOnly = true)
    public LoyaltyProgram findByPublicId(UUID publicId) {
        return loyaltyProgramRepository.findByPublicId(publicId)
            .orElseThrow(() -> new ResourceNotFoundException("Programa de fidelidade não encontrado: " + publicId));
    }

    @Transactional(readOnly = true)
    public LoyaltyProgram findByName(String name) {
        return loyaltyProgramRepository.findByName(name)
            .orElseThrow(() -> new ResourceNotFoundException("Programa de fidelidade não encontrado: " + name));
    }

    @Transactional(readOnly = true)
    public LoyaltyProgram getActive() {
        return loyaltyProgramRepository.findByActive(true).stream()
            .findFirst()
            .orElseThrow(() -> new ResourceNotFoundException("Nenhum programa de fidelidade ativo encontrado"));
    }

    public LoyaltyProgram create(String name, BigDecimal pointsPerReal) {
        validatePointsPerReal(pointsPerReal);

        if (loyaltyProgramRepository.findByName(name).isPresent()) {
            throw new DuplicateResourceException("Programa já existe: " + name);
        }

        if (!loyaltyProgramRepository.findByActive(true).isEmpty()) {
            throw new BusinessRuleException("Já existe um programa de fidelidade ativo. Desative antes de criar novo.");
        }

        LoyaltyProgram program = LoyaltyProgram.builder()
            .name(name)
            .pointsPerReal(pointsPerReal)
            .active(true)
            .build();

        LoyaltyProgram saved = loyaltyProgramRepository.save(program);
        log.info("Programa de fidelidade criado: {} ({} pontos por real)", saved.getName(), pointsPerReal);
        return saved;
    }

    public LoyaltyProgram update(UUID publicId, String name, BigDecimal pointsPerReal) {
        LoyaltyProgram program = findByPublicId(publicId);

        if (name != null && !name.equals(program.getName())) {
            if (loyaltyProgramRepository.findByName(name).isPresent()) {
                throw new DuplicateResourceException("Programa já existe: " + name);
            }
            program.setName(name);
        }

        if (pointsPerReal != null) {
            validatePointsPerReal(pointsPerReal);
            program.setPointsPerReal(pointsPerReal);
        }

        LoyaltyProgram updated = loyaltyProgramRepository.save(program);
        log.info("Programa de fidelidade atualizado: {}", updated.getPublicId());
        return updated;
    }

    public void toggleActive(UUID publicId) {
        LoyaltyProgram program = findByPublicId(publicId);

        if (program.getActive() && !loyaltyProgramRepository.findByActive(false).isEmpty()) {
            throw new BusinessRuleException("Não é possível desativar o único programa ativo");
        }

        program.setActive(!program.getActive());
        loyaltyProgramRepository.save(program);
        log.info("Status do programa alterado para: {}", program.getActive());
    }

    private void validatePointsPerReal(BigDecimal pointsPerReal) {
        if (pointsPerReal == null || pointsPerReal.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessRuleException("Pontos por real deve ser maior que 0");
        }
    }
}
