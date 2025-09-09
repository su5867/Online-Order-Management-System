package com.ooms.dto;

import com.ooms.entity.Role;

public class AuthResponse {

    private String token;
    private String role;
    private String name;
    private String email;

    public AuthResponse(String token, String role, String name, String email) {
        this.token = token;
        this.role = role;
        this.name = name;
        this.email = email;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
