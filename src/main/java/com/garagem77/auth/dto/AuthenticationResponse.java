package com.garagem77.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthenticationResponse {

    private String token;
    private String type;
    private long expiresIn;
    private String email;
    private String role;
    private UUID publicId;
    private Long companyId;

    public static AuthenticationResponse of(String token, String email, String role, UUID publicId, Long companyId, long expiresIn) {
        return AuthenticationResponse.builder()
            .token(token)
            .type("Bearer")
            .expiresIn(expiresIn)
            .email(email)
            .role(role)
            .publicId(publicId)
            .companyId(companyId)
            .build();
    }
}
