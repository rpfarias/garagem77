package com.garagem77.expense.service;

import com.garagem77.expense.entity.CategoryType;
import com.garagem77.expense.entity.ExpenseCategory;
import com.garagem77.expense.repository.ExpenseCategoryRepository;
import com.garagem77.expense.repository.ExpenseRepository;
import com.garagem77.shared.exception.BusinessRuleException;
import com.garagem77.shared.exception.DuplicateResourceException;
import com.garagem77.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ExpenseCategoryService {

    private final ExpenseCategoryRepository categoryRepository;
    private final ExpenseRepository expenseRepository;

    @Transactional(readOnly = true)
    public ExpenseCategory findByPublicId(UUID publicId) {
        return categoryRepository.findByPublicId(publicId)
            .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada: " + publicId));
    }

    @Transactional(readOnly = true)
    public List<ExpenseCategory> findAll() {
        return categoryRepository.findByActive(true);
    }

    @Transactional(readOnly = true)
    public List<ExpenseCategory> findByType(CategoryType type) {
        return categoryRepository.findByActiveAndType(true, type);
    }

    public ExpenseCategory create(String name, CategoryType type) {
        String trimmed = name.trim();
        if (categoryRepository.findByName(trimmed).isPresent()) {
            throw new DuplicateResourceException("Categoria já existe: " + trimmed);
        }

        ExpenseCategory category = ExpenseCategory.builder()
            .name(trimmed)
            .type(type)
            .active(true)
            .build();

        ExpenseCategory saved = categoryRepository.save(category);
        log.info("Categoria criada: {} ({})", saved.getName(), saved.getPublicId());
        return saved;
    }

    public ExpenseCategory update(UUID publicId, String name, CategoryType type) {
        ExpenseCategory category = findByPublicId(publicId);

        if (name != null) {
            String trimmed = name.trim();
            if (!trimmed.equals(category.getName())) {
                if (categoryRepository.findByName(trimmed).isPresent()) {
                    throw new DuplicateResourceException("Categoria já existe: " + trimmed);
                }
                category.setName(trimmed);
            }
        }

        if (type != null) {
            category.setType(type);
        }

        ExpenseCategory updated = categoryRepository.save(category);
        log.info("Categoria atualizada: {}", updated.getPublicId());
        return updated;
    }

    public void delete(UUID publicId) {
        ExpenseCategory category = findByPublicId(publicId);

        long count = expenseRepository.findByCategoryId(category.getId()).size();
        if (count > 0) {
            throw new BusinessRuleException("Não é possível deletar categoria com despesas associadas");
        }

        category.setActive(false);
        categoryRepository.save(category);
        log.info("Categoria desativada: {}", publicId);
    }
}
