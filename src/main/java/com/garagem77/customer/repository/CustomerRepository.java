package com.garagem77.customer.repository;

import com.garagem77.customer.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer> findByPublicId(UUID publicId);

    Optional<Customer> findByCpf(String cpf);

    List<Customer> findByNameContainingIgnoreCase(String name);

    List<Customer> findByActive(Boolean active);

    List<Customer> findByPhoneContaining(String phone);

    Page<Customer> findAll(Pageable pageable);

    Page<Customer> findByActive(Boolean active, Pageable pageable);

    Page<Customer> findByActiveAndNameContainingIgnoreCase(Boolean active, String name, Pageable pageable);
}
