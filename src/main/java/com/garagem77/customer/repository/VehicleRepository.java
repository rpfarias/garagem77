package com.garagem77.customer.repository;

import com.garagem77.customer.entity.Vehicle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    Optional<Vehicle> findByPublicId(UUID publicId);

    Optional<Vehicle> findByPlate(String plate);

    List<Vehicle> findByCustomerId(Long customerId);

    List<Vehicle> findByCustomerIdAndActive(Long customerId, Boolean active);

    List<Vehicle> findByModelContainingIgnoreCase(String model);

    Optional<Vehicle> findByPlateAndCustomerId(String plate, Long customerId);

    Page<Vehicle> findByActive(Boolean active, Pageable pageable);

    Page<Vehicle> findByActiveAndPlateContainingIgnoreCase(Boolean active, String plate, Pageable pageable);

    Page<Vehicle> findByActiveAndModelContainingIgnoreCase(Boolean active, String model, Pageable pageable);
}
