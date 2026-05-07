package com.garagem77.reports.service;

import com.garagem77.customer.entity.Customer;
import com.garagem77.customer.entity.Vehicle;
import com.garagem77.customer.repository.CustomerRepository;
import com.garagem77.customer.repository.VehicleRepository;
import com.garagem77.inventory.entity.Product;
import com.garagem77.inventory.repository.ProductRepository;
import com.garagem77.reports.dto.DashboardSummary;
import com.garagem77.reports.dto.RecentScheduleItem;
import com.garagem77.reports.dto.TopServiceItem;
import com.garagem77.scheduling.entity.Schedule;
import com.garagem77.scheduling.repository.ScheduleRepository;
import com.garagem77.service.entity.Service;
import com.garagem77.service.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class ReportsService {

    private final CustomerRepository customerRepository;
    private final VehicleRepository vehicleRepository;
    private final ServiceRepository serviceRepository;
    private final ProductRepository productRepository;
    private final ScheduleRepository scheduleRepository;

    public DashboardSummary buildDashboard() {
        List<Customer> customers = customerRepository.findAll();
        List<Vehicle> vehicles = vehicleRepository.findAll().stream()
            .filter(v -> Boolean.TRUE.equals(v.getActive()))
            .collect(Collectors.toList());
        List<Service> services = serviceRepository.findByActive(true);
        List<Product> products = productRepository.findByActive(true);
        List<Schedule> schedules = scheduleRepository.findAll();

        // Schedule status counts
        Map<String, Long> schedulesByStatus = schedules.stream()
            .collect(Collectors.groupingBy(Schedule::getStatus, Collectors.counting()));
        // Ensure all statuses are present
        for (String s : new String[]{"SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"}) {
            schedulesByStatus.putIfAbsent(s, 0L);
        }

        // Inventory health
        long lowStockCount = products.stream()
            .filter(p -> p.getQuantityStock() <= p.getMinimumQuantity() && p.getQuantityStock() > 0)
            .count();
        long outOfStockCount = products.stream()
            .filter(p -> p.getQuantityStock() <= 0)
            .count();
        BigDecimal totalInventoryValue = products.stream()
            .map(p -> p.getUnitPrice().multiply(BigDecimal.valueOf(p.getQuantityStock())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Service stats
        BigDecimal avgPrice = BigDecimal.ZERO;
        BigDecimal maxPrice = BigDecimal.ZERO;
        BigDecimal minPrice = BigDecimal.ZERO;
        if (!services.isEmpty()) {
            BigDecimal sum = services.stream()
                .map(Service::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            avgPrice = sum.divide(BigDecimal.valueOf(services.size()), 2, java.math.RoundingMode.HALF_UP);
            maxPrice = services.stream().map(Service::getPrice).max(Comparator.naturalOrder()).orElse(BigDecimal.ZERO);
            minPrice = services.stream().map(Service::getPrice).min(Comparator.naturalOrder()).orElse(BigDecimal.ZERO);
        }

        return DashboardSummary.builder()
            .totalCustomers(customers.size())
            .totalVehicles(vehicles.size())
            .totalServices(services.size())
            .totalProducts(products.size())
            .totalSchedules(schedules.size())
            .schedulesByStatus(schedulesByStatus)
            .lowStockCount(lowStockCount)
            .outOfStockCount(outOfStockCount)
            .totalInventoryValue(totalInventoryValue)
            .averageServicePrice(avgPrice)
            .maxServicePrice(maxPrice)
            .minServicePrice(minPrice)
            .build();
    }

    public List<RecentScheduleItem> recentSchedules(int limit) {
        List<Schedule> all = scheduleRepository.findAll();
        return all.stream()
            .sorted(Comparator.comparing(Schedule::getScheduledAt).reversed())
            .limit(limit)
            .map(this::toRecentItem)
            .collect(Collectors.toList());
    }

    public List<TopServiceItem> topServices(int limit) {
        List<Schedule> schedules = scheduleRepository.findAll();
        // Aggregate bookings per service
        Map<Long, Long> bookingsByService = schedules.stream()
            .collect(Collectors.groupingBy(Schedule::getServiceId, Collectors.counting()));

        return bookingsByService.entrySet().stream()
            .map(entry -> {
                Service svc = serviceRepository.findById(entry.getKey()).orElse(null);
                if (svc == null) return null;
                long bookings = entry.getValue();
                BigDecimal revenue = svc.getPrice().multiply(BigDecimal.valueOf(bookings));
                return TopServiceItem.builder()
                    .id(svc.getPublicId())
                    .name(svc.getName())
                    .price(svc.getPrice())
                    .bookings(bookings)
                    .totalRevenue(revenue)
                    .build();
            })
            .filter(java.util.Objects::nonNull)
            .sorted(Comparator.comparingLong(TopServiceItem::getBookings).reversed())
            .limit(limit)
            .collect(Collectors.toList());
    }

    private RecentScheduleItem toRecentItem(Schedule s) {
        Customer c = customerRepository.findById(s.getCustomerId()).orElse(null);
        Vehicle v = vehicleRepository.findById(s.getVehicleId()).orElse(null);
        Service svc = serviceRepository.findById(s.getServiceId()).orElse(null);

        return RecentScheduleItem.builder()
            .id(s.getPublicId())
            .customerName(c != null ? c.getName() : null)
            .vehiclePlate(v != null ? v.getPlate() : null)
            .serviceName(svc != null ? svc.getName() : null)
            .servicePrice(svc != null ? svc.getPrice() : null)
            .status(s.getStatus())
            .scheduledAt(s.getScheduledAt())
            .build();
    }
}
