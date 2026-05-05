package com.garagem77.customer.controller;

import com.garagem77.customer.dto.CustomerCreateRequest;
import com.garagem77.customer.dto.CustomerResponse;
import com.garagem77.customer.entity.Customer;
import com.garagem77.customer.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping("/{publicId}")
    public ResponseEntity<CustomerResponse> getCustomerById(@PathVariable UUID publicId) {
        Customer customer = customerService.findByPublicId(publicId);
        return ResponseEntity.ok(toResponse(customer));
    }

    @GetMapping("/cpf/{cpf}")
    public ResponseEntity<CustomerResponse> getCustomerByCpf(@PathVariable String cpf) {
        Customer customer = customerService.findByCpf(cpf);
        return ResponseEntity.ok(toResponse(customer));
    }

    @GetMapping("/search")
    public ResponseEntity<List<CustomerResponse>> searchByName(@RequestParam String name) {
        List<Customer> customers = customerService.findByName(name);
        List<CustomerResponse> responses = customers.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping
    public ResponseEntity<List<CustomerResponse>> getAllCustomers() {
        List<Customer> customers = customerService.findAll();
        List<CustomerResponse> responses = customers.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @PostMapping
    public ResponseEntity<CustomerResponse> createCustomer(@Valid @RequestBody CustomerCreateRequest request) {
        Customer customer = customerService.create(
            request.getCpf(),
            request.getName(),
            request.getEmail(),
            request.getPhone(),
            request.getBirthDate(),
            request.getAddress()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(customer));
    }

    @PutMapping("/{publicId}")
    public ResponseEntity<CustomerResponse> updateCustomer(
            @PathVariable UUID publicId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) LocalDate birthDate,
            @RequestParam(required = false) String address) {
        Customer customer = customerService.update(publicId, name, email, phone, birthDate, address);
        return ResponseEntity.ok(toResponse(customer));
    }

    @DeleteMapping("/{publicId}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable UUID publicId) {
        customerService.delete(publicId);
        return ResponseEntity.noContent().build();
    }

    private CustomerResponse toResponse(Customer customer) {
        return CustomerResponse.builder()
            .id(customer.getPublicId())
            .cpf(customer.getCpf())
            .name(customer.getName())
            .email(customer.getEmail())
            .phone(customer.getPhone())
            .birthDate(customer.getBirthDate())
            .address(customer.getAddress())
            .active(customer.getActive())
            .createdAt(customer.getCreatedAt())
            .updatedAt(customer.getUpdatedAt())
            .build();
    }
}
