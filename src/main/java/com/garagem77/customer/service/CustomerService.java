package com.garagem77.customer.service;

import com.garagem77.customer.entity.Customer;
import com.garagem77.customer.repository.CustomerRepository;
import com.garagem77.customer.repository.VehicleRepository;
import com.garagem77.shared.exception.BusinessRuleException;
import com.garagem77.shared.exception.DuplicateResourceException;
import com.garagem77.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final VehicleRepository vehicleRepository;

    @Transactional(readOnly = true)
    public Customer findByPublicId(UUID publicId) {
        return customerRepository.findByPublicId(publicId)
            .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado: " + publicId));
    }

    @Transactional(readOnly = true)
    public Customer findByCpf(String cpf) {
        return customerRepository.findByCpf(cpf)
            .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado: " + cpf));
    }

    @Transactional(readOnly = true)
    public List<Customer> findByName(String name) {
        return customerRepository.findByNameContainingIgnoreCase(name);
    }

    @Transactional(readOnly = true)
    public List<Customer> findAll() {
        return customerRepository.findByActive(true);
    }

    public Customer create(String cpf, String name, String email, String phone, LocalDate birthDate, String address) {
        validateCpf(cpf);

        if (customerRepository.findByCpf(cpf).isPresent()) {
            throw new DuplicateResourceException("CPF já existe: " + cpf);
        }

        Customer customer = Customer.builder()
            .cpf(cpf)
            .name(name)
            .email(email)
            .phone(phone)
            .birthDate(birthDate)
            .address(address)
            .active(true)
            .build();

        Customer saved = customerRepository.save(customer);
        log.info("Cliente criado: {} (CPF: {})", saved.getName(), cpf);
        return saved;
    }

    public Customer update(UUID publicId, String name, String email, String phone, LocalDate birthDate, String address) {
        Customer customer = findByPublicId(publicId);

        if (name != null) customer.setName(name);
        if (email != null) customer.setEmail(email);
        if (phone != null) customer.setPhone(phone);
        if (birthDate != null) customer.setBirthDate(birthDate);
        if (address != null) customer.setAddress(address);

        Customer updated = customerRepository.save(customer);
        log.info("Cliente atualizado: {}", updated.getPublicId());
        return updated;
    }

    public void delete(UUID publicId) {
        Customer customer = findByPublicId(publicId);

        long vehicleCount = vehicleRepository.findByCustomerId(customer.getId()).size();
        if (vehicleCount > 0) {
            throw new BusinessRuleException("Não é possível deletar cliente com veículos cadastrados");
        }

        customer.setActive(false);
        customerRepository.save(customer);
        log.info("Cliente deletado: {}", publicId);
    }

    private void validateCpf(String cpf) {
        if (cpf == null || cpf.length() != 11) {
            throw new BusinessRuleException("CPF deve ter exatamente 11 dígitos");
        }

        if (!cpf.matches("\\d{11}")) {
            throw new BusinessRuleException("CPF deve conter apenas dígitos");
        }
    }
}
