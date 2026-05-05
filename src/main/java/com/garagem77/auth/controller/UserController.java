package com.garagem77.auth.controller;

import com.garagem77.auth.entity.User;
import com.garagem77.auth.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{publicId}")
    public ResponseEntity<User> getUserById(@PathVariable UUID publicId) {
        User user = userService.findByPublicId(publicId);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        User user = userService.findByEmail(email);
        return ResponseEntity.ok(user);
    }

    @PostMapping
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
    public ResponseEntity<User> updateUser(
            @PathVariable UUID publicId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String email) {
        User user = userService.update(publicId, name, email);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/{publicId}/change-password")
    public ResponseEntity<Void> changePassword(
            @PathVariable UUID publicId,
            @RequestParam String oldPassword,
            @RequestParam String newPassword) {
        userService.changePassword(publicId, oldPassword, newPassword);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{publicId}/toggle-active")
    public ResponseEntity<Void> toggleActive(@PathVariable UUID publicId) {
        userService.toggleActive(publicId);
        return ResponseEntity.noContent().build();
    }
}
