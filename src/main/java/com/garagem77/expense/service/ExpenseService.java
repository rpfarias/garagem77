package com.garagem77.expense.service;

import com.garagem77.expense.entity.Expense;
import com.garagem77.expense.entity.ExpenseCategory;
import com.garagem77.expense.entity.ExpenseStatus;
import com.garagem77.expense.entity.PaymentMethod;
import com.garagem77.expense.repository.ExpenseRepository;
import com.garagem77.shared.exception.BusinessRuleException;
import com.garagem77.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final ExpenseCategoryService categoryService;

    @Transactional(readOnly = true)
    public Expense findByPublicId(UUID publicId) {
        return expenseRepository.findByPublicId(publicId)
            .orElseThrow(() -> new ResourceNotFoundException("Despesa não encontrada: " + publicId));
    }

    @Transactional(readOnly = true)
    public Page<Expense> findByPeriod(LocalDate start, LocalDate end, Pageable pageable) {
        return expenseRepository.findByExpenseDateBetween(start, end, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Expense> findByPeriodAndStatus(LocalDate start, LocalDate end, ExpenseStatus status, Pageable pageable) {
        return expenseRepository.findByPaymentStatusAndExpenseDateBetween(status, start, end, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Expense> findByPeriodAndCategory(LocalDate start, LocalDate end, UUID categoryPublicId, Pageable pageable) {
        ExpenseCategory category = categoryService.findByPublicId(categoryPublicId);
        return expenseRepository.findByCategoryIdAndExpenseDateBetween(category.getId(), start, end, pageable);
    }

    @Transactional(readOnly = true)
    public List<Expense> findByPeriod(LocalDate start, LocalDate end) {
        return expenseRepository.findByExpenseDateBetween(start, end);
    }

    /**
     * ATRASADO is derived: status PENDENTE with dueDate before today.
     * Reject explicit ATRASADO from clients to avoid divergence.
     */
    public Expense create(String supplier, String description, LocalDate expenseDate, LocalDate dueDate,
                          BigDecimal amount, PaymentMethod paymentMethod, ExpenseStatus paymentStatus,
                          UUID categoryPublicId) {
        rejectAtrasado(paymentStatus);
        ExpenseCategory category = categoryService.findByPublicId(categoryPublicId);

        Expense expense = Expense.builder()
            .supplier(supplier.trim())
            .description(description)
            .expenseDate(expenseDate)
            .dueDate(dueDate)
            .amount(amount)
            .paymentMethod(paymentMethod)
            .paymentStatus(paymentStatus)
            .categoryId(category.getId())
            .build();

        Expense saved = expenseRepository.save(expense);
        log.info("Despesa criada: {} ({}) - {}", saved.getSupplier(), saved.getPublicId(), saved.getAmount());
        return saved;
    }

    public Expense update(UUID publicId, String supplier, String description, LocalDate expenseDate, LocalDate dueDate,
                          BigDecimal amount, PaymentMethod paymentMethod, ExpenseStatus paymentStatus,
                          UUID categoryPublicId) {
        Expense expense = findByPublicId(publicId);

        if (supplier != null) expense.setSupplier(supplier.trim());
        if (description != null) expense.setDescription(description);
        if (expenseDate != null) expense.setExpenseDate(expenseDate);
        if (dueDate != null) expense.setDueDate(dueDate);
        if (amount != null) expense.setAmount(amount);
        if (paymentMethod != null) expense.setPaymentMethod(paymentMethod);
        if (paymentStatus != null) {
            rejectAtrasado(paymentStatus);
            expense.setPaymentStatus(paymentStatus);
        }
        if (categoryPublicId != null) {
            ExpenseCategory category = categoryService.findByPublicId(categoryPublicId);
            expense.setCategoryId(category.getId());
        }

        Expense updated = expenseRepository.save(expense);
        log.info("Despesa atualizada: {}", updated.getPublicId());
        return updated;
    }

    public void delete(UUID publicId) {
        Expense expense = findByPublicId(publicId);
        expenseRepository.delete(expense);
        log.info("Despesa removida: {}", publicId);
    }

    /**
     * Computes the effective status: PENDENTE with dueDate < today becomes ATRASADO.
     */
    public ExpenseStatus effectiveStatus(Expense expense) {
        if (expense.getPaymentStatus() == ExpenseStatus.PENDENTE
            && expense.getDueDate() != null
            && expense.getDueDate().isBefore(LocalDate.now())) {
            return ExpenseStatus.ATRASADO;
        }
        return expense.getPaymentStatus();
    }

    private void rejectAtrasado(ExpenseStatus status) {
        if (status == ExpenseStatus.ATRASADO) {
            throw new BusinessRuleException(
                "Status ATRASADO é derivado automaticamente; informe PENDENTE, PAGO ou CANCELADO");
        }
    }
}
