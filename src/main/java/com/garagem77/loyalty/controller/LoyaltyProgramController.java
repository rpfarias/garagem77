package com.garagem77.loyalty.controller;

import com.garagem77.loyalty.entity.LoyaltyProgram;
import com.garagem77.loyalty.service.LoyaltyProgramService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequestMapping("/loyalty-programs")
@RequiredArgsConstructor
public class LoyaltyProgramController {

    private final LoyaltyProgramService loyaltyProgramService;

    @GetMapping("/{publicId}")
    public ResponseEntity<LoyaltyProgram> getProgramById(@PathVariable UUID publicId) {
        LoyaltyProgram program = loyaltyProgramService.findByPublicId(publicId);
        return ResponseEntity.ok(program);
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<LoyaltyProgram> getProgramByName(@PathVariable String name) {
        LoyaltyProgram program = loyaltyProgramService.findByName(name);
        return ResponseEntity.ok(program);
    }

    @GetMapping("/active")
    public ResponseEntity<LoyaltyProgram> getActiveProgram() {
        LoyaltyProgram program = loyaltyProgramService.getActive();
        return ResponseEntity.ok(program);
    }

    @PostMapping
    public ResponseEntity<LoyaltyProgram> createProgram(
            @RequestParam String name,
            @RequestParam BigDecimal pointsPerReal) {
        LoyaltyProgram program = loyaltyProgramService.create(name, pointsPerReal);
        return ResponseEntity.status(HttpStatus.CREATED).body(program);
    }

    @PutMapping("/{publicId}")
    public ResponseEntity<LoyaltyProgram> updateProgram(
            @PathVariable UUID publicId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) BigDecimal pointsPerReal) {
        LoyaltyProgram program = loyaltyProgramService.update(publicId, name, pointsPerReal);
        return ResponseEntity.ok(program);
    }

    @PatchMapping("/{publicId}/toggle-active")
    public ResponseEntity<Void> toggleActive(@PathVariable UUID publicId) {
        loyaltyProgramService.toggleActive(publicId);
        return ResponseEntity.noContent().build();
    }
}
