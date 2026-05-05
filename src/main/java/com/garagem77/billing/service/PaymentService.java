package com.garagem77.billing.service;

import com.garagem77.billing.entity.Payment;
import com.garagem77.billing.repository.PaymentRepository;
import com.garagem77.order.entity.Order;
import com.garagem77.order.repository.OrderRepository;
import com.garagem77.shared.exception.BusinessRuleException;
import com.garagem77.shared.exception.DuplicateResourceException;
import com.garagem77.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public Payment findByPublicId(UUID publicId) {
        return paymentRepository.findByPublicId(publicId)
            .orElseThrow(() -> new ResourceNotFoundException("Pagamento não encontrado: " + publicId));
    }

    @Transactional(readOnly = true)
    public List<Payment> findByOrderId(UUID orderPublicId) {
        Order order = orderRepository.findByPublicId(orderPublicId)
            .orElseThrow(() -> new ResourceNotFoundException("Ordem não encontrada: " + orderPublicId));

        return paymentRepository.findByOrderId(order.getId());
    }

    @Transactional(readOnly = true)
    public List<Payment> findByStatus(String status) {
        return paymentRepository.findByStatus(status);
    }

    public Payment create(UUID orderPublicId, String paymentMethod, BigDecimal amount) {
        validatePaymentMethod(paymentMethod);

        Order order = orderRepository.findByPublicId(orderPublicId)
            .orElseThrow(() -> new ResourceNotFoundException("Ordem não encontrada: " + orderPublicId));

        validatePaymentAmount(order, amount);

        Payment payment = Payment.builder()
            .orderId(order.getId())
            .paymentMethod(paymentMethod)
            .amount(amount)
            .status("PENDING")
            .build();

        Payment saved = paymentRepository.save(payment);
        log.info("Pagamento criado: {} - R$ {} ({})", saved.getPublicId(), amount, paymentMethod);
        return saved;
    }

    public Payment completePayment(UUID paymentPublicId, String transactionId) {
        Payment payment = findByPublicId(paymentPublicId);

        if (transactionId != null && paymentRepository.findByTransactionId(transactionId).isPresent()) {
            throw new DuplicateResourceException("TransactionId já existe: " + transactionId);
        }

        payment.setStatus("COMPLETED");
        payment.setPaymentDate(LocalDateTime.now());
        payment.setTransactionId(transactionId);

        Payment saved = paymentRepository.save(payment);

        checkAndCompleteOrder(payment.getOrderId());

        log.info("Pagamento concluído: {} - Transaction: {}", paymentPublicId, transactionId);
        return saved;
    }

    public void failPayment(UUID paymentPublicId, String reason) {
        Payment payment = findByPublicId(paymentPublicId);
        payment.setStatus("FAILED");
        paymentRepository.save(payment);

        log.warn("Pagamento falhou: {} - Motivo: {}", paymentPublicId, reason);
    }

    public void cancelPayment(UUID paymentPublicId) {
        Payment payment = findByPublicId(paymentPublicId);

        if (payment.getStatus().equals("COMPLETED")) {
            throw new BusinessRuleException("Não é possível cancelar pagamento já concluído. Use reembolso.");
        }

        payment.setStatus("CANCELLED");
        paymentRepository.save(payment);

        log.info("Pagamento cancelado: {}", paymentPublicId);
    }

    @Transactional(readOnly = true)
    public BigDecimal getTotalPaidAmount(UUID orderPublicId) {
        Order order = orderRepository.findByPublicId(orderPublicId)
            .orElseThrow(() -> new ResourceNotFoundException("Ordem não encontrada: " + orderPublicId));

        List<Payment> payments = paymentRepository.findByOrderId(order.getId());

        return payments.stream()
            .filter(p -> p.getStatus().equals("COMPLETED"))
            .map(Payment::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private void validatePaymentAmount(Order order, BigDecimal amount) {
        BigDecimal totalPaid = getTotalPaidAmount(order.getPublicId());
        BigDecimal remainingAmount = order.getFinalAmount().subtract(totalPaid);

        if (amount.compareTo(remainingAmount) > 0) {
            throw new BusinessRuleException(
                "Valor do pagamento (R$ " + amount + ") excede o saldo devedor (R$ " + remainingAmount + ")"
            );
        }

        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessRuleException("Valor do pagamento deve ser maior que 0");
        }
    }

    private void validatePaymentMethod(String paymentMethod) {
        List<String> validMethods = List.of("PIX", "DINHEIRO", "CARTAO_CREDITO", "CARTAO_DEBITO");
        if (!validMethods.contains(paymentMethod)) {
            throw new BusinessRuleException("Método de pagamento inválido: " + paymentMethod);
        }
    }

    private void checkAndCompleteOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Ordem não encontrada"));

        BigDecimal totalPaid = paymentRepository.findByOrderId(order.getId()).stream()
            .filter(p -> p.getStatus().equals("COMPLETED"))
            .map(Payment::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalPaid.compareTo(order.getFinalAmount()) >= 0) {
            order.setStatus("COMPLETED");
            orderRepository.save(order);
            log.info("Ordem marcada como completada: {} (Pagamento total: R$ {})", order.getPublicId(), totalPaid);
        }
    }
}
