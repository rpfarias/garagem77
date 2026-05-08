package com.garagem77.loyalty.repository;

import com.garagem77.loyalty.entity.LoyaltyProgram;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LoyaltyProgramRepository extends JpaRepository<LoyaltyProgram, Long> {

    Optional<LoyaltyProgram> findByPublicId(UUID publicId);

    Optional<LoyaltyProgram> findByName(String name);

    List<LoyaltyProgram> findByActive(Boolean active);

    Page<LoyaltyProgram> findAll(Pageable pageable);
}
