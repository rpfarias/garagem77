package com.garagem77.company.controller;

import com.garagem77.company.entity.Company;
import com.garagem77.company.service.CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;

    @GetMapping("/{publicId}")
    public ResponseEntity<Company> getCompanyById(@PathVariable UUID publicId) {
        Company company = companyService.findByPublicId(publicId);
        return ResponseEntity.ok(company);
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<Company> getCompanyBySlug(@PathVariable String slug) {
        Company company = companyService.findBySlug(slug);
        return ResponseEntity.ok(company);
    }

    @PostMapping
    public ResponseEntity<Company> createCompany(
            @RequestParam String slug,
            @RequestParam String name,
            @RequestParam String email,
            @RequestParam(required = false) String phone) {
        Company company = companyService.create(slug, name, email, phone);
        return ResponseEntity.status(HttpStatus.CREATED).body(company);
    }

    @PutMapping("/{publicId}")
    public ResponseEntity<Company> updateCompany(
            @PathVariable UUID publicId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String phone) {
        Company company = companyService.update(publicId, name, email, phone);
        return ResponseEntity.ok(company);
    }

    @PatchMapping("/{publicId}/toggle-active")
    public ResponseEntity<Void> toggleActive(@PathVariable UUID publicId) {
        companyService.toggleActive(publicId);
        return ResponseEntity.noContent().build();
    }
}
