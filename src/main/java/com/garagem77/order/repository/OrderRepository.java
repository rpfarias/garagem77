package com.garagem77.order.repository;

import com.garagem77.order.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByPublicId(UUID publicId);

    List<Order> findByCustomerId(Long customerId);

    List<Order> findByVehicleId(Long vehicleId);

    List<Order> findByStatus(String status);

    List<Order> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT o FROM Order o WHERE o.customerId = :customerId AND o.status = :status")
    List<Order> findByCustomerIdAndStatus(@Param("customerId") Long customerId, @Param("status") String status);

    @Query("SELECT o FROM Order o WHERE o.scheduleId = :scheduleId")
    Optional<Order> findByScheduleId(@Param("scheduleId") Long scheduleId);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status AND o.createdAt >= :startDate")
    Long countByStatusAndCreatedAtAfter(@Param("status") String status, @Param("startDate") LocalDateTime startDate);

    Page<Order> findAll(Pageable pageable);

    Page<Order> findByStatus(String status, Pageable pageable);
}
