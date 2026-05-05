package com.garagem77.auth.repository;

import com.garagem77.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByPublicId(UUID publicId);

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailAndCompanyId(String email, Long companyId);

    List<User> findByCompanyId(Long companyId);

    List<User> findByCompanyIdAndRole(Long companyId, String role);

    List<User> findByCompanyIdAndActive(Long companyId, Boolean active);
}
