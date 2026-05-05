package com.garagem77.auth.security;

import com.garagem77.auth.entity.User;
import com.garagem77.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> {
                log.warn("Usuário não encontrado: {}", email);
                return new UsernameNotFoundException("Usuário não encontrado com email: " + email);
            });

        if (!user.getActive()) {
            throw new UsernameNotFoundException("Usuário inativo: " + email);
        }

        return UserPrincipal.create(user);
    }

    @Transactional(readOnly = true)
    public UserDetails loadUserById(Long userId) throws UsernameNotFoundException {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> {
                log.warn("Usuário não encontrado: {}", userId);
                return new UsernameNotFoundException("Usuário não encontrado com ID: " + userId);
            });

        return UserPrincipal.create(user);
    }
}
