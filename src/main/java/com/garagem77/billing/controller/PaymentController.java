package com.garagem77.billing.controller;

import com.garagem77.billing.entity.Payment;
import com.garagem77.billing.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Pagamentos", description = "Gerenciamento de pagamentos de pedidos")
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/{publicId}")
    @Operation(summary = "Buscar pagamento por ID", description = "Retorna os detalhes de um pagamento específico pelo seu ID público")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Pagamento encontrado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Pagamento não encontrado"),
        @ApiResponse(responseCode = "400", description = "ID inválido")
    })
    public ResponseEntity<Payment> getPaymentById(@PathVariable UUID publicId) {
        Payment payment = paymentService.findByPublicId(publicId);
        return ResponseEntity.ok(payment);
    }

    @GetMapping("/order/{orderPublicId}")
    @Operation(summary = "Listar pagamentos de um pedido", description = "Retorna uma lista de todos os pagamentos associados a um pedido específico")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de pagamentos retornada com sucesso"),
        @ApiResponse(responseCode = "404", description = "Pedido não encontrado"),
        @ApiResponse(responseCode = "400", description = "ID do pedido inválido")
    })
    public ResponseEntity<List<Payment>> getPaymentsByOrder(@PathVariable UUID orderPublicId) {
        List<Payment> payments = paymentService.findByOrderId(orderPublicId);
        return ResponseEntity.ok(payments);
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Listar pagamentos por status", description = "Retorna uma lista de pagamentos filtrados pelo status especificado")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de pagamentos retornada com sucesso"),
        @ApiResponse(responseCode = "400", description = "Status inválido")
    })
    public ResponseEntity<List<Payment>> getPaymentsByStatus(@PathVariable String status) {
        List<Payment> payments = paymentService.findByStatus(status);
        return ResponseEntity.ok(payments);
    }

    @PostMapping
    @Operation(summary = "Criar novo pagamento", description = "Cria um novo pagamento para um pedido existente")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Pagamento criado com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos"),
        @ApiResponse(responseCode = "404", description = "Pedido não encontrado")
    })
    public ResponseEntity<Payment> createPayment(
            @RequestParam UUID orderPublicId,
            @RequestParam String paymentMethod,
            @RequestParam BigDecimal amount) {
        Payment payment = paymentService.create(orderPublicId, paymentMethod, amount);
        return ResponseEntity.status(HttpStatus.CREATED).body(payment);
    }

    @PatchMapping("/{publicId}/complete")
    @Operation(summary = "Completar pagamento", description = "Marca um pagamento como completado com transação confirmada")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Pagamento completado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Pagamento não encontrado"),
        @ApiResponse(responseCode = "400", description = "Pagamento não pode ser completado")
    })
    public ResponseEntity<Payment> completePayment(
            @PathVariable UUID publicId,
            @RequestParam(required = false) String transactionId) {
        Payment payment = paymentService.completePayment(publicId, transactionId);
        return ResponseEntity.ok(payment);
    }

    @PatchMapping("/{publicId}/fail")
    @Operation(summary = "Marcar pagamento como falhado", description = "Marca um pagamento como falhado com motivo opcional")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Pagamento marcado como falhado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Pagamento não encontrado"),
        @ApiResponse(responseCode = "400", description = "Pagamento não pode ser marcado como falhado")
    })
    public ResponseEntity<Void> failPayment(
            @PathVariable UUID publicId,
            @RequestParam(required = false) String reason) {
        paymentService.failPayment(publicId, reason);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{publicId}/cancel")
    @Operation(summary = "Cancelar pagamento", description = "Cancela um pagamento existente")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Pagamento cancelado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Pagamento não encontrado"),
        @ApiResponse(responseCode = "400", description = "Pagamento não pode ser cancelado")
    })
    public ResponseEntity<Void> cancelPayment(@PathVariable UUID publicId) {
        paymentService.cancelPayment(publicId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/order/{orderPublicId}/total-paid")
    @Operation(summary = "Obter total pago em um pedido", description = "Retorna o valor total já pago para um pedido específico")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Valor total pago calculado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Pedido não encontrado"),
        @ApiResponse(responseCode = "400", description = "ID do pedido inválido")
    })
    public ResponseEntity<BigDecimal> getTotalPaidAmount(@PathVariable UUID orderPublicId) {
        BigDecimal totalPaid = paymentService.getTotalPaidAmount(orderPublicId);
        return ResponseEntity.ok(totalPaid);
    }
}
