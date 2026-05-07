package com.garagem77.order.controller;

import com.garagem77.customer.entity.Customer;
import com.garagem77.customer.entity.Vehicle;
import com.garagem77.inventory.entity.Product;
import com.garagem77.order.dto.OrderCreateRequest;
import com.garagem77.order.dto.OrderItemRequest;
import com.garagem77.order.dto.OrderItemResponse;
import com.garagem77.order.dto.OrderResponse;
import com.garagem77.order.entity.Order;
import com.garagem77.order.entity.OrderItem;
import com.garagem77.order.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
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
@RequestMapping("/orders")
@RequiredArgsConstructor
@Tag(name = "Pedidos", description = "Gerenciamento de pedidos de serviço")
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    @Operation(summary = "Listar pedidos paginados", description = "Lista paginada de pedidos com filtro opcional por status")
    public ResponseEntity<Page<OrderResponse>> listOrders(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Order> orders = (status != null && !status.isBlank())
            ? orderService.findByStatusPaged(status, pageable)
            : orderService.findAllPaged(pageable);
        return ResponseEntity.ok(orders.map(this::toResponse));
    }

    @GetMapping("/{publicId}")
    @Operation(summary = "Buscar pedido por ID")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable UUID publicId) {
        Order order = orderService.findByPublicId(publicId);
        return ResponseEntity.ok(toResponse(order));
    }

    @GetMapping("/customer/{customerPublicId}")
    @Operation(summary = "Listar pedidos de um cliente")
    public ResponseEntity<List<OrderResponse>> getOrdersByCustomer(@PathVariable UUID customerPublicId) {
        List<Order> orders = orderService.findByCustomerId(customerPublicId);
        return ResponseEntity.ok(orders.stream().map(this::toResponse).collect(Collectors.toList()));
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Listar pedidos por status (não paginado)")
    public ResponseEntity<List<OrderResponse>> getOrdersByStatus(@PathVariable String status) {
        List<Order> orders = orderService.findByStatus(status);
        return ResponseEntity.ok(orders.stream().map(this::toResponse).collect(Collectors.toList()));
    }

    @PostMapping
    @Operation(summary = "Criar novo pedido com items")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Pedido criado com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos"),
        @ApiResponse(responseCode = "404", description = "Cliente, veículo, serviço ou produto não encontrado")
    })
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody OrderCreateRequest request) {
        // Create base order
        Order order = orderService.create(
            request.getCustomerId(),
            request.getVehicleId(),
            request.getScheduleId(),
            request.getNotes(),
            null,
            null
        );

        // Add items
        for (OrderItemRequest itemReq : request.getItems()) {
            orderService.buildAndAddItem(
                order.getPublicId(),
                itemReq.getServiceId(),
                itemReq.getProductId(),
                itemReq.getQuantity(),
                itemReq.getUnitPrice()
            );
        }

        // Reload to get updated totals
        Order reloaded = orderService.findByPublicId(order.getPublicId());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(reloaded));
    }

    @PostMapping("/{publicId}/items")
    @Operation(summary = "Adicionar item a um pedido existente")
    public ResponseEntity<OrderItemResponse> addItem(
            @PathVariable UUID publicId,
            @Valid @RequestBody OrderItemRequest request) {
        OrderItem item = orderService.buildAndAddItem(
            publicId,
            request.getServiceId(),
            request.getProductId(),
            request.getQuantity(),
            request.getUnitPrice()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(toItemResponse(item));
    }

    @DeleteMapping("/{publicId}/items/{itemId}")
    @Operation(summary = "Remover item de um pedido")
    public ResponseEntity<Void> removeItem(@PathVariable UUID publicId, @PathVariable Long itemId) {
        orderService.removeItem(publicId, itemId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{publicId}/apply-discount")
    @Operation(summary = "Aplicar desconto ao pedido")
    public ResponseEntity<Void> applyDiscount(
            @PathVariable UUID publicId,
            @RequestParam String discountType,
            @RequestParam BigDecimal discountValue) {
        orderService.applyDiscount(publicId, discountType, discountValue);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{publicId}/status/{status}")
    @Operation(summary = "Atualizar status do pedido")
    public ResponseEntity<Void> updateStatus(
            @PathVariable UUID publicId,
            @PathVariable String status) {
        orderService.updateStatus(publicId, status);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{publicId}/cancel")
    @Operation(summary = "Cancelar pedido")
    public ResponseEntity<Void> cancelOrder(@PathVariable UUID publicId) {
        orderService.cancel(publicId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{publicId}")
    @Operation(summary = "Remover pedido permanentemente (e todos os items)")
    public ResponseEntity<Void> deleteOrder(@PathVariable UUID publicId) {
        orderService.delete(publicId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{publicId}/total")
    @Operation(summary = "Obter valor total do pedido")
    public ResponseEntity<BigDecimal> getTotalAmount(@PathVariable UUID publicId) {
        BigDecimal total = orderService.getTotalAmount(publicId);
        return ResponseEntity.ok(total);
    }

    private OrderResponse toResponse(Order order) {
        Customer customer = orderService.getCustomerById(order.getCustomerId());
        Vehicle vehicle = orderService.getVehicleById(order.getVehicleId());

        List<OrderItemResponse> items = orderService.getItemsByOrder(order.getId()).stream()
            .map(this::toItemResponse)
            .collect(Collectors.toList());

        return OrderResponse.builder()
            .id(order.getPublicId())
            .schedulePublicId(null) // could resolve if needed
            .customerPublicId(customer != null ? customer.getPublicId() : null)
            .customerName(customer != null ? customer.getName() : null)
            .vehiclePublicId(vehicle != null ? vehicle.getPublicId() : null)
            .vehiclePlate(vehicle != null ? vehicle.getPlate() : null)
            .vehicleModel(vehicle != null ? vehicle.getModel() : null)
            .status(order.getStatus())
            .totalAmount(order.getTotalAmount())
            .discountAmount(order.getDiscountAmount())
            .finalAmount(order.getFinalAmount())
            .notes(order.getNotes())
            .items(items)
            .createdAt(order.getCreatedAt())
            .updatedAt(order.getUpdatedAt())
            .build();
    }

    private OrderItemResponse toItemResponse(OrderItem item) {
        com.garagem77.service.entity.Service svc = item.getServiceId() != null
            ? orderService.getServiceById(item.getServiceId()) : null;
        Product prod = item.getProductId() != null
            ? orderService.getProductById(item.getProductId()) : null;

        return OrderItemResponse.builder()
            .id(item.getPublicId())
            .servicePublicId(svc != null ? svc.getPublicId() : null)
            .serviceName(svc != null ? svc.getName() : null)
            .productPublicId(prod != null ? prod.getPublicId() : null)
            .productName(prod != null ? prod.getName() : null)
            .quantity(item.getQuantity())
            .unitPrice(item.getUnitPrice())
            .subtotal(item.getSubtotal())
            .build();
    }
}
