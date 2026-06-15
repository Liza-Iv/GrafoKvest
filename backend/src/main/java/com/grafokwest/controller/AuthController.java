package com.grafokwest.controller;

import com.grafokwest.config.JwtUtil;
import com.grafokwest.dto.LoginRequest;
import com.grafokwest.dto.RegisterRequest;
import com.grafokwest.model.User;
import com.grafokwest.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    public AuthController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            User user = userService.register(
                    request.getParentName(),
                    request.getEmail(),
                    request.getPassword(),
                    request.getRole(),
                    request.getChildName()
            );
            return ResponseEntity.ok(Map.of("message", "Регистрация успешна", "userId", user.getId()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            User user = userService.login(request.getEmail(), request.getPassword());

            // Создать настоящий JWT
            String token = jwtUtil.generateToken(user.getId());

            Map<String, Object> userMap = new LinkedHashMap<>();
            userMap.put("id", user.getId());
            userMap.put("email", user.getEmail());
            userMap.put("parentName", user.getFullName());
            userMap.put("role", user.getRole());
            userMap.put("childName", !user.getChildren().isEmpty()
                    ? user.getChildren().get(0).getName() : null);

            Map<String, Object> resp = new LinkedHashMap<>();
            resp.put("token", token);
            resp.put("user", userMap);
            return ResponseEntity.ok(resp);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}