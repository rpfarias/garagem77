package com.garagem77.reports.controller;

import com.garagem77.reports.dto.DashboardSummary;
import com.garagem77.reports.dto.ExpensesByCategoryItem;
import com.garagem77.reports.dto.ExpensesByMonthItem;
import com.garagem77.reports.dto.RecentScheduleItem;
import com.garagem77.reports.dto.TopServiceItem;
import com.garagem77.reports.service.ReportsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
@Tag(name = "Relatórios", description = "Endpoints de agregação e métricas do sistema")
public class ReportsController {

    private final ReportsService reportsService;

    @GetMapping("/dashboard")
    @Operation(summary = "Dashboard com métricas gerais",
        description = "Retorna contadores totais, distribuição de agendamentos por status, saúde do estoque e estatísticas de serviços")
    public ResponseEntity<DashboardSummary> dashboard() {
        return ResponseEntity.ok(reportsService.buildDashboard());
    }

    @GetMapping("/recent-schedules")
    @Operation(summary = "Agendamentos recentes",
        description = "Lista os agendamentos mais recentes ordenados por data desc")
    public ResponseEntity<List<RecentScheduleItem>> recentSchedules(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(reportsService.recentSchedules(limit));
    }

    @GetMapping("/top-services")
    @Operation(summary = "Top serviços por agendamentos",
        description = "Retorna os serviços mais agendados com receita estimada")
    public ResponseEntity<List<TopServiceItem>> topServices(
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(reportsService.topServices(limit));
    }

    @GetMapping("/expenses-by-category")
    @Operation(summary = "Despesas agregadas por categoria",
        description = "Soma das despesas por categoria no período. Default: mês corrente.")
    public ResponseEntity<List<ExpensesByCategoryItem>> expensesByCategory(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        LocalDate today = LocalDate.now();
        LocalDate effectiveStart = (start != null) ? start : today.withDayOfMonth(1);
        LocalDate effectiveEnd = (end != null) ? end : today.withDayOfMonth(today.lengthOfMonth());
        return ResponseEntity.ok(reportsService.expensesByCategory(effectiveStart, effectiveEnd));
    }

    @GetMapping("/expenses-by-month")
    @Operation(summary = "Série temporal de despesas por mês",
        description = "Retorna últimos N meses com totais por OPEX e Infraestrutura")
    public ResponseEntity<List<ExpensesByMonthItem>> expensesByMonth(
            @RequestParam(defaultValue = "12") int months) {
        return ResponseEntity.ok(reportsService.expensesByMonth(months));
    }
}
