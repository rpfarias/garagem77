package com.garagem77.company.repository;

import com.garagem77.company.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {

    Optional<Company> findByPublicId(UUID publicId);

    Optional<Company> findBySlug(String slug);

    Optional<Company> findByEmail(String email);
}
