package com.garagem77.order.controller;

import com.garagem77.order.dto.OrderCreateRequest;
import com.garagem77.order.dto.OrderResponse;
import com.garagem77.order.entity.Order;
import com.garagem77.order.service.OrderService;
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
public class OrderController {

    private final OrderService orderService;

    @GetMapping("/{publicId}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable UUID publicId) {
        Order order = orderService.findByPublicId(publicId);
        return ResponseEntity.ok(toResponse(order));
    }

    @GetMapping("/customer/{customerPublicId}")
    public ResponseEntity<List<OrderResponse>> getOrdersByCustomer(@PathVariable UUID customerPublicId) {
        List<Order> orders = orderService.findByCustomerId(customerPublicId);
        List<OrderResponse> responses = orders.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<OrderResponse>> getOrdersByStatus(@PathVariable String status) {
        List<Order> orders = orderService.findByStatus(status);
        List<OrderResponse> responses = orders.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody OrderCreateRequest request) {
        Order order = orderService.create(
            null, // customerPublicId extraído do CPF
            null, // vehiclePublicId extraído da placa
            request.getScheduleId(),
            request.getNotes(),
            null, // discountType
            null  // discountValue
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(order));
    }

    @PatchMapping("/{publicId}/apply-discount")
    public ResponseEntity<Void> applyDiscount(
            @PathVariable UUID publicId,
            @RequestParam String discountType,
            @RequestParam BigDecimal discountValue) {
        orderService.applyDiscount(publicId, discountType, discountValue);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{publicId}/status/{status}")
    public ResponseEntity<Void> updateStatus(
            @PathVariable UUID publicId,
            @PathVariable String status) {
        orderService.updateStatus(publicId, status);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{publicId}/cancel")
    public ResponseEntity<Void> cancelOrder(@PathVariable UUID publicId) {
        orderService.cancel(publicId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{publicId}/total")
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
