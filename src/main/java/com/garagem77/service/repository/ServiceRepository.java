package com.garagem77.service.repository;

import com.garagem77.service.entity.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {

    Optional<Service> findByPublicId(UUID publicId);

    Optional<Service> findByName(String name);

    List<Service> findByActive(Boolean active);

    List<Service> findByNameContainingIgnoreCase(String name);
}
