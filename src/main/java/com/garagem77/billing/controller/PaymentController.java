package com.garagem77.billing.controller;

import com.garagem77.billing.entity.Payment;
import com.garagem77.billing.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/{publicId}")
    public ResponseEntity<Payment> getPaymentById(@PathVariable UUID publicId) {
        Payment payment = paymentService.findByPublicId(publicId);
        return ResponseEntity.ok(payment);
    }

    @GetMapping("/order/{orderPublicId}")
    public ResponseEntity<List<Payment>> getPaymentsByOrder(@PathVariable UUID orderPublicId) {
        List<Payment> payments = paymentService.findByOrderId(orderPublicId);
        return ResponseEntity.ok(payments);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Payment>> getPaymentsByStatus(@PathVariable String status) {
        List<Payment> payments = paymentService.findByStatus(status);
        return ResponseEntity.ok(payments);
    }

    @PostMapping
    public ResponseEntity<Payment> createPayment(
            @RequestParam UUID orderPublicId,
            @RequestParam String paymentMethod,
            @RequestParam BigDecimal amount) {
        Payment payment = paymentService.create(orderPublicId, paymentMethod, amount);
        return ResponseEntity.status(HttpStatus.CREATED).body(payment);
    }

    @PatchMapping("/{publicId}/complete")
    public ResponseEntity<Payment> completePayment(
            @PathVariable UUID publicId,
            @RequestParam(required = false) String transactionId) {
        Payment payment = paymentService.completePayment(publicId, transactionId);
        return ResponseEntity.ok(payment);
    }

    @PatchMapping("/{publicId}/fail")
    public ResponseEntity<Void> failPayment(
            @PathVariable UUID publicId,
            @RequestParam(required = false) String reason) {
        paymentService.failPayment(publicId, reason);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{publicId}/cancel")
    public ResponseEntity<Void> cancelPayment(@PathVariable UUID publicId) {
        paymentService.cancelPayment(publicId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/order/{orderPublicId}/total-paid")
    public ResponseEntity<BigDecimal> getTotalPaidAmount(@PathVariable UUID orderPublicId) {
        BigDecimal totalPaid = paymentService.getTotalPaidAmount(orderPublicId);
        return ResponseEntity.ok(totalPaid);
    }
}
