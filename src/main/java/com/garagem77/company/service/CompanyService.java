package com.garagem77.company.service;

import com.garagem77.company.entity.Company;
import com.garagem77.company.repository.CompanyRepository;
import com.garagem77.shared.exception.DuplicateResourceException;
import com.garagem77.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class CompanyService {

    private final CompanyRepository companyRepository;

    @Transactional(readOnly = true)
    public Company findByPublicId(UUID publicId) {
        return companyRepository.findByPublicId(publicId)
            .orElseThrow(() -> new ResourceNotFoundException("Empresa não encontrada: " + publicId));
    }

    @Transactional(readOnly = true)
    public Company findBySlug(String slug) {
        return companyRepository.findBySlug(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Empresa não encontrada: " + slug));
    }

    public Company create(String slug, String name, String email, String phone) {
        if (companyRepository.findBySlug(slug).isPresent()) {
            throw new DuplicateResourceException("Slug já existe: " + slug);
        }

        if (companyRepository.findByEmail(email).isPresent()) {
            throw new DuplicateResourceException("Email já existe: " + email);
        }

        Company company = Company.builder()
            .slug(slug)
            .name(name)
            .email(email)
            .phone(phone)
            .planType("basic")
            .active(true)
            .schemaName("tenant_" + slug)
            .build();

        Company saved = companyRepository.save(company);
        log.info("Empresa criada: {} ({})", saved.getName(), saved.getPublicId());
        return saved;
    }

    public Company update(UUID publicId, String name, String email, String phone) {
        Company company = findByPublicId(publicId);

        if (email != null && !email.equals(company.getEmail())) {
            if (companyRepository.findByEmail(email).isPresent()) {
                throw new DuplicateResourceException("Email já existe: " + email);
            }
            company.setEmail(email);
        }

        if (name != null) company.setName(name);
        if (phone != null) company.setPhone(phone);

        Company updated = companyRepository.save(company);
        log.info("Empresa atualizada: {}", updated.getPublicId());
        return updated;
    }

    public void toggleActive(UUID publicId) {
        Company company = findByPublicId(publicId);
        company.setActive(!company.getActive());
        companyRepository.save(company);
        log.info("Status da empresa alterado para: {}", company.getActive());
    }
}
