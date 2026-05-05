package com.garagem77.order.controller;

import com.garagem77.order.dto.OrderCreateRequest;
import com.garagem77.order.dto.OrderResponse;
import com.garagem77.order.entity.Order;
import com.garagem77.order.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
@Tag(name = "Pedidos", description = "Gerenciamento de pedidos de serviço")
public class OrderController {

    private final OrderService orderService;

    @GetMapping("/{publicId}")
    @Operation(summary = "Buscar pedido por ID", description = "Retorna os detalhes de um pedido específico pelo seu ID público")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Pedido encontrado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Pedido não encontrado"),
        @ApiResponse(responseCode = "400", description = "ID inválido")
    })
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable UUID publicId) {
        Order order = orderService.findByPublicId(publicId);
        return ResponseEntity.ok(toResponse(order));
    }

    @GetMapping("/customer/{customerPublicId}")
    @Operation(summary = "Listar pedidos de um cliente", description = "Retorna uma lista de todos os pedidos de um cliente específico")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de pedidos retornada com sucesso"),
        @ApiResponse(responseCode = "404", description = "Cliente não encontrado"),
        @ApiResponse(responseCode = "400", description = "ID do cliente inválido")
    })
    public ResponseEntity<List<OrderResponse>> getOrdersByCustomer(@PathVariable UUID customerPublicId) {
        List<Order> orders = orderService.findByCustomerId(customerPublicId);
        List<OrderResponse> responses = orders.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Listar pedidos por status", description = "Retorna uma lista de pedidos filtrados pelo status especificado")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de pedidos retornada com sucesso"),
        @ApiResponse(responseCode = "400", description = "Status inválido")
    })
    public ResponseEntity<List<OrderResponse>> getOrdersByStatus(@PathVariable String status) {
        List<Order> orders = orderService.findByStatus(status);
        List<OrderResponse> responses = orders.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @PostMapping
    @Operation(summary = "Criar novo pedido", description = "Cria um novo pedido de serviço no sistema")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Pedido criado com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos"),
        @ApiResponse(responseCode = "409", description = "Conflito - Pedido já existe")
    })
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody OrderCreateRequest request) {
        Order order = orderService.create(
            null,
            null,
            request.getScheduleId(),
            request.getNotes(),
            null,
            null
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(order));
    }

    @PatchMapping("/{publicId}/apply-discount")
    @Operation(summary = "Aplicar desconto ao pedido", description = "Aplica um desconto a um pedido existente")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Desconto aplicado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Pedido não encontrado"),
        @ApiResponse(responseCode = "400", description = "Dados de desconto inválidos")
    })
    public ResponseEntity<Void> applyDiscount(
            @PathVariable UUID publicId,
            @RequestParam String discountType,
            @RequestParam BigDecimal discountValue) {
        orderService.applyDiscount(publicId, discountType, discountValue);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{publicId}/status/{status}")
    @Operation(summary = "Atualizar status do pedido", description = "Altera o status de um pedido existente")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Status do pedido atualizado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Pedido não encontrado"),
        @ApiResponse(responseCode = "400", description = "Status inválido")
    })
    public ResponseEntity<Void> updateStatus(
            @PathVariable UUID publicId,
            @PathVariable String status) {
        orderService.updateStatus(publicId, status);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{publicId}/cancel")
    @Operation(summary = "Cancelar pedido", description = "Cancela um pedido existente")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Pedido cancelado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Pedido não encontrado"),
        @ApiResponse(responseCode = "400", description = "Pedido não pode ser cancelado")
    })
    public ResponseEntity<Void> cancelOrder(@PathVariable UUID publicId) {
        orderService.cancel(publicId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{publicId}/total")
    @Operation(summary = "Obter valor total do pedido", description = "Retorna o valor total de um pedido específico")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Valor total calculado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Pedido não encontrado"),
        @ApiResponse(responseCode = "400", description = "ID inválido")
    })
    public ResponseEntity<BigDecimal> getTotalAmount(@PathVariable UUID publicId) {
        BigDecimal total = orderService.getTotalAmount(publicId);
        return ResponseEntity.ok(total);
    }

    private OrderResponse toResponse(Order order) {
        return OrderResponse.builder()
            .id(order.getPublicId())
            .status(order.getStatus())
            .totalAmount(order.getTotalAmount())
            .discountAmount(order.getDiscountAmount())
            .finalAmount(order.getFinalAmount())
            .notes(order.getNotes())
            .createdAt(order.getCreatedAt())
            .updatedAt(order.getUpdatedAt())
            .build();
    }
}
