package com.garagem77.scheduling.repository;

import com.garagem77.scheduling.entity.Schedule;
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
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    Optional<Schedule> findByPublicId(UUID publicId);

    List<Schedule> findByCustomerId(Long customerId);

    List<Schedule> findByVehicleId(Long vehicleId);

    List<Schedule> findByStatus(String status);

    List<Schedule> findByScheduledAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    List<Schedule> findByScheduledAtBetweenAndStatus(LocalDateTime startDate, LocalDateTime endDate, String status);

    @Query("SELECT s FROM Schedule s WHERE s.customerId = :customerId AND s.status = :status")
    List<Schedule> findByCustomerIdAndStatus(@Param("customerId") Long customerId, @Param("status") String status);

    @Query("SELECT s FROM Schedule s WHERE s.vehicleId = :vehicleId AND s.status = :status")
    List<Schedule> findByVehicleIdAndStatus(@Param("vehicleId") Long vehicleId, @Param("status") String status);

    Page<Schedule> findByStatus(String status, Pageable pageable);

    Page<Schedule> findAll(Pageable pageable);
}
