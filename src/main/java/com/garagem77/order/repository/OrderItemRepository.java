package com.garagem77.order.repository;

import com.garagem77.order.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    Optional<OrderItem> findByPublicId(UUID publicId);

    List<OrderItem> findByOrderId(Long orderId);

    List<OrderItem> findByServiceId(Long serviceId);

    List<OrderItem> findByProductId(Long productId);
}
