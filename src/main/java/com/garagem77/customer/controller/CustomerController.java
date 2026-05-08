package com.garagem77.customer.controller;

import com.garagem77.customer.dto.CustomerCreateRequest;
import com.garagem77.customer.dto.CustomerResponse;
import com.garagem77.customer.entity.Customer;
import com.garagem77.customer.service.CustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
@Tag(name = "Clientes", description = "Gerenciamento de clientes do sistema")
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping("/{publicId}")
    @Operation(summary = "Buscar cliente por ID", description = "Retorna os detalhes de um cliente específico pelo seu ID público")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Cliente encontrado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Cliente não encontrado"),
        @ApiResponse(responseCode = "400", description = "ID inválido")
    })
    public ResponseEntity<CustomerResponse> getCustomerById(@PathVariable UUID publicId) {
        Customer customer = customerService.findByPublicId(publicId);
        return ResponseEntity.ok(toResponse(customer));
    }

    @GetMapping("/cpf/{cpf}")
    @Operation(summary = "Buscar cliente por CPF", description = "Retorna os detalhes de um cliente específico pelo seu CPF")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Cliente encontrado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Cliente não encontrado"),
        @ApiResponse(responseCode = "400", description = "CPF inválido")
    })
    public ResponseEntity<CustomerResponse> getCustomerByCpf(@PathVariable String cpf) {
        Customer customer = customerService.findByCpf(cpf);
        return ResponseEntity.ok(toResponse(customer));
    }

    @GetMapping("/search")
    @Operation(summary = "Pesquisar clientes por nome",
        description = "Se o parâmetro 'page' for fornecido, retorna paginado; caso contrário retorna lista")
    public ResponseEntity<Object> searchByName(
            @RequestParam String name,
            @RequestParam(required = false) Integer page,
            @RequestParam(defaultValue = "10") int size) {
        if (page != null) {
            Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
            Page<Customer> customers = customerService.searchByName(name, pageable);
            return ResponseEntity.ok(customers.map(this::toResponse));
        }
        List<CustomerResponse> responses = customerService.findByName(name).stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping
    @Operation(summary = "Listar clientes",
        description = "Por padrão retorna paginado. Use ?paged=false para receber lista não paginada (compat)")
    public ResponseEntity<Object> getAllCustomers(
            @RequestParam(required = false) Boolean paged,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        if (Boolean.FALSE.equals(paged)) {
            List<CustomerResponse> all = customerService.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
            return ResponseEntity.ok(all);
        }
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        Page<Customer> customers = customerService.findAllPaged(pageable);
        return ResponseEntity.ok(customers.map(this::toResponse));
    }

    @PostMapping
    @Operation(summary = "Criar novo cliente", description = "Cria um novo cliente no sistema com as informações fornecidas")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Cliente criado com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos"),
        @ApiResponse(responseCode = "409", description = "Conflito - CPF já registrado")
    })
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
    @Operation(summary = "Atualizar cliente", description = "Atualiza as informações de um cliente existente")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Cliente atualizado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Cliente não encontrado"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos")
    })
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
    @Operation(summary = "Deletar cliente", description = "Remove um cliente do sistema")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Cliente deletado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Cliente não encontrado"),
        @ApiResponse(responseCode = "400", description = "ID inválido")
    })
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
