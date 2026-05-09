package com.garagem77.expense.repository;

import com.garagem77.expense.entity.CategoryType;
import com.garagem77.expense.entity.ExpenseCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ExpenseCategoryRepository extends JpaRepository<ExpenseCategory, Long> {

    Optional<ExpenseCategory> findByPublicId(UUID publicId);

    Optional<ExpenseCategory> findByName(String name);

    List<ExpenseCategory> findByActive(Boolean active);

    List<ExpenseCategory> findByActiveAndType(Boolean active, CategoryType type);
}
