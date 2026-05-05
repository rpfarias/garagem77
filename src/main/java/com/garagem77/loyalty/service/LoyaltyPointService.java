package com.garagem77.loyalty.service;

import com.garagem77.customer.entity.Customer;
import com.garagem77.customer.repository.CustomerRepository;
import com.garagem77.loyalty.entity.LoyaltyPoint;
import com.garagem77.loyalty.entity.LoyaltyProgram;
import com.garagem77.loyalty.repository.LoyaltyPointRepository;
import com.garagem77.loyalty.repository.LoyaltyProgramRepository;
import com.garagem77.shared.exception.BusinessRuleException;
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
public class LoyaltyPointService {

    private final LoyaltyPointRepository loyaltyPointRepository;
    private final CustomerRepository customerRepository;
    private final LoyaltyProgramRepository loyaltyProgramRepository;

    @Transactional(readOnly = true)
    public LoyaltyPoint findByPublicId(UUID publicId) {
        return loyaltyPointRepository.findByPublicId(publicId)
            .orElseThrow(() -> new ResourceNotFoundException("Saldo de pontos não encontrado: " + publicId));
    }

    @Transactional(readOnly = true)
    public LoyaltyPoint findByCustomerId(UUID customerPublicId) {
        Customer customer = customerRepository.findByPublicId(customerPublicId)
            .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado: " + customerPublicId));

        LoyaltyProgram program = loyaltyProgramRepository.findByActive(true).stream()
            .findFirst()
            .orElseThrow(() -> new ResourceNotFoundException("Nenhum programa de fidelidade ativo"));

        return loyaltyPointRepository.findByCustomerIdAndProgramId(customer.getId(), program.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Cliente não possui pontos cadastrados neste programa"));
    }

    @Transactional(readOnly = true)
    public Integer getTotalPoints(UUID customerPublicId) {
        Customer customer = customerRepository.findByPublicId(customerPublicId)
            .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado: " + customerPublicId));

        Long total = loyaltyPointRepository.sumPointsByCustomerId(customer.getId());
        return total != null ? total.intValue() : 0;
    }

    public LoyaltyPoint createOrGetForCustomer(UUID customerPublicId) {
        Customer customer = customerRepository.findByPublicId(customerPublicId)
            .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado: " + customerPublicId));

        LoyaltyProgram program = loyaltyProgramRepository.findByActive(true).stream()
            .findFirst()
            .orElseThrow(() -> new ResourceNotFoundException("Nenhum programa de fidelidade ativo"));

        return loyaltyPointRepository.findByCustomerIdAndProgramId(customer.getId(), program.getId())
            .orElseGet(() -> {
                LoyaltyPoint loyaltyPoint = LoyaltyPoint.builder()
                    .customerId(customer.getId())
                    .programId(program.getId())
                    .pointsBalance(0)
                    .build();

                LoyaltyPoint saved = loyaltyPointRepository.save(loyaltyPoint);
                log.info("Saldo de pontos criado para cliente: {} (Programa: {})", customer.getName(), program.getName());
                return saved;
            });
    }

    public void addPoints(UUID customerPublicId, Integer points) {
        if (points <= 0) {
            throw new BusinessRuleException("Quantidade de pontos deve ser maior que 0");
        }

        LoyaltyPoint loyaltyPoint = findByCustomerId(customerPublicId);
        loyaltyPoint.setPointsBalance(loyaltyPoint.getPointsBalance() + points);
        loyaltyPointRepository.save(loyaltyPoint);

        log.info("Pontos adicionados ao cliente: {} ({} pontos)", customerPublicId, points);
    }

    public void redeemPoints(UUID customerPublicId, Integer points) {
        if (points <= 0) {
            throw new BusinessRuleException("Quantidade de pontos deve ser maior que 0");
        }

        LoyaltyPoint loyaltyPoint = findByCustomerId(customerPublicId);

        if (loyaltyPoint.getPointsBalance() < points) {
            throw new BusinessRuleException(
                "Saldo insuficiente de pontos. Disponível: " + loyaltyPoint.getPointsBalance() + ", Solicitado: " + points
            );
        }

        loyaltyPoint.setPointsBalance(loyaltyPoint.getPointsBalance() - points);
        loyaltyPointRepository.save(loyaltyPoint);

        log.info("Pontos resgatados do cliente: {} ({} pontos)", customerPublicId, points);
    }

    @Transactional(readOnly = true)
    public List<LoyaltyPoint> findActivePoints(UUID customerPublicId) {
        Customer customer = customerRepository.findByPublicId(customerPublicId)
            .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado: " + customerPublicId));

        return loyaltyPointRepository.findActivePointsByCustomerId(customer.getId());
    }
}
