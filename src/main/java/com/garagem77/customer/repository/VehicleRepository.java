package com.garagem77.customer.repository;

import com.garagem77.customer.entity.Vehicle;
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
}
