package com.garagem77.loyalty.service;

import com.garagem77.loyalty.entity.LoyaltyPoint;
import com.garagem77.loyalty.entity.LoyaltyTransaction;
import com.garagem77.loyalty.repository.LoyaltyTransactionRepository;
import com.garagem77.order.entity.Order;
import com.garagem77.order.repository.OrderRepository;
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

    /**
     * Registra ganho de pontos a partir de um pedido.
     * Calcula os pontos baseado no valor (1 ponto por real) e delega para
     * LoyaltyPointService.addPoints (que já registra a transação).
     */
    public void recordEarning(UUID customerPublicId, UUID orderPublicId, BigDecimal orderAmount) {
        Order order = orderRepository.findByPublicId(orderPublicId)
            .orElseThrow(() -> new ResourceNotFoundException("Ordem não encontrada: " + orderPublicId));

        Integer points = orderAmount.intValue();
        String description = "Pontos ganhos pela ordem: " + orderPublicId;
        loyaltyPointService.addPoints(customerPublicId, points, description);

        log.info("Ganho de pontos registrado: {} pontos pela ordem {}", points, order.getPublicId());
    }

    /**
     * Registra resgate manual de pontos.
     * Delega para LoyaltyPointService.redeemPoints (que valida saldo e registra a transação).
     */
    public void recordRedemption(UUID customerPublicId, Integer points, String description) {
        loyaltyPointService.redeemPoints(customerPublicId, points, description);
        log.info("Resgate de pontos registrado: {} pontos do cliente {}", points, customerPublicId);
    }

    @Transactional(readOnly = true)
    public Integer getTotalEarnedPoints(UUID loyaltyPointPublicId) {
        LoyaltyPoint lp = loyaltyPointService.findByPublicId(loyaltyPointPublicId);
        Integer total = loyaltyTransactionRepository.sumEarnedPointsByLoyaltyPointId(lp.getId());
        return total != null ? total : 0;
    }

    @Transactional(readOnly = true)
    public Integer getTotalRedeemedPoints(UUID loyaltyPointPublicId) {
        LoyaltyPoint lp = loyaltyPointService.findByPublicId(loyaltyPointPublicId);
        Integer total = loyaltyTransactionRepository.sumRedeemedPointsByLoyaltyPointId(lp.getId());
        return total != null ? total : 0;
    }

    @Transactional(readOnly = true)
    public List<LoyaltyTransaction> getTransactionHistory(UUID customerPublicId) {
        var loyaltyPoint = loyaltyPointService.findByCustomerId(customerPublicId);
        return loyaltyTransactionRepository.findByLoyaltyPointIdOrderByCreatedAtDesc(loyaltyPoint.getId());
    }
}
