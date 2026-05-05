package com.garagem77.loyalty.repository;

import com.garagem77.loyalty.entity.LoyaltyPoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LoyaltyPointRepository extends JpaRepository<LoyaltyPoint, Long> {

    Optional<LoyaltyPoint> findByPublicId(UUID publicId);

    List<LoyaltyPoint> findByCustomerId(Long customerId);

    Optional<LoyaltyPoint> findByCustomerIdAndProgramId(Long customerId, Long programId);

    @Query("SELECT lp FROM LoyaltyPoint lp WHERE lp.customerId = :customerId AND lp.pointsBalance > 0")
    List<LoyaltyPoint> findActivePointsByCustomerId(@Param("customerId") Long customerId);

    @Query("SELECT SUM(lp.pointsBalance) FROM LoyaltyPoint lp WHERE lp.customerId = :customerId")
    Long sumPointsByCustomerId(@Param("customerId") Long customerId);
}
