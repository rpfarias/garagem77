package com.garagem77.loyalty.repository;

import com.garagem77.loyalty.entity.LoyaltyTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LoyaltyTransactionRepository extends JpaRepository<LoyaltyTransaction, Long> {

    Optional<LoyaltyTransaction> findByPublicId(UUID publicId);

    List<LoyaltyTransaction> findByLoyaltyPointId(Long loyaltyPointId);

    List<LoyaltyTransaction> findByOrderId(Long orderId);

    List<LoyaltyTransaction> findByTransactionType(String transactionType);

    @Query("SELECT lt FROM LoyaltyTransaction lt WHERE lt.loyaltyPointId = :loyaltyPointId ORDER BY lt.createdAt DESC")
    List<LoyaltyTransaction> findByLoyaltyPointIdOrderByCreatedAtDesc(@Param("loyaltyPointId") Long loyaltyPointId);

    @Query("SELECT SUM(lt.pointsValue) FROM LoyaltyTransaction lt WHERE lt.loyaltyPointId = :loyaltyPointId AND lt.transactionType = 'EARN'")
    Integer sumEarnedPointsByLoyaltyPointId(@Param("loyaltyPointId") Long loyaltyPointId);

    @Query("SELECT SUM(lt.pointsValue) FROM LoyaltyTransaction lt WHERE lt.loyaltyPointId = :loyaltyPointId AND lt.transactionType = 'REDEEM'")
    Integer sumRedeemedPointsByLoyaltyPointId(@Param("loyaltyPointId") Long loyaltyPointId);
}
