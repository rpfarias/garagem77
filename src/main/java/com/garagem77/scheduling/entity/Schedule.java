package com.garagem77.scheduling.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.garagem77.shared.entity.BaseEntity;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "schedules", indexes = {
    @Index(name = "idx_schedule_customer_id", columnList = "customer_id"),
    @Index(name = "idx_schedule_vehicle_id", columnList = "vehicle_id"),
    @Index(name = "idx_schedule_scheduled_at", columnList = "scheduled_at"),
    @Index(name = "idx_schedule_status", columnList = "status")
})
public class Schedule extends BaseEntity {

    @Column(nullable = false)
    private Long customerId;

    @Column(nullable = false)
    private Long vehicleId;

    @Column(nullable = false)
    private Long serviceId;

    @Column(nullable = false)
    private LocalDateTime scheduledAt;

    @Column(nullable = false, length = 50)
    private String status;

    @Column
    private String notes;
}
