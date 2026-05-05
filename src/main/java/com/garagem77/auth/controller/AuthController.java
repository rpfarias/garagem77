package com.garagem77.auth.controller;

import com.garagem77.auth.dto.AuthenticationRequest;
import com.garagem77.auth.dto.AuthenticationResponse;
import com.garagem77.auth.security.JwtTokenProvider;
import com.garagem77.auth.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> login(@Valid @RequestBody AuthenticationRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

            String token = tokenProvider.generateToken(authentication);
            long expiresIn = tokenProvider.getExpirationTime();

            AuthenticationResponse response = new AuthenticationResponse(
                token,
                "Bearer",
                expiresIn,
                userPrincipal.getUsername(),
                userPrincipal.getRole(),
                userPrincipal.getPublicId(),
                userPrincipal.getCompanyId()
            );

            log.info("Usuário {} autenticado com sucesso", request.getEmail());
            return ResponseEntity.ok(response);

        } catch (AuthenticationException ex) {
            log.warn("Falha na autenticação para usuário: {}", request.getEmail());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }
}
