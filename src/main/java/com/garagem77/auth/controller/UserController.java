package com.garagem77.auth.controller;

import com.garagem77.auth.entity.User;
import com.garagem77.auth.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "Usuários", description = "Gerenciamento de usuários do sistema")
public class UserController {

    private final UserService userService;

    @GetMapping("/{publicId}")
    @Operation(summary = "Buscar usuário por ID", description = "Retorna os detalhes de um usuário específico pelo seu ID público")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Usuário encontrado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Usuário não encontrado"),
        @ApiResponse(responseCode = "400", description = "ID inválido")
    })
    public ResponseEntity<User> getUserById(@PathVariable UUID publicId) {
        User user = userService.findByPublicId(publicId);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/email/{email}")
    @Operation(summary = "Buscar usuário por email", description = "Retorna os detalhes de um usuário específico pelo seu endereço de email")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Usuário encontrado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Usuário não encontrado"),
        @ApiResponse(responseCode = "400", description = "Email inválido")
    })
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        User user = userService.findByEmail(email);
        return ResponseEntity.ok(user);
    }

    @PostMapping
    @Operation(summary = "Criar novo usuário", description = "Cria um novo usuário no sistema com as informações fornecidas")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Usuário criado com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos ou usuário já existe"),
        @ApiResponse(responseCode = "409", description = "Conflito - Email já registrado")
    })
    public ResponseEntity<User> createUser(
            @RequestParam String email,
            @RequestParam String password,
            @RequestParam String name,
            @RequestParam String role,
            @RequestParam Long companyId) {
        User user = userService.create(email, password, name, role, companyId);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    @PutMapping("/{publicId}")
    @Operation(summary = "Atualizar usuário", description = "Atualiza as informações de um usuário existente")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Usuário atualizado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Usuário não encontrado"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos")
    })
    public ResponseEntity<User> updateUser(
            @PathVariable UUID publicId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String email) {
        User user = userService.update(publicId, name, email);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/{publicId}/change-password")
    @Operation(summary = "Alterar senha do usuário", description = "Altera a senha de um usuário após validação da senha antiga")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Senha alterada com sucesso"),
        @ApiResponse(responseCode = "404", description = "Usuário não encontrado"),
        @ApiResponse(responseCode = "400", description = "Senha antiga inválida ou dados inválidos")
    })
    public ResponseEntity<Void> changePassword(
            @PathVariable UUID publicId,
            @RequestParam String oldPassword,
            @RequestParam String newPassword) {
        userService.changePassword(publicId, oldPassword, newPassword);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{publicId}/toggle-active")
    @Operation(summary = "Alternar status ativo/inativo do usuário", description = "Ativa ou desativa um usuário no sistema")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Status do usuário alterado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Usuário não encontrado"),
        @ApiResponse(responseCode = "400", description = "ID inválido")
    })
    public ResponseEntity<Void> toggleActive(@PathVariable UUID publicId) {
        userService.toggleActive(publicId);
        return ResponseEntity.noContent().build();
    }
}
