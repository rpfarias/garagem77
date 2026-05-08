package com.garagem77.billing.controller;

import com.garagem77.billing.dto.PaymentCreateRequest;
import com.garagem77.billing.dto.PaymentResponse;
import com.garagem77.billing.entity.Payment;
import com.garagem77.billing.service.PaymentService;
import com.garagem77.customer.entity.Customer;
import com.garagem77.order.entity.Order;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@Tag(name = "Pagamentos", description = "Gerenciamento de pagamentos de pedidos")
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping
    @Operation(summary = "Listar pagamentos paginados", description = "Lista paginada de pagamentos com filtro opcional por status")
    public ResponseEntity<Page<PaymentResponse>> listPayments(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Payment> payments = (status != null && !status.isBlank())
            ? paymentService.findByStatusPaged(status, pageable)
            : paymentService.findAllPaged(pageable);
        return ResponseEntity.ok(payments.map(this::toResponse));
    }

    @GetMapping("/{publicId}")
    @Operation(summary = "Buscar pagamento por ID")
    public ResponseEntity<PaymentResponse> getPaymentById(@PathVariable UUID publicId) {
        Payment payment = paymentService.findByPublicId(publicId);
        return ResponseEntity.ok(toResponse(payment));
    }

    @GetMapping("/order/{orderPublicId}")
    @Operation(summary = "Listar pagamentos de uma ordem")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByOrder(@PathVariable UUID orderPublicId) {
        List<Payment> payments = paymentService.findByOrderId(orderPublicId);
        return ResponseEntity.ok(payments.stream().map(this::toResponse).collect(Collectors.toList()));
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Listar pagamentos por status (não paginado)")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByStatus(@PathVariable String status) {
        List<Payment> payments = paymentService.findByStatus(status);
        return ResponseEntity.ok(payments.stream().map(this::toResponse).collect(Collectors.toList()));
    }

    @PostMapping
    @Operation(summary = "Criar novo pagamento")
    public ResponseEntity<PaymentResponse> createPayment(@Valid @RequestBody PaymentCreateRequest request) {
        Payment payment = paymentService.create(
            request.getOrderId(),
            request.getPaymentMethod(),
            request.getAmount()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(payment));
    }

    @PatchMapping("/{publicId}/complete")
    @Operation(summary = "Marcar pagamento como concluído")
    public ResponseEntity<PaymentResponse> completePayment(
            @PathVariable UUID publicId,
            @RequestParam(required = false) String transactionId) {
        Payment payment = paymentService.completePayment(publicId, transactionId);
        return ResponseEntity.ok(toResponse(payment));
    }

    @PatchMapping("/{publicId}/fail")
    @Operation(summary = "Marcar pagamento como falhado")
    public ResponseEntity<Void> failPayment(
            @PathVariable UUID publicId,
            @RequestParam(required = false) String reason) {
        paymentService.failPayment(publicId, reason);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{publicId}/cancel")
    @Operation(summary = "Cancelar pagamento")
    public ResponseEntity<Void> cancelPayment(@PathVariable UUID publicId) {
        paymentService.cancelPayment(publicId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{publicId}")
    @Operation(summary = "Remover pagamento permanentemente")
    public ResponseEntity<Void> deletePayment(@PathVariable UUID publicId) {
        paymentService.delete(publicId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/order/{orderPublicId}/total-paid")
    @Operation(summary = "Obter valor total pago de uma ordem")
    public ResponseEntity<BigDecimal> getTotalPaidAmount(@PathVariable UUID orderPublicId) {
        BigDecimal total = paymentService.getTotalPaidAmount(orderPublicId);
        return ResponseEntity.ok(total);
    }

    private PaymentResponse toResponse(Payment payment) {
        Order order = paymentService.getOrderById(payment.getOrderId());
        Customer customer = order != null ? paymentService.getCustomerById(order.getCustomerId()) : null;

        return PaymentResponse.builder()
            .id(payment.getPublicId())
            .orderPublicId(order != null ? order.getPublicId() : null)
            .customerName(customer != null ? customer.getName() : null)
            .orderFinalAmount(order != null ? order.getFinalAmount() : null)
            .paymentMethod(payment.getPaymentMethod())
            .amount(payment.getAmount())
            .status(payment.getStatus())
            .paymentDate(payment.getPaymentDate())
            .transactionId(payment.getTransactionId())
            .createdAt(payment.getCreatedAt())
            .updatedAt(payment.getUpdatedAt())
            .build();
    }
}
