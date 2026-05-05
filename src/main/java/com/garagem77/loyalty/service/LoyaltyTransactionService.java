package com.garagem77.loyalty.service;

import com.garagem77.loyalty.entity.LoyaltyTransaction;
import com.garagem77.loyalty.repository.LoyaltyTransactionRepository;
import com.garagem77.order.entity.Order;
import com.garagem77.order.repository.OrderRepository;
import com.garagem77.shared.exception.BusinessRuleException;
import com.garagem77.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class LoyaltyTransactionService {

    private final LoyaltyTransactionRepository loyaltyTransactionRepository;
    private final LoyaltyPointService loyaltyPointService;
    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public LoyaltyTransaction findByPublicId(UUID publicId) {
        return loyaltyTransactionRepository.findByPublicId(publicId)
            .orElseThrow(() -> new ResourceNotFoundException("Transação de pontos não encontrada: " + publicId));
    }

    @Transactional(readOnly = true)
    public List<LoyaltyTransaction> findByLoyaltyPointId(UUID loyaltyPointPublicId) {
        // Você precisaria ter o ID interno aqui - isto é um exemplo simplificado
        return List.of(); // Implementar conforme necessário
    }

    public void recordEarning(UUID customerPublicId, UUID orderPublicId, BigDecimal orderAmount) {
        Order order = orderRepository.findByPublicId(orderPublicId)
            .orElseThrow(() -> new ResourceNotFoundException("Ordem não encontrada: " + orderPublicId));

        var loyaltyPoint = loyaltyPointService.createOrGetForCustomer(customerPublicId);

        // Calcular pontos baseado no valor da ordem
        Integer points = orderAmount.intValue(); // 1 ponto por real

        LoyaltyTransaction transaction = LoyaltyTransaction.builder()
            .loyaltyPointId(loyaltyPoint.getId())
            .orderId(order.getId())
            .transactionType("EARN")
            .pointsValue(points)
            .description("Pontos ganhos pela ordem: " + orderPublicId)
            .build();

        LoyaltyTransaction saved = loyaltyTransactionRepository.save(transaction);

        // Adicionar pontos ao saldo
        loyaltyPointService.addPoints(customerPublicId, points);

        log.info("Transação de ganho registrada: {} pontos para cliente {}", points, customerPublicId);
    }

    public void recordRedemption(UUID customerPublicId, Integer points, String description) {
        if (points <= 0) {
            throw new BusinessRuleException("Quantidade de pontos deve ser maior que 0");
        }

        var loyaltyPoint = loyaltyPointService.findByCustomerId(customerPublicId);

        LoyaltyTransaction transaction = LoyaltyTransaction.builder()
            .loyaltyPointId(loyaltyPoint.getId())
            .orderId(null)
            .transactionType("REDEEM")
            .pointsValue(points)
            .description(description != null ? description : "Resgate de pontos")
            .build();

        LoyaltyTransaction saved = loyaltyTransactionRepository.save(transaction);

        // Remover pontos do saldo
        loyaltyPointService.redeemPoints(customerPublicId, points);

        log.info("Transação de resgate registrada: {} pontos resgatados por cliente {}", points, customerPublicId);
    }

    @Transactional(readOnly = true)
    public Integer getTotalEarnedPoints(UUID loyaltyPointPublicId) {
        // Você precisaria ter o ID interno aqui
        return 0; // Implementar conforme necessário
    }

    @Transactional(readOnly = true)
    public Integer getTotalRedeemedPoints(UUID loyaltyPointPublicId) {
        // Você precisaria ter o ID interno aqui
        return 0; // Implementar conforme necessário
    }

    @Transactional(readOnly = true)
    public List<LoyaltyTransaction> getTransactionHistory(UUID customerPublicId) {
        var loyaltyPoint = loyaltyPointService.findByCustomerId(customerPublicId);
        return loyaltyTransactionRepository.findByLoyaltyPointIdOrderByCreatedAtDesc(loyaltyPoint.getId());
    }
}
