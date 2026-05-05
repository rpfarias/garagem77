package com.garagem77.loyalty.controller;

import com.garagem77.loyalty.entity.LoyaltyPoint;
import com.garagem77.loyalty.service.LoyaltyPointService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/loyalty-points")
@RequiredArgsConstructor
public class LoyaltyPointController {

    private final LoyaltyPointService loyaltyPointService;

    @GetMapping("/{publicId}")
    public ResponseEntity<LoyaltyPoint> getPointsById(@PathVariable UUID publicId) {
        LoyaltyPoint loyaltyPoint = loyaltyPointService.findByPublicId(publicId);
        return ResponseEntity.ok(loyaltyPoint);
    }

    @GetMapping("/customer/{customerPublicId}")
    public ResponseEntity<LoyaltyPoint> getPointsByCustomer(@PathVariable UUID customerPublicId) {
        LoyaltyPoint loyaltyPoint = loyaltyPointService.findByCustomerId(customerPublicId);
        return ResponseEntity.ok(loyaltyPoint);
    }

    @GetMapping("/customer/{customerPublicId}/total")
    public ResponseEntity<Integer> getTotalPoints(@PathVariable UUID customerPublicId) {
        Integer totalPoints = loyaltyPointService.getTotalPoints(customerPublicId);
        return ResponseEntity.ok(totalPoints);
    }

    @PostMapping("/customer/{customerPublicId}")
    public ResponseEntity<LoyaltyPoint> createOrGetForCustomer(@PathVariable UUID customerPublicId) {
        LoyaltyPoint loyaltyPoint = loyaltyPointService.createOrGetForCustomer(customerPublicId);
        return ResponseEntity.status(HttpStatus.CREATED).body(loyaltyPoint);
    }

    @PatchMapping("/customer/{customerPublicId}/add-points")
    public ResponseEntity<Void> addPoints(
            @PathVariable UUID customerPublicId,
            @RequestParam Integer points) {
        loyaltyPointService.addPoints(customerPublicId, points);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/customer/{customerPublicId}/redeem-points")
    public ResponseEntity<Void> redeemPoints(
            @PathVariable UUID customerPublicId,
            @RequestParam Integer points) {
        loyaltyPointService.redeemPoints(customerPublicId, points);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/customer/{customerPublicId}/active")
    public ResponseEntity<List<LoyaltyPoint>> getActivePoints(@PathVariable UUID customerPublicId) {
        List<LoyaltyPoint> activePoints = loyaltyPointService.findActivePoints(customerPublicId);
        return ResponseEntity.ok(activePoints);
    }
}
