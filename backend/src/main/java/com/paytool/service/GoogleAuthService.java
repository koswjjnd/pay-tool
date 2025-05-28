package com.paytool.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.paytool.model.User;
import com.paytool.repository.UserRepository;
import com.paytool.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Optional;

@Service
public class GoogleAuthService {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final String googleClientId;

    public GoogleAuthService(
            UserRepository userRepository,
            JwtTokenProvider jwtTokenProvider,
            @Value("${spring.security.oauth2.client.registration.google.client-id}") String googleClientId) {
        this.userRepository = userRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.googleClientId = googleClientId;
    }

    @Transactional
    public String authenticateGoogleUser(String idTokenString) throws Exception {
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                GsonFactory.getDefaultInstance())
            .setAudience(Collections.singletonList(googleClientId))
            .build();

        GoogleIdToken idToken = verifier.verify(idTokenString);
        if (idToken == null) {
            throw new IllegalArgumentException("Invalid ID token.");
        }

        Payload payload = idToken.getPayload();
        String email = payload.getEmail();
        String name = (String) payload.get("name");
        String picture = (String) payload.get("picture");

        // Find or create user
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setName(name);
                    newUser.setUsername(email.split("@")[0] + System.currentTimeMillis());
                    // Set a secure random password
                    newUser.setPassword(java.util.UUID.randomUUID().toString());
                    return userRepository.save(newUser);
                });

        // Now generate your own JWT for your app:
        String jwt = jwtTokenProvider.generateToken(user);

        return jwt;
    }
} 