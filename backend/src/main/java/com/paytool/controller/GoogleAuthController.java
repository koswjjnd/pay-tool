package com.paytool.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.HashMap;
import com.paytool.service.GoogleAuthService;
import com.paytool.dto.GoogleLoginRequest;

@RestController
@RequestMapping("/api/auth")
public class GoogleAuthController {

    @Value("${google.client.id}")
    private String clientId;

    private final GoogleAuthService googleAuthService;

    public GoogleAuthController(GoogleAuthService googleAuthService) {
        this.googleAuthService = googleAuthService;
    }

    @GetMapping("/google")
    public ResponseEntity<?> googleAuth(@AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            return ResponseEntity.badRequest().body("Not authenticated");
        }

        Map<String, Object> attributes = principal.getAttributes();
        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String picture = (String) attributes.get("picture");

        // TODO: 在这里处理用户信息，比如保存到数据库或生成 JWT token

        return ResponseEntity.ok(Map.of(
            "email", email,
            "name", name,
            "picture", picture
        ));
    }

    // @PostMapping("/google")
    // public ResponseEntity<?> googleLogin(@RequestBody GoogleLoginRequest request) {
    //     // ... 删除或注释
    // }
} 