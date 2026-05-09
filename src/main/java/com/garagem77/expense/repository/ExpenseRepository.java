package com.garagem77.expense.repository;

import com.garagem77.expense.entity.Expense;
import com.garagem77.expense.entity.ExpenseStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    Optional<Expense> findByPublicId(UUID publicId);

    List<Expense> findByCategoryId(Long categoryId);

    List<Expense> findByPaymentStatus(ExpenseStatus paymentStatus);

    List<Expense> findByExpenseDateBetween(LocalDate start, LocalDate end);

    Page<Expense> findByExpenseDateBetween(LocalDate start, LocalDate end, Pageable pageable);

    Page<Expense> findByPaymentStatusAndExpenseDateBetween(ExpenseStatus paymentStatus, LocalDate start, LocalDate end, Pageable pageable);

    Page<Expense> findByCategoryIdAndExpenseDateBetween(Long categoryId, LocalDate start, LocalDate end, Pageable pageable);
}
