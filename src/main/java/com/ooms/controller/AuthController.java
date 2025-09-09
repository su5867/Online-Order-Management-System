package com.ooms.controller;

import com.ooms.dto.AuthResponse;
import com.ooms.dto.LoginRequest;
import com.ooms.entity.User;
import com.ooms.service.UserService;
import com.ooms.config.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody User user) {
        if (userService.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest().body("Email already exists");
        }
        // Default role to CUSTOMER on registration
        user.setRole(com.ooms.entity.Role.CUSTOMER);
        User savedUser = userService.register(user);
        return ResponseEntity.ok(savedUser);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        User user = userService.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body("Invalid credentials");
        }
        String token = jwtUtil.generateToken(user.getEmail());
        return ResponseEntity.ok(new AuthResponse(token, user.getRole().toString(), user.getName(), user.getEmail()));
    }

    // Temporary endpoint for testing - remove in production
    @PostMapping("/promote/{email}")
    public ResponseEntity<String> promoteToAdmin(@PathVariable String email) {
        User user = userService.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(com.ooms.entity.Role.ADMIN);
        userService.save(user);
        return ResponseEntity.ok("User promoted to admin");
    }
}
