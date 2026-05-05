package com.garagem77.order.service;

import com.garagem77.customer.entity.Customer;
import com.garagem77.customer.entity.Vehicle;
import com.garagem77.customer.repository.CustomerRepository;
import com.garagem77.customer.repository.VehicleRepository;
import com.garagem77.order.entity.Order;
import com.garagem77.order.entity.OrderItem;
import com.garagem77.order.repository.OrderItemRepository;
import com.garagem77.order.repository.OrderRepository;
import com.garagem77.scheduling.entity.Schedule;
import com.garagem77.scheduling.repository.ScheduleRepository;
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
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CustomerRepository customerRepository;
    private final VehicleRepository vehicleRepository;
    private final ScheduleRepository scheduleRepository;

    @Transactional(readOnly = true)
    public Order findByPublicId(UUID publicId) {
        return orderRepository.findByPublicId(publicId)
            .orElseThrow(() -> new ResourceNotFoundException("Ordem não encontrada: " + publicId));
    }

    @Transactional(readOnly = true)
    public List<Order> findByCustomerId(UUID customerPublicId) {
        Customer customer = customerRepository.findByPublicId(customerPublicId)
            .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado: " + customerPublicId));

        return orderRepository.findByCustomerId(customer.getId());
    }

    @Transactional(readOnly = true)
    public List<Order> findByStatus(String status) {
        return orderRepository.findByStatus(status);
    }

    public Order create(UUID customerPublicId, UUID vehiclePublicId, UUID schedulePublicId, String notes, String discountType, BigDecimal discountValue) {
        Customer customer = customerRepository.findByPublicId(customerPublicId)
            .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado: " + customerPublicId));

        Vehicle vehicle = vehicleRepository.findByPublicId(vehiclePublicId)
            .orElseThrow(() -> new ResourceNotFoundException("Veículo não encontrado: " + vehiclePublicId));

        Schedule schedule = null;
        if (schedulePublicId != null) {
            schedule = scheduleRepository.findByPublicId(schedulePublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Agendamento não encontrado: " + schedulePublicId));
        }

        Order order = Order.builder()
            .scheduleId(schedule != null ? schedule.getId() : null)
            .customerId(customer.getId())
            .vehicleId(vehicle.getId())
            .status("PENDING")
            .totalAmount(BigDecimal.ZERO)
            .discountAmount(BigDecimal.ZERO)
            .finalAmount(BigDecimal.ZERO)
            .notes(notes)
            .build();

        Order saved = orderRepository.save(order);
        log.info("Ordem criada: {} para cliente {}", saved.getPublicId(), customer.getName());
        return saved;
    }

    public void addItem(UUID orderPublicId, OrderItem item) {
        Order order = findByPublicId(orderPublicId);

        if (order.getStatus().equals("COMPLETED") || order.getStatus().equals("CANCELLED")) {
            throw new BusinessRuleException("Não é possível adicionar itens a ordem finalizada");
        }

        item.setOrderId(order.getId());
        orderItemRepository.save(item);

        recalculateTotal(orderPublicId);
        log.info("Item adicionado à ordem: {}", order.getPublicId());
    }

    public void applyDiscount(UUID orderPublicId, String discountType, BigDecimal discountValue) {
        Order order = findByPublicId(orderPublicId);

        if (order.getStatus().equals("COMPLETED") || order.getStatus().equals("CANCELLED")) {
            throw new BusinessRuleException("Não é possível aplicar desconto a ordem finalizada");
        }

        BigDecimal discount = BigDecimal.ZERO;

        if ("FIXED".equals(discountType)) {
            discount = discountValue;
        } else if ("PERCENTAGE".equals(discountType)) {
            discount = order.getTotalAmount().multiply(discountValue.divide(BigDecimal.valueOf(100)));
        } else {
            throw new BusinessRuleException("Tipo de desconto inválido. Use FIXED ou PERCENTAGE");
        }

        if (discount.compareTo(order.getTotalAmount()) > 0) {
            throw new BusinessRuleException("Desconto não pode ser maior que o total da ordem");
        }

        order.setDiscountAmount(discount);
        order.setFinalAmount(order.getTotalAmount().subtract(discount));
        orderRepository.save(order);

        log.info("Desconto aplicado à ordem: {} - R$ {}", orderPublicId, discount);
    }

    public void updateStatus(UUID orderPublicId, String status) {
        Order order = findByPublicId(orderPublicId);

        if (!isValidStatusTransition(order.getStatus(), status)) {
            throw new BusinessRuleException("Transição de status inválida: " + order.getStatus() + " → " + status);
        }

        order.setStatus(status);
        orderRepository.save(order);

        log.info("Status da ordem alterado para: {}", status);
    }

    public void cancel(UUID orderPublicId) {
        Order order = findByPublicId(orderPublicId);

        if (order.getStatus().equals("COMPLETED")) {
            throw new BusinessRuleException("Não é possível cancelar ordem já completada (permitido apenas se houver reembolso manual)");
        }

        order.setStatus("CANCELLED");
        orderRepository.save(order);

        log.info("Ordem cancelada: {}", orderPublicId);
    }

    @Transactional(readOnly = true)
    public BigDecimal getTotalAmount(UUID orderPublicId) {
        Order order = findByPublicId(orderPublicId);
        List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());

        return items.stream()
            .map(OrderItem::getSubtotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private void recalculateTotal(UUID orderPublicId) {
        Order order = findByPublicId(orderPublicId);
        BigDecimal newTotal = getTotalAmount(orderPublicId);

        order.setTotalAmount(newTotal);

        if (order.getDiscountAmount() != null && order.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
            order.setFinalAmount(newTotal.subtract(order.getDiscountAmount()));
        } else {
            order.setFinalAmount(newTotal);
        }

        orderRepository.save(order);
    }

    private boolean isValidStatusTransition(String currentStatus, String newStatus) {
        return switch (currentStatus) {
            case "PENDING" -> newStatus.equals("IN_PROGRESS") || newStatus.equals("CANCELLED");
            case "IN_PROGRESS" -> newStatus.equals("COMPLETED") || newStatus.equals("CANCELLED");
            case "COMPLETED", "CANCELLED" -> false;
            default -> false;
        };
    }
}
