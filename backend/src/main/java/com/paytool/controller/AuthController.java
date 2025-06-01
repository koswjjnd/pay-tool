package com.paytool.controller;

import com.paytool.dto.GoogleLoginRequest;
import com.paytool.service.GoogleAuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final GoogleAuthService googleAuthService;

    public AuthController(GoogleAuthService googleAuthService) {
        this.googleAuthService = googleAuthService;
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody GoogleLoginRequest request) {
        try {
            Map<String, Object> authResponse = googleAuthService.authenticateGoogleUser(request.getCredential());
            return ResponseEntity.ok(authResponse);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Invalid Google token: " + e.getMessage());
        }
    }
} 