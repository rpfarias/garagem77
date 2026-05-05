package com.garagem77.billing.repository;

import com.garagem77.billing.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByPublicId(UUID publicId);

    List<Payment> findByOrderId(Long orderId);

    List<Payment> findByStatus(String status);

    List<Payment> findByPaymentMethod(String paymentMethod);

    List<Payment> findByPaymentDateBetween(LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT p FROM Payment p WHERE p.status = :status AND p.paymentDate >= :startDate")
    List<Payment> findByStatusAndPaymentDateAfter(@Param("status") String status, @Param("startDate") LocalDateTime startDate);

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = :status AND p.paymentDate >= :startDate")
    BigDecimal sumAmountByStatusAndPaymentDateAfter(@Param("status") String status, @Param("startDate") LocalDateTime startDate);

    Optional<Payment> findByTransactionId(String transactionId);
}
