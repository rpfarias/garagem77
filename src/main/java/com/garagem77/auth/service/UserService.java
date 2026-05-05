package com.garagem77.auth.service;

import com.garagem77.auth.entity.User;
import com.garagem77.auth.repository.UserRepository;
import com.garagem77.shared.exception.BusinessRuleException;
import com.garagem77.shared.exception.DuplicateResourceException;
import com.garagem77.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public User findByPublicId(UUID publicId) {
        return userRepository.findByPublicId(publicId)
            .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado: " + publicId));
    }

    @Transactional(readOnly = true)
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado: " + email));
    }

    @Transactional(readOnly = true)
    public List<User> findByCompanyId(Long companyId) {
        return userRepository.findByCompanyId(companyId);
    }

    public User create(String email, String password, String name, String role, Long companyId) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new DuplicateResourceException("Email já existe: " + email);
        }

        if (userRepository.findByEmailAndCompanyId(email, companyId).isPresent()) {
            throw new DuplicateResourceException("Usuário já existe nesta empresa: " + email);
        }

        if (password == null || password.length() < 6) {
            throw new BusinessRuleException("Senha deve ter no mínimo 6 caracteres");
        }

        User user = User.builder()
            .email(email)
            .password(passwordEncoder.encode(password))
            .name(name)
            .role(role)
            .companyId(companyId)
            .active(true)
            .build();

        User saved = userRepository.save(user);
        log.info("Usuário criado: {} ({})", saved.getEmail(), saved.getPublicId());
        return saved;
    }

    public User update(UUID publicId, String name, String email) {
        User user = findByPublicId(publicId);

        if (email != null && !email.equals(user.getEmail())) {
            if (userRepository.findByEmail(email).isPresent()) {
                throw new DuplicateResourceException("Email já existe: " + email);
            }
            user.setEmail(email);
        }

        if (name != null) user.setName(name);

        User updated = userRepository.save(user);
        log.info("Usuário atualizado: {}", updated.getPublicId());
        return updated;
    }

    public void changePassword(UUID publicId, String oldPassword, String newPassword) {
        User user = findByPublicId(publicId);

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new BusinessRuleException("Senha antiga está incorreta");
        }

        if (newPassword == null || newPassword.length() < 6) {
            throw new BusinessRuleException("Nova senha deve ter no mínimo 6 caracteres");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        log.info("Senha alterada para: {}", user.getPublicId());
    }

    public void toggleActive(UUID publicId) {
        User user = findByPublicId(publicId);
        user.setActive(!user.getActive());
        userRepository.save(user);
        log.info("Status do usuário alterado para: {}", user.getActive());
    }
}
