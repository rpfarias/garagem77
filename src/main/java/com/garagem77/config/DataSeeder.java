package com.garagem77.config;

import com.garagem77.auth.entity.User;
import com.garagem77.auth.repository.UserRepository;
import com.garagem77.auth.service.UserService;
import com.garagem77.company.entity.Company;
import com.garagem77.company.repository.CompanyRepository;
import com.garagem77.company.service.CompanyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * Garante que existe um admin padrão para login no ambiente de desenvolvimento.
 * Roda apenas no profile "dev" (ativo por default em application.properties).
 *
 * Idempotente: só cria se não existir.
 */
@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private static final String DEFAULT_COMPANY_SLUG = "garagem77";
    private static final String DEFAULT_COMPANY_NAME = "Garagem77";
    private static final String DEFAULT_ADMIN_EMAIL = "admin@garagem77.com";
    private static final String DEFAULT_ADMIN_PASSWORD = "password123";
    private static final String DEFAULT_ADMIN_NAME = "Administrador";
    private static final String DEFAULT_ADMIN_ROLE = "ADMIN";

    private final CompanyRepository companyRepository;
    private final CompanyService companyService;
    private final UserRepository userRepository;
    private final UserService userService;

    @Override
    public void run(String... args) {
        Company company = ensureDefaultCompany();
        ensureDefaultAdmin(company);
    }

    private Company ensureDefaultCompany() {
        return companyRepository.findBySlug(DEFAULT_COMPANY_SLUG)
            .orElseGet(() -> {
                log.info("Seed: criando company padrão '{}'", DEFAULT_COMPANY_NAME);
                return companyService.create(
                    DEFAULT_COMPANY_SLUG,
                    DEFAULT_COMPANY_NAME,
                    DEFAULT_ADMIN_EMAIL,
                    null
                );
            });
    }

    private void ensureDefaultAdmin(Company company) {
        boolean exists = userRepository.findByEmail(DEFAULT_ADMIN_EMAIL).isPresent();
        if (exists) {
            log.debug("Seed: admin '{}' já existe, pulando", DEFAULT_ADMIN_EMAIL);
            return;
        }

        log.info("Seed: criando admin padrão '{}' / '{}'", DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD);
        User admin = userService.create(
            DEFAULT_ADMIN_EMAIL,
            DEFAULT_ADMIN_PASSWORD,
            DEFAULT_ADMIN_NAME,
            DEFAULT_ADMIN_ROLE,
            company.getId()
        );
        log.info("Seed: admin criado com publicId={}", admin.getPublicId());
    }
}
