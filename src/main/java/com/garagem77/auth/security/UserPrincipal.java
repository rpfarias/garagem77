package com.garagem77.auth.security;

import com.garagem77.auth.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.UUID;

public class UserPrincipal implements UserDetails {

    private Long id;
    private UUID publicId;
    private String email;
    private String password;
    private String role;
    private Long companyId;
    private Boolean active;
    private Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(Long id, UUID publicId, String email, String password, String role, Long companyId, Boolean active, Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.publicId = publicId;
        this.email = email;
        this.password = password;
        this.role = role;
        this.companyId = companyId;
        this.active = active;
        this.authorities = authorities;
    }

    public static UserPrincipal create(User user) {
        GrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + user.getRole());

        return new UserPrincipal(
            user.getId(),
            user.getPublicId(),
            user.getEmail(),
            user.getPassword(),
            user.getRole(),
            user.getCompanyId(),
            user.getActive(),
            Collections.singletonList(authority)
        );
    }

    public Long getId() {
        return id;
    }

    public UUID getPublicId() {
        return publicId;
    }

    public String getRole() {
        return role;
    }

    public Long getCompanyId() {
        return companyId;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return active;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return active;
    }
}
